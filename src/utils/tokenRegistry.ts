import { env } from '@/src/env.mjs';

// ============================================================================
// TYPES
// ============================================================================

export interface BaseToken {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    logo: string;
}

export interface TokenPair {
    nativeToken: BaseToken;
    superToken: BaseToken;
    chainId: number;
}

export interface NetworkConfig {
    chainId: number;
    name: string;
    isTestnet: boolean;
    tokens: Record<string, TokenPair>;
}

// ============================================================================
// TOKEN REGISTRY DATA
// ============================================================================

export const TOKEN_REGISTRY: Record<string, NetworkConfig> = {
    ETH_TESTNET: {
        chainId: 11155111,
        name: 'Ethereum Sepolia Testnet',
        isTestnet: true,
        tokens: {
            ETH: {
                nativeToken: {
                    symbol: 'PYUSD',
                    name: 'PayPal USD',
                    decimals: 6,
                    address: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9',
                    logo: '/img/pyusd.png'
                },
                superToken: {
                    symbol: 'PYUSDx',
                    name: 'PayPal USD Super Token',
                    decimals: 18,
                    address: '0xA0Ef695957413E8edE3F9669ee680de306c7a980',
                    logo: '/img/pyusdx.png'
                },
                chainId: 11155111
            }
        }
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current chain ID from environment or parameter
 */
const getCurrentChainId = (chainId?: number): number => {
    return chainId || Number(env.NEXT_PUBLIC_CHAIN_ID);
};

/**
 * Find network by chain ID
 */
const findNetworkByChainId = (chainId: number): NetworkConfig | undefined => {
    return Object.values(TOKEN_REGISTRY).find(config => config.chainId === chainId);
};

/**
 * Get network safely (with fallback to current chain)
 */
const getNetworkSafely = (chainId?: number): NetworkConfig => {
    const currentChainId = getCurrentChainId(chainId);
    const network = findNetworkByChainId(currentChainId);

    if (!network) {
        throw new Error(`Unsupported chain ID: ${currentChainId}`);
    }

    return network;
};

/**
 * Get token pair safely with error handling
 */
const getTokenPairSafely = (symbol: string, network: NetworkConfig): TokenPair => {
    const tokenPair = network.tokens[symbol];

    if (!tokenPair) {
        const availableTokens = Object.keys(network.tokens).join(', ');
        throw new Error(`Token ${symbol} not supported on ${network.name}. Available tokens: ${availableTokens}`);
    }

    return tokenPair;
};

// ============================================================================
// CORE NETWORK FUNCTIONS
// ============================================================================

/**
 * Get network configuration by chain ID
 */
export const getNetworkByChainId = (chainId: number): NetworkConfig => {
    const network = findNetworkByChainId(chainId);
    if (!network) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    return network;
};

/**
 * Get network configuration by network key
 */
export const getNetworkByKey = (networkKey: string): NetworkConfig => {
    const config = TOKEN_REGISTRY[networkKey];
    if (!config) {
        throw new Error(`Unsupported network: ${networkKey}`);
    }
    return config;
};

/**
 * Get all supported networks
 */
export const getAllNetworks = (): NetworkConfig[] => {
    return Object.values(TOKEN_REGISTRY);
};

/**
 * Get networks filtered by testnet status
 */
export const getNetworksByType = (isTestnet: boolean): NetworkConfig[] => {
    return Object.values(TOKEN_REGISTRY).filter(config => config.isTestnet === isTestnet);
};

/**
 * Get mainnet networks only
 */
export const getMainnetNetworks = (): NetworkConfig[] => {
    return getNetworksByType(false);
};

/**
 * Get testnet networks only
 */
export const getTestnetNetworks = (): NetworkConfig[] => {
    return getNetworksByType(true);
};

// ============================================================================
// TOKEN FUNCTIONS
// ============================================================================

/**
 * Get all token symbols for a specific chain
 */
export const getTokenSymbols = (chainId: number): string[] => {
    const network = getNetworkByChainId(chainId);
    return Object.keys(network.tokens);
};

/**
 * Get token pair by symbol and chain ID
 */
export const getTokenPair = (symbol: string, chainId: number): TokenPair => {
    const network = getNetworkByChainId(chainId);
    return getTokenPairSafely(symbol, network);
};

/**
 * Get default token symbol for a chain (priority: USDC > USDT > DAI > ETH > first available)
 */
export const getDefaultTokenSymbol = (chainId: number): string => {
    const availableTokens = getTokenSymbols(chainId);
    const priorityOrder = ['USDC', 'USDT', 'DAI', 'ETH'];

    const priorityToken = priorityOrder.find(token => availableTokens.includes(token));
    return priorityToken || availableTokens[0];
};

/**
 * Get default token pair for a chain
 */
export const getDefaultTokenPair = (chainId: number): TokenPair => {
    const defaultSymbol = getDefaultTokenSymbol(chainId);
    return getTokenPair(defaultSymbol, chainId);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a chain ID is a testnet
 */
export const isTestnetChain = (chainId: number): boolean => {
    try {
        const network = getNetworkByChainId(chainId);
        return network.isTestnet;
    } catch {
        return false;
    }
};

/**
 * Check if a chain ID is a mainnet
 */
export const isMainnetChain = (chainId: number): boolean => {
    try {
        const network = getNetworkByChainId(chainId);
        return !network.isTestnet;
    } catch {
        return false;
    }
};

/**
 * Format token amount based on decimals
 */
export const formatTokenAmount = (amount: string, decimals: number, maxDecimalPlaces: number = 5): string => {
    try {
        const bigIntAmount = BigInt(amount);
        const divisor = BigInt(Math.pow(10, decimals));
        const quotient = bigIntAmount / divisor;
        const remainder = bigIntAmount % divisor;

        const quotientStr = quotient.toString();
        const remainderStr = remainder.toString().padStart(decimals, '0');
        const trimmedRemainder = remainderStr.replace(/0+$/, '');

        if (trimmedRemainder === '') {
            return quotientStr;
        } else {
            const limitedRemainder = trimmedRemainder.slice(0, maxDecimalPlaces);
            return `${quotientStr}.${limitedRemainder}`;
        }
    } catch (error) {
        console.error('Error formatting token amount:', error);
        return '0';
    }
};

/**
 * Parse token amount to smallest unit
 */
export const parseTokenAmount = (amount: string, decimals: number): string => {
    return (Number(amount) * Math.pow(10, decimals)).toString();
};

// ============================================================================
// LEGACY COMPATIBILITY (for gradual migration)
// ============================================================================

/**
 * @deprecated Use getNetworkByChainId instead
 */
export const getCurrentNetworkConfig = (chainId?: number): NetworkConfig => {
    return getNetworkSafely(chainId);
};

/**
 * @deprecated Use getNetworkByChainId instead
 */
export const getNetworkConfigByChainId = (chainId: number): NetworkConfig | undefined => {
    return findNetworkByChainId(chainId);
};

/**
 * @deprecated Use getNetworkByKey instead
 */
export const getNetworkConfigByKey = (networkKey: string): NetworkConfig => {
    return getNetworkByKey(networkKey);
};

/**
 * @deprecated Use getAllNetworks instead
 */
export const getAllSupportedChains = (): NetworkConfig[] => {
    return getAllNetworks();
};

/**
 * @deprecated Use getTokenSymbols instead
 */
export const getSupportedTokenSymbols = (chainId?: number): string[] => {
    const currentChainId = getCurrentChainId(chainId);
    return getTokenSymbols(currentChainId);
};

/**
 * @deprecated Use getTokenPair instead
 */
export const getTokenPairBySymbol = (symbol: string, chainId?: number): TokenPair => {
    const currentChainId = getCurrentChainId(chainId);
    return getTokenPair(symbol, currentChainId);
};

/**
 * @deprecated Use getDefaultTokenPair instead
 */
export const getTokenConfig = (chainId?: number): TokenPair => {
    const currentChainId = getCurrentChainId(chainId);
    return getDefaultTokenPair(currentChainId);
};

/**
 * @deprecated Use isTestnetChain instead
 */
export const isTestnet = (): boolean => {
    const chainId = getCurrentChainId();
    return isTestnetChain(chainId);
};

/**
 * @deprecated Use isMainnetChain instead
 */
export const isMainnet = (): boolean => {
    const chainId = getCurrentChainId();
    return isMainnetChain(chainId);
};
