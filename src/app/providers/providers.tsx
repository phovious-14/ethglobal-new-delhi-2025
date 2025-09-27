"use client";

import React from "react";
import { getAccessToken, PrivyProvider, User } from "@privy-io/react-auth";
// import { createUser, getUser, updateUserEmail } from "@/api/routers/user";
import { ConnectLinkedWalletProvider } from "../context/ConnectLinkedWalletContext";
import { DistributionProvider } from "../context/DistributionContext";
import { TokenProvider } from "../context/TokenContext";
import { ChainProvider } from "../context/ChainContext";
import { scrollSepolia, scroll, base, baseSepolia, sepolia } from "viem/chains";
import { useToast } from "@/src/hooks/use-toast";
import { createUser, getUserByPrivyId } from "@/src/api/routers/user";
import { env } from "@/src/env.mjs";
import QueryProvider from "./queryProvider";
import { WagmiProviderCustom } from "./wagmiProviderCustom";
import { WalletLoginProvider } from "../context/WalletLoginContext";
import mixpanel from "mixpanel-browser";

// that runs after successful login.
export const handleLogin = async (
  user: User,
  toast: ReturnType<typeof useToast>["toast"]
) => {
  if (!user.email?.address) {
    return;
  }
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("No access token found");
    }
    const dbUser = await getUserByPrivyId(user.id, accessToken);
    const email = user.email?.address;
    // create username from email address
    const username = email.split("@")[0];

    if ((!dbUser || !dbUser.id) && email) {

      const res = await createUser({
        email,
        walletAddress: user?.wallet?.address || "",
        username: username.replace(/[^a-zA-Z0-9._]/g, ""),
        privyId: user.id,
      });
      if (res) {
        mixpanel.people.set({
          $email: email,
          $walletAddress: user?.wallet?.address || "",
        });
        return true;
      }
    } else if (dbUser && dbUser.email !== email) {
      // await updateUserEmail(accessToken);
      toast({
        variant: "default",
        description: "Email updated successfully",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Determine supported chains based on environment
const getSupportedChains = () => {
  const isTestnet = env.NEXT_PUBLIC_NETWORK === 'TESTNET';
  if (isTestnet) {
    return [scrollSepolia, baseSepolia, sepolia];
  }
  // For mainnet, support both Base and Scroll (Base first for neutral default)
  return [base, scroll];
};

const getDefaultChain = () => {
  const isTestnet = env.NEXT_PUBLIC_NETWORK === 'TESTNET';
  if (isTestnet) {
    return scrollSepolia;
  }
  // For mainnet, return the first supported chain (no preference)
  const chains = getSupportedChains();
  return chains[0];
};

const supportedChains = getSupportedChains();
const defaultChain = getDefaultChain();

// Safe wrapper component to handle SSR
const SafeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      </div>
    </div>;
  }

  return <>{children}</>;
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SafeProvider>
      <PrivyProvider
        appId={env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        config={{
          loginMethods: ["wallet"],
          appearance: {
            theme: "light",
            accentColor: "#F5A600",
          },
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          defaultChain: defaultChain,
          supportedChains: supportedChains,
        }}
      >
        <QueryProvider>
          <WagmiProviderCustom>
            <ChainProvider>
              <TokenProvider>
                <ConnectLinkedWalletProvider>
                  <WalletLoginProvider>
                    <DistributionProvider>
                      {children}
                    </DistributionProvider>
                  </WalletLoginProvider>
                </ConnectLinkedWalletProvider>
              </TokenProvider>
            </ChainProvider>
          </WagmiProviderCustom>
        </QueryProvider>
      </PrivyProvider>
    </SafeProvider>
  );
}
