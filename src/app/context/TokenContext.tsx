'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useChain } from '@/src/app/context/ChainContext';
import {
    getTokenSymbols,
    getTokenPair,
    getDefaultTokenSymbol,
    TokenPair
} from '@/src/utils/tokenRegistry';

interface TokenContextType {
    activeSymbol: string;
    setActiveSymbol: (symbol: string) => void;
    tokenPair: TokenPair;
    supportedSymbols: string[];
    isLoading: boolean;
}

const TokenContext = createContext<TokenContextType | null>(null);

interface TokenProviderProps {
    children: ReactNode;
    defaultSymbol?: string;
}

export const TokenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { activeChain } = useChain();
    const [selectedToken, setSelectedToken] = useState<string>('');
    const [tokenPair, setTokenPair] = useState<TokenPair | null>(null);

    // Get available token symbols for the current chain
    const getAvailableTokens = useCallback(() => {
        if (!activeChain) return [];
        return getTokenSymbols(activeChain.chainId);
    }, [activeChain]);

    // Initialize token selection when chain changes
    useEffect(() => {
        if (!activeChain) return;

        const symbols = getTokenSymbols(activeChain.chainId);
        const initialSymbol = selectedToken && symbols.includes(selectedToken)
            ? selectedToken
            : getDefaultTokenSymbol(activeChain.chainId);

        setSelectedToken(initialSymbol);
        setTokenPair(getTokenPair(initialSymbol, activeChain.chainId));
    }, [activeChain, selectedToken]);

    // Update token pair when selected token changes
    useEffect(() => {
        if (!activeChain || !selectedToken) return;
        const newTokenPair = getTokenPair(selectedToken, activeChain.chainId);
        setTokenPair(newTokenPair);
    }, [activeChain, selectedToken]);

    const handleSetActiveSymbol = (symbol: string) => {
        if (getAvailableTokens().includes(symbol) && activeChain) {
            setSelectedToken(symbol);
            // Store user preference in localStorage per chain
            try {
                localStorage.setItem(`drippay-selected-token-${activeChain.chainId}`, symbol);
            } catch (error) {
                console.warn('Failed to save token preference:', error);
            }
        } else {
            console.warn(`Token ${symbol} is not supported on ${activeChain?.name || 'current network'}`);
        }
    };

    if (!tokenPair) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const contextValue: TokenContextType = {
        activeSymbol: selectedToken,
        setActiveSymbol: handleSetActiveSymbol,
        tokenPair,
        supportedSymbols: getAvailableTokens(),
        isLoading: false // No explicit loading state here, as it's handled by ChainContext
    };

    return (
        <TokenContext.Provider value={contextValue}>
            {children}
        </TokenContext.Provider>
    );
};

export const useToken = (): TokenContextType => {
    const context = useContext(TokenContext);

    if (!context) {
        throw new Error('useToken must be used within a TokenProvider');
    }

    return context;
};

// Hook for getting token pair without full context (useful for server components)
export const useTokenPair = (symbol?: string, chainId?: number): TokenPair => {
    if (!chainId) {
        throw new Error('chainId is required for useTokenPair');
    }

    try {
        const targetSymbol = symbol || getDefaultTokenSymbol(chainId);
        return getTokenPair(targetSymbol, chainId);
    } catch (error) {
        console.error('Failed to get token pair:', error);
        throw error;
    }
};
