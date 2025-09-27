'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Badge } from '@/src/components/ui/badge';
import { useToken } from '@/src/app/context/TokenContext';
import { useChain } from '@/src/app/context/ChainContext';
import { getCurrencyLogo } from '@/src/utils/getCurrencyLogo';
import { getTokenPair } from '@/src/utils/tokenRegistry';
import Image from 'next/image';

interface TokenSelectorProps {
    className?: string;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
    className = '',
    showLabel = true,
    size = 'md'
}) => {
    const { activeSymbol, setActiveSymbol, supportedSymbols, tokenPair } = useToken();
    const { activeChain } = useChain();

    const sizeClasses = {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base'
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {showLabel && (
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span>Select Token</span>
                    <Badge variant="secondary" className="text-xs">
                        {supportedSymbols.length} available
                    </Badge>
                </label>
            )}

            <Select value={activeSymbol} onValueChange={setActiveSymbol}>
                <SelectTrigger className={`${sizeClasses[size]} bg-white/80 border border-white/60 shadow-lg rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all duration-300`}>
                    <SelectValue>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Image
                                    src={getCurrencyLogo(tokenPair.superToken.symbol)}
                                    alt={`${tokenPair.superToken.symbol} logo`}
                                    width={iconSizes[size]}
                                    height={iconSizes[size]}
                                    className="rounded-full"
                                />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-medium text-gray-900">
                                    {tokenPair.superToken.symbol}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {tokenPair.superToken.name}
                                </span>
                            </div>
                        </div>
                    </SelectValue>
                </SelectTrigger>

                <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl">
                    {supportedSymbols.map((symbol) => {
                        try {
                            const tokenInfo = getTokenPair(symbol, activeChain.chainId);
                            return (
                                <SelectItem
                                    key={symbol}
                                    value={symbol}
                                    className="flex items-center gap-3 p-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors duration-200"
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="relative">
                                            <Image
                                                src={getCurrencyLogo(tokenInfo.superToken.symbol)}
                                                alt={`${tokenInfo.superToken.symbol} logo`}
                                                width={iconSizes[size]}
                                                height={iconSizes[size]}
                                                className="rounded-full"
                                            />
                                        </div>
                                        <div className="flex flex-col items-start flex-1">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-medium text-gray-900">
                                                    {tokenInfo.superToken.symbol}
                                                </span>
                                                {symbol === activeSymbol && (
                                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {tokenInfo.superToken.name}
                                            </span>
                                        </div>
                                    </div>
                                </SelectItem>
                            );
                        } catch (error) {
                            console.error(`Failed to get token info for ${symbol}:`, error);
                            return null;
                        }
                    }).filter(Boolean)}
                </SelectContent>
            </Select>
        </div>
    );
};
