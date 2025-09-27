import { getLinkedWallets } from "@/src/utils/getLinkedWallets";
import { ConnectedWallet } from "@privy-io/react-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { env } from "../env.mjs";
import { useChain } from '@/src/app/context/ChainContext';
import { useEffect } from 'react';

export const SignerErrorsEnum = {
  wallet: "WALLET_NOT_FOUND",
  network: "WRONG_NETWORK",
  error: "ERROR",
};

export const signerErrorsMessages = {
  wallet: "No wallet detected, please connect a wallet and refresh the page",
  network: "Please connect to the correct network",
  error: "An error occurred",
};

export const getSigner = async (wallets: ConnectedWallet[], chainId?: number) => {
  const filteredWallet = getLinkedWallets(wallets);

  if (!filteredWallet.length)
    return {
      signer: undefined,
      address: undefined,
      reason: SignerErrorsEnum.wallet,
      message: signerErrorsMessages["wallet"],
    };

  try {
    const eip1193 = await filteredWallet[0]?.getEthereumProvider();
    const provider = new ethers.providers.Web3Provider(eip1193);
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    const targetChainId = chainId || Number(env.NEXT_PUBLIC_CHAIN_ID);

    // Get the address first
    const address = await signer.getAddress();

    // Check if we're on the correct network
    if (network.chainId !== targetChainId) {
      console.warn(`Wallet is on chain ${network.chainId}, but target is ${targetChainId}`);

      // Return the signer anyway, but with a warning
      // This allows the app to work even if the wallet hasn't switched yet
      return {
        signer,
        address,
        reason: SignerErrorsEnum.network,
        message: signerErrorsMessages["network"],
        // Include network info for debugging
        currentChainId: network.chainId,
        targetChainId: targetChainId
      };
    }

    return { signer, address };
  } catch (error) {
    console.error('Error getting signer:', error);
    if (error instanceof Error) {
      return {
        signer: undefined,
        address: undefined,
        reason: SignerErrorsEnum.error,
        message: error.message,
      };
    }
    return {
      signer: undefined,
      address: undefined,
      reason: SignerErrorsEnum.error,
      message: signerErrorsMessages["error"],
    };
  }
};

export function useSigner(wallets: ConnectedWallet[]) {
  const { activeChain } = useChain();
  const queryClient = useQueryClient();

  const { data: signerObj, refetch } = useQuery({
    queryKey: ["signer", { wallets: getLinkedWallets(wallets), chainId: activeChain.chainId }],
    queryFn: () => getSigner(wallets, activeChain.chainId),
    enabled: getLinkedWallets(wallets).length > 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Retry more aggressively during chain switches
    retry: (failureCount, error) => {
      if (failureCount >= 5) return false;
      // Retry on network errors during chain switching
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    signer: signerObj?.signer,
    refetch,
    address: signerObj?.address,
  };
}
