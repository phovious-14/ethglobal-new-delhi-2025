import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createStream } from "@/src/api/routers/stream";
import { useWallets } from '@privy-io/react-auth';
import { useSigner } from '@/src/hooks/use-signer';
import { useBalances } from '@/src/hooks/use-balances';
import { useChain } from '@/src/app/context/ChainContext';
import { Framework } from '@superfluid-finance/sdk-core';
import { ethers } from 'ethers';
import { env } from '@/src/env.mjs';
import { useToast } from '@/src/hooks/use-toast';
import { validateAddress } from "@/src/utils/validateAddress";
import { validateAmount } from "@/src/utils/validateAmount";
import { stopStream } from "@/src/api/routers/stream";
import { useCallback } from 'react';
import { invalidateStreamQueries } from '@/src/utils/queryInvalidation';

interface Stream {
    payrollName: string;
    senderWalletAddress: string;
    receiverName: string;
    receiverWalletAddress: string;
    amount: string;
    flowRate: string;
    streamStartTime: string;
    accessToken: string;
    streamStartTxHash: string;
    flowRateUnit: string;
    tokenSymbol: "PYUSDx";
    chainId: string;
}

export interface StopStream {
    id: string;
    accessToken: string;
    streamStoppedTxHash: string;
    documentUrl: string;
    invoiceNumber: string;
    streamEndTime: string;
}

interface SuperfluidTransferParams {
    recipientAddress: string;
    amount: string;
    superTokenAddr: string;
    decimals?: number;
}

