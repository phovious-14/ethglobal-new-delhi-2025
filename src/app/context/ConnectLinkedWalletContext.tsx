import { ConnectLinkedWalletDialog } from "@/components/core/ConnectButton/connect-linked-wallet-dialog";
import { createContext, ReactNode, useContext, useState, Dispatch, SetStateAction } from "react";

type ConnectLinkedWalletContextType = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  openConnectLinkedWalletModal: () => Promise<void>;
};

const ConnectLinkedWalletContext =
  createContext<ConnectLinkedWalletContextType>({
    isOpen: false,
    setIsOpen: () => { },
    openConnectLinkedWalletModal: async () => { },
  });

type ConnectLinkedWalletProviderProps = {
  children: ReactNode;
};

export const ConnectLinkedWalletProvider: React.FC<
  ConnectLinkedWalletProviderProps
> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openConnectLinkedWalletModal = async () => {
    setIsOpen(true);
  };

  const value = { isOpen, setIsOpen, openConnectLinkedWalletModal };

  return (
    <ConnectLinkedWalletContext.Provider value={value}>
      {children}
      <ConnectLinkedWalletDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </ConnectLinkedWalletContext.Provider>
  );
};

export function useConnectLinkedWallet() {
  const context = useContext(ConnectLinkedWalletContext);
  // Return the context directly since we provide default values
  return context;
}
