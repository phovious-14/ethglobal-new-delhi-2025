import { useChain } from "@/src/app/context/ChainContext";
import { getTokenConfig } from "./tokenRegistry";

// Token logo mapping
const TOKEN_LOGOS: Record<string, string> = {
    // Super tokens
    'USDCx': '/img/usdcx.png',
    'USDTx': '/img/usdtx.png',
    // 'USDQx': '/img/usdqx.png',
    'ETHx': '/img/eth.png',
    'DAIx': '/img/daix.png',
    // Native tokens
    'USDC': '/img/usdc.png',
    'USDT': '/img/usdt.png',
    // 'USDQ': '/img/usdq.png',
    'ETH': '/img/eth.png',
    'DAI': '/img/dai.png'
};

export const getCurrencyLogo = (symbol?: string) => {
    if (symbol) {
        return TOKEN_LOGOS[symbol] || '/img/drippay.png';
    }

    // Default behavior - get logo for current default token
    const { activeChain } = useChain();
    const tokenConfig = getTokenConfig(activeChain.chainId);
    return TOKEN_LOGOS[tokenConfig.superToken.symbol] || '/img/drippay.png';
};

export const getNativeTokenLogo = (symbol?: string) => {
    if (symbol) {
        return TOKEN_LOGOS[symbol] || '/img/drippay.png';
    }

    const { activeChain } = useChain();
    const tokenConfig = getTokenConfig(activeChain.chainId);
    return TOKEN_LOGOS[tokenConfig.nativeToken.symbol] || '/img/drippay.png';
};

export const getSuperTokenLogo = (symbol?: string) => {
    if (symbol) {
        return TOKEN_LOGOS[symbol] || '/img/drippay.png';
    }

    const { activeChain } = useChain();
    const tokenConfig = getTokenConfig(activeChain.chainId);
    return TOKEN_LOGOS[tokenConfig.superToken.symbol] || '/img/drippay.png';
};