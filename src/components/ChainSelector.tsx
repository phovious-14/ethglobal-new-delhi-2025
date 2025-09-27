'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, Loader2, Network } from 'lucide-react';
import { useChain } from '@/src/app/context/ChainContext';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from './ui/dropdown-menu';
import Image from 'next/image';
import { getMainnetNetworks, getTestnetNetworks, isTestnetChain } from '@/src/utils/tokenRegistry';

interface ChainSelectorProps {
    variant?: 'default' | 'compact';
    className?: string;
}

const getChainLogo = (chainId: number): string => {
    switch (chainId) {
        case 534351: // Scroll Testnet
            return '/img/scroll.png';
        case 84532: // Base Testnet
            return '/img/base.png';
        case 534352: // Scroll Mainnet
            return '/img/scroll.png';
        case 8453: // Base Mainnet
            return '/img/base.png';
        default:
            return '/img/eth.png';
    }
};

const getChainDisplayName = (chainName: string): string => {
    return chainName.replace(' Mainnet', '').replace(' Testnet', '');
};

export const ChainSelector: React.FC<ChainSelectorProps> = ({
    variant = 'default',
    className = ''
}) => {
    const { activeChain, switchChain, isSwitching } = useChain();
    const [isOpen, setIsOpen] = useState(false);

    // Get networks based on current environment
    const isCurrentlyTestnet = isTestnetChain(activeChain.chainId);
    const availableChains = isCurrentlyTestnet ? getTestnetNetworks() : getMainnetNetworks();

    const handleChainSwitch = async (chainId: number) => {
        if (chainId === activeChain.chainId) return;

        try {
            await switchChain(chainId);
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to switch chain:', error);
        }
    };

    if (variant === 'compact') {
        return (
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={`h-8 w-8 p-0 rounded-lg hover:bg-white/20 ${className}`}
                        disabled={isSwitching}
                    >
                        {isSwitching ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                            <Image
                                src={getChainLogo(activeChain.chainId)}
                                alt={activeChain.name}
                                width={20}
                                height={20}
                                className="rounded-full"
                            />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl">
                    {/* Environment Label */}
                    <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg mx-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${isCurrentlyTestnet ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                        {isCurrentlyTestnet ? 'Testnet Networks' : 'Mainnet Networks'}
                    </DropdownMenuLabel>

                    {/* Available Chains */}
                    {availableChains.map((chain) => (
                        <DropdownMenuItem
                            key={chain.chainId}
                            onClick={() => handleChainSwitch(chain.chainId)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 mx-2 mb-1 ${activeChain.chainId === chain.chainId
                                ? `bg-gradient-to-r ${isCurrentlyTestnet ? 'from-orange-500/20 to-yellow-500/20 text-orange-700' : 'from-green-500/20 to-emerald-500/20 text-green-700'}`
                                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30'
                                }`}
                        >
                            <Image
                                src={getChainLogo(chain.chainId)}
                                alt={chain.name}
                                width={20}
                                height={20}
                                className="rounded-full flex-shrink-0"
                            />
                            <span className="font-medium flex-1">
                                {getChainDisplayName(chain.name)}
                            </span>
                            {activeChain.chainId === chain.chainId && (
                                <Check className={`h-4 w-4 ${isCurrentlyTestnet ? 'text-orange-600' : 'text-green-600'}`} />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={`flex items-center space-x-2 px-3 py-2 h-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 ${className}`}
                    disabled={isSwitching}
                >
                    {isSwitching ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                        <Image
                            src={getChainLogo(activeChain.chainId)}
                            alt={activeChain.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                        />
                    )}
                    <span className="text-white font-medium text-sm">
                        {getChainDisplayName(activeChain.name)}
                    </span>
                    <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${isCurrentlyTestnet ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                        <ChevronDown className="h-4 w-4 text-white/70" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl">
                {/* Environment Label */}
                <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg mx-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${isCurrentlyTestnet ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                    {isCurrentlyTestnet ? 'Testnet Networks' : 'Mainnet Networks'}
                </DropdownMenuLabel>

                {/* Available Chains */}
                {availableChains.map((chain) => (
                    <DropdownMenuItem
                        key={chain.chainId}
                        onClick={() => handleChainSwitch(chain.chainId)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 mx-2 mb-1 ${activeChain.chainId === chain.chainId
                            ? `bg-gradient-to-r ${isCurrentlyTestnet ? 'from-orange-500/20 to-yellow-500/20 text-orange-700' : 'from-green-500/20 to-emerald-500/20 text-green-700'}`
                            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30'
                            }`}
                    >
                        <Image
                            src={getChainLogo(chain.chainId)}
                            alt={chain.name}
                            width={20}
                            height={20}
                            className="rounded-full flex-shrink-0"
                        />
                        <span className="font-medium flex-1">
                            {getChainDisplayName(chain.name)}
                        </span>
                        {activeChain.chainId === chain.chainId && (
                            <Check className={`h-4 w-4 ${isCurrentlyTestnet ? 'text-orange-600' : 'text-green-600'}`} />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