export const useStream = () => {
    const { wallets } = useWallets();
    const { signer } = useSigner(wallets);
    const provider = signer?.provider;
    const balances = useBalances();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { activeChain } = useChain();

    // API mutation for backend stream creation
    const { mutateAsync: createStreamAsync, isPending, error } = useMutation({
        mutationFn: (stream: Stream) => createStream(stream),
        onSuccess: (data) => {
            // Invalidate all stream-related queries to refresh the data
            invalidateStreamQueries(queryClient);
            return data;
        },
        onError: (error) => {
            console.error("Error creating stream:", error);
            return error;
        },
    });

    // Superfluid transfer mutation
    const { mutateAsync: createSuperfluidStreamAsync, isPending: isSuperfluidTransferPending, error: superfluidTransferError } = useMutation({
        mutationFn: async ({ recipientAddress, amount, superTokenAddr, decimals }: SuperfluidTransferParams) => {
            if (!signer || !provider) {
                throw new Error('Wallet not connected');
            }

            try {
                // Validate inputs
                const recipientError = validateAddress(recipientAddress);

                if (recipientError) {
                    throw new Error(recipientError);
                }

                // Initialize Superfluid Framework
                const sf = await Framework.create({
                    chainId: activeChain.chainId,
                    provider: provider
                });

                const superTokenAddress = superTokenAddr || env.NEXT_PUBLIC_SUPERTOKEN || '';

                if (!superTokenAddress) {
                    throw new Error('Super token address not configured');
                }
                const fTok = await sf.loadSuperToken(superTokenAddress);
                let balance: any = await fTok.balanceOf({
                    account: await signer.getAddress(),
                    providerOrSigner: signer
                });

                if (balance === "0") {
                    throw new Error(`Insufficient ${superTokenAddress} balance`);
                }

                const createFlowOperation = sf.cfaV1.createFlow({
                    superToken: superTokenAddress,
                    sender: await signer.getAddress(),
                    receiver: recipientAddress,
                    flowRate: amount
                });

                const tx = await createFlowOperation.exec(signer);

                // Wait for transaction confirmation
                const receipt = await tx.wait();

                toast({
                    title: "Stream Activated",
                    description: `Transaction successful: ${tx.hash.slice(0, 10)}...`,
                });

                setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ['balances', signer?.getAddress?.(), provider?.connection?.url, env.NEXT_PUBLIC_NETWORK] });
                }, 1000);

                return {
                    success: true,
                    transactionHash: tx?.hash || "",
                    amount,
                    receipt,
                    recipientAddress,
                    tokenSymbol: balances.superTokenSymbol
                };
            } catch (error) {
                console.error('Stream error:', error);
                toast({
                    title: "Streams Failed",
                    description: error instanceof Error ? error.message : `Failed to create stream`,
                    variant: "destructive"
                });
            }
        },
        onSuccess: (data) => {
            // Invalidate all stream-related queries to refresh the data
            invalidateStreamQueries(queryClient);
            return data;
        },
        onError: (error: Error) => {
            console.error('Stream error:', error);
            toast({
                title: "Stream Failed",
                description: error.message || `Failed to create stream`,
                variant: "destructive"
            });
        }
    });

    const { mutateAsync: stopStreamAsync, isPending: isStopStreamPending, error: stopStreamError } = useMutation({
        mutationFn: async (stream: StopStream) => {
            return stopStream({
                id: stream.id,
                accessToken: stream.accessToken,
                streamStoppedTxHash: stream.streamStoppedTxHash,
                documentUrl: stream.documentUrl,
                invoiceNumber: stream.invoiceNumber,
                streamEndTime: stream.streamEndTime
            });
        },
        onSuccess: (data) => {
            // Invalidate all stream-related queries to refresh the data
            invalidateStreamQueries(queryClient);
            return data;
        },
        onError: (error: Error) => {
            console.error('Stream error:', error);
        }
    });
    const { mutateAsync: stopSuperfluidStreamAsync, isPending: isStopSuperfluidTransferPending, error: stopSuperfluidTransferError } = useMutation({
        mutationFn: async ({ recipientAddress, amount, superTokenAddr, decimals }: SuperfluidTransferParams) => {
            if (!signer || !provider) {
                throw new Error('Wallet not connected');
            }

            try {
                // Validate inputs
                const recipientError = validateAddress(recipientAddress);

                if (recipientError) {
                    throw new Error(recipientError);
                }

                // Initialize Superfluid Framework
                const sf = await Framework.create({
                    chainId: activeChain.chainId,
                    provider: provider
                });

                const superTokenAddress = superTokenAddr || env.NEXT_PUBLIC_SUPERTOKEN || '';
                if (!superTokenAddress) {
                    throw new Error('Super token address not configured');
                }
                const deleteFlowOperation = sf.cfaV1.deleteFlow({
                    superToken: superTokenAddress,
                    sender: await signer.getAddress(),
                    receiver: recipientAddress
                });

                const tx = await deleteFlowOperation.exec(signer);

                // Wait for transaction confirmation
                const receipt = await tx.wait();

                toast({
                    title: "Stream Deactivated",
                });

                setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ['balances', signer?.getAddress?.(), provider?.connection?.url, env.NEXT_PUBLIC_NETWORK] });
                }, 1000);

                return {
                    success: true,
                    transactionHash: tx?.hash || "",
                    amount,
                    receipt,
                    recipientAddress,
                    tokenSymbol: balances.superTokenSymbol
                };
            } catch (error) {
                console.error('Stream error:', error);
                toast({
                    title: "Streams Failed",
                    description: error instanceof Error ? error.message : `Failed to create stream`,
                    variant: "destructive"
                });
            }
        },
        onSuccess: (data) => {
            // Invalidate all stream-related queries to refresh the data
            invalidateStreamQueries(queryClient);
            return data;
        },
        onError: (error: Error) => {
            console.error('Stream error:', error);
            toast({
                title: "Stream Failed",
                description: error.message || `Failed to create stream`,
                variant: "destructive"
            });
        }
    });

    // Caches buffer amounts for (flowRate, superTokenAddress) pairs within the session to avoid redundant contract calls
    const bufferCache = new Map<string, string>();
    const getBufferAmountByFlowRates = useCallback(
        async (flowRate: string | number, superTokenAddress?: string): Promise<string | null> => {
            if (!signer || !provider) {
                throw new Error('Wallet not connected');
            }
            try {
                const flowRateStr = typeof flowRate === 'string' ? flowRate : String(flowRate);
                const tokenAddr = superTokenAddress || env.NEXT_PUBLIC_SUPERTOKEN;
                const cacheKey = `${tokenAddr}:${flowRateStr}`;
                if (bufferCache.has(cacheKey)) {
                    return bufferCache.get(cacheKey)!;
                }
                // Use CFAv1Forwarder contract and correct ABI
                const abi = [
                    'function getBufferAmountByFlowrate(address token, int96 flowRate) view returns (uint256)'
                ];
                const contract = new ethers.Contract("0xcfA132E353cB4E398080B9700609bb008eceB125", abi, provider);
                const bufferAmount = await contract.getBufferAmountByFlowrate(tokenAddr, flowRateStr);
                const bufferAmountStr = bufferAmount ? String(bufferAmount) : null;
                if (bufferAmountStr) {
                    bufferCache.set(cacheKey, bufferAmountStr);
                }
                return bufferAmountStr;
            } catch (err) {
                console.error('Failed to get buffer amount by flow rate:', err);
                return null;
            }
        }, [signer, provider]);

    return {
        createStreamAsync,
        isPending,
        error,
        stopStreamAsync,
        isStopStreamPending,
        stopStreamError,
        createSuperfluidStreamAsync,
        isSuperfluidTransferPending,
        superfluidTransferError,
        stopSuperfluidStreamAsync,
        isStopSuperfluidTransferPending,
        stopSuperfluidTransferError,
        getBufferAmountByFlowRates,
    };
}

// React Query hook for buffer amount
export function useBufferAmount(flowRate: string | undefined, superTokenAddress?: string) {
    const { wallets } = useWallets();
    const { signer } = useSigner(wallets);
    const provider = signer?.provider;

    return useQuery({
        queryKey: ['bufferAmount', flowRate, superTokenAddress, signer?.getAddress?.()],
        queryFn: async () => {
            if (!flowRate || !signer || !provider) {
                return null;
            }

            try {
                const flowRateStr = flowRate || '';
                const tokenAddr = superTokenAddress || env.NEXT_PUBLIC_SUPERTOKEN;

                // Use CFAv1Forwarder contract and correct ABI
                const abi = [
                    'function getBufferAmountByFlowrate(address token, int96 flowRate) view returns (uint256)'
                ];
                const contract = new ethers.Contract("0xcfA132E353cB4E398080B9700609bb008eceB125", abi, provider);
                const bufferAmount = await contract.getBufferAmountByFlowrate(tokenAddr, flowRateStr);
                return bufferAmount ? String(bufferAmount) : null;
            } catch (err) {
                console.error('Failed to get buffer amount by flow rate:', err);
                return null;
            }
        },
        enabled: !!flowRate && !!signer && !!provider,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}