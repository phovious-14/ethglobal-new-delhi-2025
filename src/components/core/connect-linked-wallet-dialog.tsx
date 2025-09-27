import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
} from "../../components/ui/dialog";
// import { CollectionItemOrWrappedToken } from "@/api/routers/collectionItems";
import { Button } from "../../components/ui/button";
// import ProgressiveImg from "@/components/core/ProgressiveImg";
import { usePrivy } from "@privy-io/react-auth";
import { truncateEthAddress } from "../../utils/truncateEthAddress";

type ConnectLinkedWalletDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ConnectLinkedWalletDialog({
  isOpen,
  onOpenChange,
}: ConnectLinkedWalletDialogProps) {
  const { connectWallet, user } = usePrivy();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex items-center flex-col sm:max-w-lg md:px-10">
        <DialogHeader></DialogHeader>
        <h2 className="text-center font-normal">
          Connect Your Privy Linked Wallet
        </h2>
        <p className="text-center opacity-60 mb-4">
          You need to connect the following wallet <br />
          <b className="text-primary">
            {truncateEthAddress(user?.wallet?.address || "")}
          </b>
          .
        </p>

        <div>
          <DialogClose asChild>
            <Button className="mt-6" onClick={connectWallet}>
              Connect Wallet
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
