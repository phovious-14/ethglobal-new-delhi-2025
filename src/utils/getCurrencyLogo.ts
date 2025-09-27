import { useChain } from "@/src/app/context/ChainContext";
import { getTokenConfig } from "./tokenRegistry";

// Token logo mapping
const TOKEN_LOGOS: Record<string, string> = {
    // Super tokens
    'PYUSD': '/img/pyusd.png',
    'PYUSDx': '/img/pyusdx.png',
};

export const getCurrencyLogo = (symbol?: string) => {
    if (symbol) {
        return TOKEN_LOGOS[symbol] || '/img/paypulse.png';
    }

    // Default behavior - get logo for current default token
    const { activeChain } = useChain();
    const tokenConfig = getTokenConfig(activeChain.chainId);
    return TOKEN_LOGOS[tokenConfig.superToken.symbol] || '/img/paypulse.png';
};

export const getNativeTokenLogo = (symbol?: string) => {
    if (symbol) {
        return TOKEN_LOGOS[symbol] || '/img/paypulse.png';
    }

    const { activeChain } = useChain();
    const tokenConfig = getTokenConfig(activeChain.chainId);
    return TOKEN_LOGOS[tokenConfig.nativeToken.symbol] || '/img/paypulse.png';
};

export const getSuperTokenLogo = (symbol?: string) => {
    if (symbol) {
        return TOKEN_LOGOS[symbol] || '/img/paypulse.png';
    }

    const { activeChain } = useChain();
    const tokenConfig = getTokenConfig(activeChain.chainId);
    return TOKEN_LOGOS[tokenConfig.superToken.symbol] || '/img/paypulse.png';
};