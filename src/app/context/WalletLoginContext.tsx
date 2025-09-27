import { createContext, ReactNode, useState } from "react";
import { scrollSepolia, scroll, base, baseSepolia } from "viem/chains";
import { env } from "@/env.mjs";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useChain } from "./ChainContext";

const WalletLoginContext = createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  walletAddress: string;
  setWalletAddress: (walletAddress: string) => void;
}>({
  isOpen: false,
  setIsOpen: () => { },
  walletAddress: "",
  setWalletAddress: () => { },
});

export const WalletLoginProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { activeChain } = useChain();

  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // NETWORK SWITCH VARIABLES
  const [availableWallets, setAvailableWallets] = useState<
    {
      name: string;
      provider: any;
    }[]
  >([]);
  const [userChainId, setUserChainId] = useState<number | undefined>(undefined);

  // RETRIEVE USER CREDENTIALS
  const [accessToken, setAccessToken] = useState<string>("");
  const { user: privyUser, getAccessToken, authenticated, ready } = usePrivy();

  const getUserAccessToken = async () => {
    try {
      const userAccessToken = await getAccessToken();
      if (userAccessToken) {
        setAccessToken(userAccessToken);
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  };

  const { user, isLoading } = useUser({
    userId: privyUser?.id,
    accessToken,
  });

  useEffect(() => {
    if (privyUser && ready) {
      getUserAccessToken();
    }
  }, [privyUser, ready]);

  // Use the active chain from ChainContext instead of hardcoded chain
  const getViemChain = (chainId: number) => {
    switch (chainId) {
      case 534351: return scrollSepolia; // Scroll Testnet
      case 534352: return scroll; // Scroll Mainnet
      case 8453: return base; // Base Mainnet
      case 84532: return baseSepolia; // Base Testnet
      default: return scroll; // Fallback
    }
  };

  const appChain = getViemChain(activeChain.chainId);

  const updateUserChainId = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const userChainId = await (window.ethereum as any)?.request({
          method: "eth_chainId",
        });
        setUserChainId(parseInt(userChainId, 16));
      }
    } catch (error) {
      console.error('Error updating user chain ID:', error);
    }
  };

  const switchNetwork = async () => {
    try {
      // below, you'll find a caveman solution to the issue with pathname not being updated immediately
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (pathname === "/profile/wallet") {
        return;
      }

      if (typeof window !== 'undefined' && window.ethereum) {
        await (window.ethereum as any).request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${appChain.id.toString(16)}` }],
        });

        updateUserChainId();
      }
    } catch (error: any) {
      const networkParams = [
        {
          chainId: `0x${appChain.id.toString(16)}`,
          chainName: appChain.name,
          nativeCurrency: appChain.nativeCurrency,
          rpcUrls: appChain.rpcUrls.default.http,
          blockExplorerUrls: [appChain.blockExplorers.default.url],
        },
      ];
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          await (window.ethereum as any).request({
            method: "wallet_addEthereumChain",
            params: networkParams,
          });

          updateUserChainId();
        }
      } catch (addError) {
        console.error('Error adding network:', addError);
      }
    }
  };

  useEffect(() => {
    if (availableWallets.length > 0) {
      updateUserChainId();
    }
  }, [availableWallets, userChainId]);

  useEffect(() => {
    // Don't auto-switch networks - let users choose their preferred chain
    // This was causing forced switching to Scroll

    // Only auto-switch in very specific cases:
    // 1. User is on testnet but app expects mainnet (or vice versa)
    // 2. User is on completely unsupported network

    if (
      // if user is a web2 user
      privyUser?.wallet?.walletClientType === "privy" ||
      !authenticated ||
      !user ||
      isLoading ||
      pathname === null ||
      pathname === "/profile/wallet"
    ) {
      return;
    }

    // Check if user's chain is supported (Base or Scroll for mainnet, Scroll testnet for testnet)
    const supportedMainnetChains = [8453, 534352]; // Base, Scroll
    const supportedTestnetChains = [534351, 84532]; // Scroll Testnet, Base Testnet
    const isTestnetEnv = env.NEXT_PUBLIC_NETWORK === "TESTNET";

    const isChainSupported = isTestnetEnv
      ? supportedTestnetChains.includes(userChainId || 0)
      : supportedMainnetChains.includes(userChainId || 0);

    // Only auto-switch if user is on completely unsupported chain
    if (!isChainSupported && userChainId) {
      console.log(`User on unsupported chain ${userChainId}, suggesting switch to ${appChain.name}`);
      // Could show a notification instead of auto-switching
      // switchNetwork();
    }
  }, [userChainId, authenticated, privyUser, user, isLoading, pathname, activeChain]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        setUserChainId(parseInt(chainId, 16));
      };
      const handleWalletsStorage = (event: any) => {
        const { info, provider } = event.detail;
        setAvailableWallets((prev) => [
          ...(prev ? prev : []),
          { name: info.name, provider: provider },
        ]);
      };

      // Set Initial User Chain
      (window.ethereum as any)
        .request({
          method: "eth_chainId",
        })
        .then((chainId: string) => {
          setUserChainId(parseInt(chainId, 16));
        })
        .catch((err: any) => {
          console.error('Error getting initial chain ID:', err);
        });

      // Listen for wallet extensions
      window.addEventListener("eip6963:announceProvider", handleWalletsStorage);
      // Request wallet announcement
      window.dispatchEvent(new Event("eip6963:requestProvider"));
      // Listen for change in network chain by user
      (window.ethereum as any).on("chainChanged", handleChainChanged);

      return () => {
        window.removeEventListener(
          "eip6963:announceProvider",
          handleWalletsStorage
        );
        (window.ethereum as any).removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return (
    <WalletLoginContext.Provider
      value={{ isOpen, setIsOpen, walletAddress, setWalletAddress }}
    >
      {children}
    </WalletLoginContext.Provider>
  );
};

export { WalletLoginContext };
