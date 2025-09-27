'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import {
    getAllNetworks,
    getNetworkByChainId,
    NetworkConfig
} from '@/src/utils/tokenRegistry';
import { env } from '@/src/env.mjs';

interface ChainContextType {
    activeChain: NetworkConfig;
    setActiveChain: (chainId: number) => void;
    supportedChains: NetworkConfig[];
    isLoading: boolean;
    switchChain: (chainId: number) => Promise<void>;
    isSwitching: boolean;
}

const ChainContext = createContext<ChainContextType | null>(null);

interface ChainProviderProps {
    children: ReactNode;
    defaultChainId?: number;
}

export const ChainProvider: React.FC<ChainProviderProps> = ({
    children,
    defaultChainId
}) => {
    const { chainId } = useAccount();
    const { switchChain: wagmiSwitchChain, isPending: isSwitchPending } = useSwitchChain();
    const [supportedChains] = useState<NetworkConfig[]>(getAllNetworks());
    const [activeChain, setActiveChain] = useState<NetworkConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSwitching, setIsSwitching] = useState(false);
    
    // Initialize active chain
    useEffect(() => {
        try {
            let targetChainId: number;

            if (chainId && getNetworkByChainId(chainId)) {
                // Use the chain from connected wallet
                targetChainId = chainId;
            } else {
                // No wallet connected or unsupported chain - use environment-based default
                if (env.NEXT_PUBLIC_NETWORK === 'MAINNET') {
                    // Default to Base mainnet for MAINNET environment
                    const baseMainnet = getNetworkByChainId(8453);
                    targetChainId = baseMainnet ? 8453 : supportedChains[0].chainId;
                } else {
                    // Default to first testnet chain for TESTNET environment
                    const testnetChains = supportedChains.filter(chain => chain.isTestnet);
                    targetChainId = testnetChains.length > 0 ? testnetChains[0].chainId : supportedChains[0].chainId;
                }
            }

            const networkConfig = getNetworkByChainId(targetChainId);
            if (networkConfig) {
                setActiveChain(networkConfig);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to initialize chain context:', error);
            // Fallback to first supported chain
            if (supportedChains.length > 0) {
                setActiveChain(supportedChains[0]);
            }
            setIsLoading(false);
        }
    }, [chainId, defaultChainId, supportedChains]);

    const handleSetActiveChain = async (newChainId: number) => {
        const networkConfig = getNetworkByChainId(newChainId);
        if (!networkConfig) {
            console.warn(`Chain ${newChainId} is not supported`);
            return;
        }

        try {
            // Update local state immediately for UI responsiveness
            setActiveChain(networkConfig);

            // If user has a connected wallet and it's on a different chain, prompt to switch
            if (chainId && chainId !== newChainId && wagmiSwitchChain) {
                setIsSwitching(true);
                try {
                    await wagmiSwitchChain({ chainId: newChainId });
                } catch (switchError) {
                    console.warn('Failed to switch wallet chain:', switchError);
                    // Don't revert the UI state - user might want to use the app without switching wallet
                } finally {
                    setIsSwitching(false);
                }
            }
        } catch (error) {
            console.error('Failed to set active chain:', error);
        }
    };

    const switchChain = async (newChainId: number) => {
        await handleSetActiveChain(newChainId);
    };

    if (isLoading || !activeChain) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600 font-medium">Initializing chain configuration...</p>
                    </div>
                </div>
            </div>
        );
    }

    const contextValue: ChainContextType = {
        activeChain,
        setActiveChain: handleSetActiveChain,
        supportedChains,
        isLoading,
        switchChain,
        isSwitching: isSwitching || isSwitchPending
    };

    return (
        <ChainContext.Provider value={contextValue}>
            {children}
        </ChainContext.Provider>
    );
};

export const useChain = (): ChainContextType => {
    const context = useContext(ChainContext);

    if (!context) {
        throw new Error('useChain must be used within a ChainProvider');
    }

    return context;
};

// Hook for getting chain info without full context
export const useChainInfo = (chainId?: number): NetworkConfig | undefined => {
    if (!chainId) return undefined;
    return getNetworkByChainId(chainId);
};
