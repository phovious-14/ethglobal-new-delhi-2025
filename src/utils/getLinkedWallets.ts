import { ConnectedWallet } from "@privy-io/react-auth";

export const getLinkedWallets = (wallets: ConnectedWallet[]) =>
  wallets.filter((wallet) => wallet.linked);
