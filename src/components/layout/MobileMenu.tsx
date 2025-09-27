"use client";
import { useState } from "react";
import { Sheet, SheetContent, SheetClose } from "../ui/sheet";
import Link from "next/link";
import { ChevronDown, Home, Briefcase, HelpCircle, MessageCircle, Zap } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { AuthButton } from "./AuthButton";
import { Button } from "../ui/button";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useSigner } from "@/src/hooks/use-signer";
import { useRouter } from "next/navigation";

type NavItem = {
  title: string;
  href?: string;
  dropdown: boolean;
  items?: {
    title: string;
    href: string;
    description: string;
  }[];
};

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
  onClose?: () => void;
}

export function MobileMenu({ isOpen, navItems, onClose }: MobileMenuProps) {
  const router = useRouter();
  const { wallets } = useWallets();
  const { signer } = useSigner(wallets);
  const { ready, authenticated, linkWallet, user } = usePrivy();
  const { login } = useLogin();

  const handleLaunchApp = () => {
    if (!signer && user) {
      linkWallet();
      return;
    } else if (!signer || !authenticated || !user) {
      login();
      return;
    }
    router.push('/dashboard');
    onClose?.();
  };

  const navIcons: Record<string, React.ReactNode> = {
    Home: <Home className="w-4 h-4 mr-2 inline-block" />,
    Usecases: <Briefcase className="w-4 h-4 mr-2 inline-block" />,
    FAQ: <HelpCircle className="w-4 h-4 mr-2 inline-block" />,
  };
  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open && onClose) onClose(); }}>
      <SheetContent side="left" className="p-0 w-3/4 max-w-xs">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-lg font-bold">Menu</span>
          </div>
          <nav className="flex flex-col space-y-2 px-4 py-4 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href || "#"}
                className="flex items-center py-2 text-base sm:text-lg font-medium hover:text-primary"
                onClick={onClose}
              >
                {navIcons[item.title]}
                {item.title}
              </Link>
            ))}
            {/* Launch App Button */}
            <div
              className="relative"
            >
              <Button
                onClick={() => {
                  if (!signer && user) {
                    linkWallet()
                    return;
                  } else if (!signer || !authenticated || !user) {
                    login()
                    return;
                  }
                  router.push('/dashboard');
                }}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-sans font-semibold text-xs sm:text-sm rounded-lg transition-all duration-300 cursor-pointer flex items-center space-x-1 sm:space-x-2 relative overflow-hidden
                  
                  `}
              >
                <Zap className="w-3 sm:w-4 h-3 sm:h-4" />
                <span>Launch App</span>
              </Button>
            </div>
          </nav>
        </div>
      </SheetContent >
    </Sheet >
  );
}
