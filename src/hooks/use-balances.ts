import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSigner } from '@/src/hooks/use-signer';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { Framework } from '@superfluid-finance/sdk-core';
import { getTokenPairBySymbol, formatTokenAmount, getCurrentNetworkConfig } from '@/src/utils/tokenRegistry';
import { env } from '@/src/env.mjs';
import { useChain } from '@/src/app/context/ChainContext';
import React, { useEffect } from 'react';

interface BalanceData {
    nativeToken: string;
    superToken: string;
    address: string;
    nativeTokenSymbol: string;
    superTokenSymbol: string;
}

const fetchBalances = async (signer: any, provider: any, tokenSymbol?: string, chainId?: number): Promise<BalanceData> => {
    if (!signer || !provider) {
        throw new Error('Signer or provider not available');
    }

    try {
        const userAddress = await signer.getAddress();
        const networkConfig = getCurrentNetworkConfig(chainId);

        if (!networkConfig) {
            throw new Error(`Network configuration not found for chainId: ${chainId}`);
        }

        // Use provided token symbol or default to first available
        const availableTokens = Object.keys(networkConfig.tokens);
        if (availableTokens.length === 0) {
            throw new Error(`No tokens available for chainId: ${chainId}`);
        }

        const targetSymbol = tokenSymbol || availableTokens[0];
        const tokenPair = getTokenPairBySymbol(targetSymbol, chainId);

        if (!tokenPair) {
            throw new Error(`Token pair not found for symbol: ${targetSymbol} on chainId: ${chainId}`);
        }

        // Fetch native token balance (ETH or ERC20)
        let nativeTokenBalanceWei: string;

        if (tokenPair.nativeToken.symbol === 'ETH') {
            // For ETH, get native balance
            const ethBalanceWei = await provider.getBalance(userAddress);
            nativeTokenBalanceWei = ethBalanceWei.toString();
        } else {
            // For ERC20 tokens, fetch from contract
            const erc20Abi = ['function balanceOf(address owner) view returns (uint256)'];
            const erc20Contract = new (await import('ethers')).Contract(
                tokenPair.nativeToken.address,
                erc20Abi,
                provider
            );
            const erc20Balance = await erc20Contract.balanceOf(userAddress);
            nativeTokenBalanceWei = erc20Balance.toString();
        }

        const nativeTokenBalanceFormatted = formatTokenAmount(nativeTokenBalanceWei, tokenPair.nativeToken.decimals);

        // Fetch super token balance using Superfluid Framework
        const sf = await Framework.create({
            chainId: tokenPair.chainId,
            provider: provider
        });

        const superToken = await sf.loadSuperToken(tokenPair.superToken.address);
        const superTokenBalanceWei = await superToken.balanceOf({
            account: userAddress,
            providerOrSigner: provider
        });

        const superTokenBalanceFormatted = formatTokenAmount(superTokenBalanceWei, tokenPair.superToken.decimals);

        return {
            nativeToken: nativeTokenBalanceFormatted,
            superToken: superTokenBalanceFormatted,
            address: userAddress,
            nativeTokenSymbol: tokenPair.nativeToken.symbol,
            superTokenSymbol: tokenPair.superToken.symbol
        };
    } catch (error) {
        console.error('Error fetching balances:', error);
        throw new Error(`Failed to fetch balances for chainId ${chainId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const useBalances = (tokenSymbol?: string) => {
    const { wallets } = useWallets();
    const { authenticated, ready } = usePrivy();
    const { signer } = useSigner(wallets);
    const provider = signer?.provider;
    const { activeChain } = useChain();
    const queryClient = useQueryClient();

    // Create a stable query key that includes all necessary parameters
    const queryKey = React.useMemo(() => [
        'balances',
        signer?.getAddress?.(),
        provider?.connection?.url,
        env.NEXT_PUBLIC_NETWORK,
        tokenSymbol,
        activeChain?.chainId
    ], [signer?.getAddress, provider?.connection?.url, tokenSymbol, activeChain?.chainId]);

    // Invalidate all balance queries when chain changes
    useEffect(() => {
        if (activeChain?.chainId) {
            // Invalidate all balance queries to ensure fresh data
            queryClient.invalidateQueries({
                queryKey: ['balances']
            });
        }
    }, [activeChain?.chainId, queryClient]);

    // Also invalidate when signer or provider changes
    useEffect(() => {
        queryClient.invalidateQueries({
            queryKey: ['balances']
        });
    }, [signer?.getAddress, provider?.connection?.url, queryClient]);

    const {
        data: balances,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey,
        queryFn: () => fetchBalances(signer, provider, tokenSymbol, activeChain?.chainId),
        enabled: !!ready && !!authenticated && !!signer && !!provider && !!activeChain?.chainId,
        staleTime: 1000 * 30, // 30 seconds
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: (failureCount, error) => {
            // Retry up to 3 times, but don't retry on network configuration errors
            if (failureCount >= 3) return false;
            if (error instanceof Error && error.message.includes('Network configuration not found')) return false;
            if (error instanceof Error && error.message.includes('Token pair not found')) return false;
            return true;
        },
        retryDelay: 1000,
    });

    // Get token configuration for current network
    const networkConfig = getCurrentNetworkConfig(activeChain?.chainId);
    const availableTokens = networkConfig ? Object.keys(networkConfig.tokens) : [];
    const targetSymbol = tokenSymbol || (availableTokens.length > 0 ? availableTokens[0] : 'USDC');
    const tokenPair = getTokenPairBySymbol(targetSymbol, activeChain?.chainId);

    return {
        // Legacy properties for backward compatibility
        eth: balances?.nativeToken || '0',
        ethx: balances?.superToken || '0',

        // New generic properties
        nativeToken: balances?.nativeToken || '0',
        superToken: balances?.superToken || '0',
        nativeTokenSymbol: balances?.nativeTokenSymbol || tokenPair?.nativeToken?.symbol || 'ETH',
        superTokenSymbol: balances?.superTokenSymbol || tokenPair?.superToken?.symbol || 'USDCx',

        // Metadata
        isLoading: isLoading, // Show loading when switching networks
        error: error ? (error instanceof Error ? error.message : 'Failed to fetch balances') : null,
        hasWallet: wallets.length > 0,
        refetch,

        // Token configuration (legacy compatibility)
        tokenConfig: tokenPair,

        // Chain information
        chainId: activeChain?.chainId,
        isChainSupported: !!networkConfig,
    };
}; 