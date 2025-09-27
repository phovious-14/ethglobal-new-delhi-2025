import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInstant } from "@/src/api/routers/instant";
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
import { invalidateInstantQueries } from '@/src/utils/queryInvalidation';

interface Instant {
    payrollName: string;
    senderWalletAddress: string;
    receiverName: string;
    receiverWalletAddress: string;
    amount: string;
    chainId: string;
    txHash: string;
    accessToken: string;
    documentUrl: string;
    invoiceNumber: string;
    tokenSymbol: "USDCx" | "USDTx" | "ETHx" | "DAIx" | "PYUSDx";
}

interface SuperfluidTransferParams {
    recipientAddress: string;
    amount: string;
    superTokenAddr: string;
    decimals?: number;
}

export const useInstant = () => {
    const { wallets } = useWallets();
    const { signer } = useSigner(wallets);
    const provider = signer?.provider;
    const balances = useBalances();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { activeChain } = useChain();

    // API mutation for backend instant creation
    const { mutateAsync: createInstantAsync, isPending, error } = useMutation({
        mutationFn: (instant: Instant) => createInstant(instant),
        onSuccess: (data) => {
            // Invalidate all instant-related queries to refresh the data
            invalidateInstantQueries(queryClient);
            return data;
        },
        onError: (error) => {
            console.error("Error creating instant:", error);
            return error;
        },
    });

    // Superfluid transfer mutation
    const { mutateAsync: createSuperfluidInstantAsync, isPending: isSuperfluidTransferPending, error: superfluidTransferError } = useMutation({
        mutationFn: async ({ recipientAddress, amount, superTokenAddr, decimals }: SuperfluidTransferParams) => {
            if (!signer || !provider) {
                throw new Error('Wallet not connected');
            }

            // Validate inputs
            const recipientError = validateAddress(recipientAddress);
            const amountError = validateAmount(amount, balances);

            if (recipientError || amountError) {
                throw new Error(recipientError || amountError);
            }

            // Initialize Superfluid Framework
            const sf = await Framework.create({
                chainId: activeChain.chainId,
                provider: provider
            });

            // Load the Super Token - use provided address or default
            const superTokenAddress = superTokenAddr || env.NEXT_PUBLIC_SUPERTOKEN || '';
            if (!superTokenAddress) {
                throw new Error('Super token address not configured');
            }
            const superToken = await sf.loadSuperToken(superTokenAddress);

            // Convert amount to smallest unit based on token decimals
            const tokenConfig = balances.tokenConfig;
            const targetDecimals = decimals || tokenConfig.superToken.decimals;
            const amountInSmallestUnit = (Number(amount) * Math.pow(10, targetDecimals)).toString();

            // Use transfer to transfer Super Token
            const transferOperation = superToken.transfer({
                receiver: recipientAddress,
                amount: amountInSmallestUnit
            });

            // Execute the transfer
            const tx = await transferOperation.exec(signer);

            // Wait for transaction confirmation
            const receipt = await tx.wait();

            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['balances', signer?.getAddress?.(), provider?.connection?.url, env.NEXT_PUBLIC_NETWORK] });
            }, 1000);

            return {
                success: true,
                transactionHash: tx.hash,
                receipt,
                amount,
                recipientAddress,
                tokenSymbol: balances.superTokenSymbol
            };
        },
        onSuccess: (data) => {
            // Invalidate all instant-related queries to refresh the data
            invalidateInstantQueries(queryClient);
            return data;
        },
        onError: (error: Error) => {
            console.error('Transfer error:', error);
            toast({
                title: "Transfer Failed",
                description: error.message || `Failed to transfer ${balances.superTokenSymbol}`,
                variant: "destructive"
            });
        }
    });

    return {
        createInstantAsync,
        isPending,
        error,
        createSuperfluidInstantAsync,
        isSuperfluidTransferPending,
        superfluidTransferError
    };
}