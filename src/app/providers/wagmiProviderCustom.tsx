"use client";

import { http } from "wagmi";
import { createConfig, WagmiProvider } from "wagmi";
import {
  flowTestnet,
  flowMainnet,
  mainnet,
  optimism,
  polygon,
  arbitrum,
  avalanche,
  abstract,
  apeChain,
  base,
  bsc,
  scrollSepolia,
  baseSepolia,
  scroll,
  arbitrumSepolia,
  sepolia,
} from "viem/chains";

const config = createConfig({
  chains: [
    flowMainnet,
    flowTestnet,
    mainnet,
    optimism,
    polygon,
    arbitrum,
    avalanche,
    abstract,
    apeChain,
    base,
    bsc,
    scrollSepolia,
    baseSepolia,
    scroll,
    arbitrumSepolia,
    sepolia,
  ],
  transports: {
    [flowMainnet.id]: http(),
    [flowTestnet.id]: http(),
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [avalanche.id]: http(),
    [abstract.id]: http(),
    [apeChain.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [scrollSepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [scroll.id]: http(),
    [sepolia.id]: http(),
  },
});

export const WagmiProviderCustom = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};
