import React, { useContext, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { LogIn, User, LogOut, Settings, Wallet, Coins, Copy, Check, ChevronDown, ChevronUp, ArrowRight, ArrowLeftRight, Info, RotateCw, Repeat } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useLogout,
  usePrivy,
  useLinkAccount,
  useLogin,
  LinkedAccountWithMetadata,
  User as PrivyUser,
  getAccessToken,
  useWallets,
} from "@privy-io/react-auth";
import { Loader2 } from "lucide-react";
import { handleLogin } from "@/src/app/providers/providers";
import { useToast } from "@/src/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useUser } from "@/src/hooks/use-user";
import { useBalances } from "@/src/hooks/use-balances";
import { useToken } from "@/src/app/context/TokenContext";
import { WalletLoginContext } from "@/src/app/context/WalletLoginContext";
import { truncateEthAddress } from "@/src/utils/truncateEthAddress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/src/components/ui/tooltip";
import { WrapUnwrapToken } from "../WrapUnwrapUSDC";
import { useMediaQuery } from "@/src/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/src/components/ui/drawer";
import {
  getTokenSymbols,
  getTokenPair,
  getDefaultTokenSymbol
} from "@/src/utils/tokenRegistry";
import { useChain } from "@/src/app/context/ChainContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface AuthButtonProps {
  className?: string;
  promptLogin?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ className, promptLogin }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [accessToken, setAccessToken] = React.useState<string>("");
  const { toast: toastPopup } = useToast();
  const { activeChain } = useChain();

  // Wallet state
  const [copied, setCopied] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, right: 0 });
  const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Local token selection state (independent of global context)
  const [localSelectedToken, setLocalSelectedToken] = React.useState<string>(() => {
    // Initialize with default token for current network
    try {
      return getDefaultTokenSymbol(activeChain.chainId);
    } catch (error) {
      console.error('Failed to get default token symbol:', error);
      return 'USDC'; // fallback
    }
  });

  // Get available tokens for current network
  const supportedTokens = React.useMemo(() => {
    try {
      return getTokenSymbols(activeChain.chainId);
    } catch (error) {
      console.error('Failed to get supported tokens:', error);
      return ['USDC']; // fallback
    }
  }, [activeChain.chainId]);

  // Get token pair for local selection
  const localTokenPair = React.useMemo(() => {
    try {
      return getTokenPair(localSelectedToken, activeChain.chainId);
    } catch (error) {
      console.error('Failed to get token pair for local selection:', error);
      return null;
    }
  }, [localSelectedToken, activeChain.chainId]);

  // Use balances hook with local token selection
  const { eth, ethx, isLoading: balancesLoading, error: balancesError, nativeTokenSymbol, superTokenSymbol, tokenConfig } = useBalances(localSelectedToken);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isDesktop) {
      // On mobile, open drawer
      setIsDrawerOpen(true);
    } else {
      // On desktop, toggle dropdown
      if (isDropdownVisible) {
        setIsDropdownVisible(false);
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const dropdownWidth = 320; // Reduced width of dropdown
        const rightPosition = window.innerWidth - rect.right;

        // Ensure dropdown doesn't go off-screen
        const adjustedRight = Math.max(10, rightPosition - (dropdownWidth / 2));

        setDropdownPosition({
          top: rect.bottom + 8,
          right: adjustedRight
        });
        setIsDropdownVisible(true);
      }
    }
  };

  const { user: privyUser, authenticated, ready, linkWallet } = usePrivy();

  const { user, isLoading } = useUser({
    userId: privyUser?.id,
    accessToken,
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const { linkEmail } = useLinkAccount({
    onSuccess: async (params) => {
      try {
        const isSuccessful = await handleLogin(params.user, toastPopup);
        queryClient.invalidateQueries({
          queryKey: ["user"],
        });
        if (isSuccessful) {
          const url = new URL(window.location.href);
          url.search = "";
          window.history.pushState({}, "", url.href);
          setTimeout(() => window.location.reload(), 2000);
        }
      } catch (error) {
        console.log("error", error);
        logout();
      }
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  const { logout } = useLogout({
    onSuccess: () => {
      router.push("/");
    },
  });

  const { wallets, ready: walletsReady } = useWallets();
  const { setIsOpen: setIsWalletLoginOpen, setWalletAddress } =
    useContext(WalletLoginContext);

  const { login } = useLogin({
    onComplete: async ({
      // @ts-ignore
      user: privyUserCallBack,
      // @ts-ignore
      wasAlreadyAuthenticated,
      // @ts-ignore
      loginMethod,
    }) => {

      if (
        !wasAlreadyAuthenticated &&
        ready &&
        (!wallets.length ||
          privyUserCallBack.wallet?.walletClientType === "privy")
      ) {
        setWalletAddress(privyUserCallBack.wallet?.address || "");
        setIsWalletLoginOpen(true);
        logout();
        return;
      }

      if (privyUserCallBack.email?.address !== (user as any)?.email) {
        const userAccessToken = await getAccessToken();
        if (userAccessToken) {
          try {
          } catch (error) {
            if (error instanceof Error) {
              toastPopup({
                variant: "destructive",
                description: error.message,
              });
            }
          }
        }
      }

      if (!privyUserCallBack.email?.address) {
        setTimeout(() => linkEmail(), 0);
      }

      if (loginMethod === "email" && !user) {
        const isSuccessful = await handleLogin(privyUserCallBack, toastPopup);
        queryClient.invalidateQueries({
          queryKey: ["user"],
        });
        if (isSuccessful) {
          const url = new URL(window.location.href);
          url.search = "";
          window.history.pushState({}, "", url.href);
          setTimeout(() => window.location.reload(), 2000);
        }
      }
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  const getUserAccessToken = async () => {
    const userAccessToken = await getAccessToken();
    if (userAccessToken) {
      setAccessToken(userAccessToken);
    }
  };

  useEffect(() => {
    if (privyUser && ready) {
      getUserAccessToken();
    }
  }, [privyUser, ready]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Check if click is outside the dropdown and button
      const isClickInsideDropdown = target.closest('.wallet-dropdown');
      const isClickInsideButton = target.closest('.wallet-button');
      const isClickInsideSelect = target.closest('[data-radix-popper-content-wrapper]');

      if (!isClickInsideDropdown && !isClickInsideButton && !isClickInsideSelect) {
        setIsDropdownVisible(false);
      }
    };

    if (isDropdownVisible && isDesktop) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownVisible, isDesktop]);

  // Handle window resize to close dropdown
  useEffect(() => {
    const handleResize = () => {
      if (isDropdownVisible) {
        setIsDropdownVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDropdownVisible]);

  useEffect(() => {
    if (promptLogin) {
      login();
    }
  }, [promptLogin, login]);

  if (!privyUser || !authenticated || !user || isLoading || wallets.length === 0) {
    return (
      <div className={className}>
        {privyUser && !privyUser.email ? (
          <Button
            size={"default"}
            onClick={linkEmail}
            disabled={!ready || !authenticated || !!privyUser.email}
            className="px-6 py-3 font-medium text-sm rounded-xl backdrop-blur-md bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-700 border border-orange-300/50 hover:from-orange-500/30 hover:to-yellow-500/30 hover:shadow-lg transition-all duration-300"
          >
            Link your email
          </Button>
        ) : (
          <Button
            disabled={!ready}
            size={"default"}
            onClick={() => {
              if (authenticated && wallets.length === 0) {
                setTimeout(() => {
                  linkWallet();
                  queryClient.invalidateQueries({
                    queryKey: ["user"],
                  });

                }, 1000);
                return;
              } else {
                login();
              }
            }}
            className="px-6 py-3 font-medium text-sm rounded-xl backdrop-blur-md bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] flex items-center justify-center border border-violet-400/30 hover:border-violet-400/50"
          >
            {!ready ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </div>
            )}
          </Button>
        )}
      </div>
    );
  }

  // Wallet Content Component (shared between drawer and dropdown)
  const WalletContent = () => (
    <>
      {/* Enhanced User Info Section */}
      <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-4 border-b border-white/40 bg-gradient-to-r from-blue-50/30 to-purple-50/30 rounded-t-2xl sm:rounded-t-3xl">
        {privyUser?.twitter?.profilePictureUrl ? (
          <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/60 shadow-xl">
            <img
              src={privyUser?.twitter?.profilePictureUrl || "/img/twitter.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
        ) : (
          <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/40 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
            <User className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base sm:text-xl font-bold text-gray-900">Connected Wallet</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base text-gray-600 font-mono">{truncateEthAddress(privyUser?.wallet?.address || '')}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(privyUser?.wallet?.address || '')}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-white/20 transition-all duration-300 rounded-lg"
            >
              {copied ? (
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500" />
              ) : (
                <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Wallet Section */}
      {privyUser?.wallet?.address && (
        <div className="p-2 sm:p-4 border-b border-white">
          {/* Enhanced Balances */}
          <div className="bg-gradient-to-br from-blue-50/90 via-purple-50/80 to-indigo-50/90 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/80 shadow-xl shadow-purple-500/20 backdrop-blur-sm relative overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl sm:rounded-2xl animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <div className="p-1 sm:p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md sm:rounded-lg shadow-lg">
                    <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm sm:text-lg font-bold text-gray-800">Token Balances</span>
                  </div>
                </div>
              </div>

              {/* Token Switcher */}
              {supportedTokens.length > 1 && (
                <div className="mb-2">

                  <Select
                    value={localSelectedToken}
                    onValueChange={setLocalSelectedToken}
                  >
                    <SelectTrigger className="w-full h-8 sm:h-10 text-sm sm:text-base bg-white/80 border-indigo-200/50 hover:bg-white/90 transition-colors duration-200">
                      <SelectValue>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img
                            src={localTokenPair?.nativeToken?.logo || "/img/drippay.png"}
                            alt={localSelectedToken}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                          />
                          <span className="font-medium text-sm sm:text-base">{localSelectedToken}</span>
                          <span className="text-gray-500 text-xs sm:text-sm">({localTokenPair?.nativeToken?.name})</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl z-[99999]">
                      {supportedTokens.map((tokenSymbol) => {
                        const tokenPair = getTokenPair(tokenSymbol, activeChain.chainId);
                        return (
                          <SelectItem
                            key={tokenSymbol}
                            value={tokenSymbol}
                            className="text-sm sm:text-base hover:bg-indigo-50/80 transition-colors duration-200"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <img
                                src={tokenPair.nativeToken.logo}
                                alt={tokenSymbol}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                              />
                              <span className="font-medium text-sm sm:text-base">{tokenSymbol}</span>
                              <span className="text-gray-500 text-xs sm:text-sm">({tokenPair.nativeToken.name})</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {/* Native Token Balance */}
                <div className="group bg-gradient-to-r from-blue-100/80 to-blue-200/60 rounded-md sm:rounded-lg p-2 sm:p-3 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <img
                        src={localTokenPair?.nativeToken?.logo || "/img/drippay.png"}
                        alt={nativeTokenSymbol}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-sm"
                      />
                      <span className="text-sm sm:text-base text-blue-700 font-medium">{nativeTokenSymbol}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-lg sm:text-xl font-black text-blue-900 tracking-tight">
                      {balancesLoading ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                          <span className="text-sm sm:text-base">...</span>
                        </div>
                      ) : (
                        eth
                      )}
                    </span>
                  </div>
                </div>

                {/* Super Token Balance */}
                <div className="group bg-gradient-to-r from-purple-100/80 to-purple-200/60 rounded-md sm:rounded-lg p-2 sm:p-3 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <img
                        src={localTokenPair?.superToken?.logo || "/img/drippay.png"}
                        alt={superTokenSymbol}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-sm"
                      />
                      <span className="text-sm sm:text-base text-purple-700 font-medium">{superTokenSymbol}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-lg sm:text-xl font-black text-purple-900 tracking-tight">
                      {balancesLoading ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                          <span className="text-sm sm:text-base">...</span>
                        </div>
                      ) : (
                        ethx
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Loading State */}
              {balancesLoading && (
                <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-gradient-to-r from-yellow-50/90 to-orange-50/80 rounded-md sm:rounded-lg border border-yellow-200/50 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-yellow-700 font-medium">Updating balances...</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Enhanced USDC to USDCx Swap Section */}
          <div className="mt-2 sm:mt-3">
            <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/80 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-emerald-200/50 shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="swap" className="border-none">
                  <AccordionTrigger className="flex items-center justify-between hover:no-underline group">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="p-1 sm:p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md sm:rounded-lg shadow-lg">
                        <ArrowLeftRight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <h5 className="text-sm sm:text-base font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">
                          Token Wrap
                        </h5>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Convert {nativeTokenSymbol} ↔ {superTokenSymbol}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-emerald-100 transition-all duration-300 rounded-lg"
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Wrap between {nativeTokenSymbol} and {superTokenSymbol} tokens. Click the bidirectional arrow to reverse wrap.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-emerald-200/50">
                      <WrapUnwrapToken />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Menu Items */}
      <div className="p-2 sm:p-4 pt-2 sm:pt-3">
        <div className="space-y-1.5">
          {/* Sign Out Button */}
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-between p-2 sm:p-3 text-gray-700 hover:backdrop-blur-md hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 border border-transparent hover:border-red-200/50 transition-all duration-300 rounded-lg sm:rounded-xl group"
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-red-200/40 rounded-md sm:rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-gray-800">Sign Out</span>
                <div className="text-xs text-gray-500">Disconnect wallet</div>
              </div>
            </div>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-300" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Mobile Drawer */}
      {!isDesktop && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="default"
              className="wallet-button group p-[2px] rounded-2xl hover:backdrop-blur-md hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/40"
              onClick={handleButtonClick}
            >
              {privyUser?.twitter?.profilePictureUrl ? (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-white/60 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <img
                    src={privyUser?.twitter?.profilePictureUrl || "/img/twitter.png"}
                    alt="Profile"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
              ) : (
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <User className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="backdrop-blur-xl bg-white/95 border-t border-white/60 rounded-t-3xl shadow-2xl shadow-blue-500/20">
            <WalletContent />
          </DrawerContent>
        </Drawer>
      )}

      {/* Desktop Dropdown */}
      {isDesktop && (
        <>
          <Button
            variant="ghost"
            size="default"
            className="wallet-button group p-[2px] rounded-2xl hover:backdrop-blur-md hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/40"
            onClick={handleButtonClick}
          >
            {privyUser?.twitter?.profilePictureUrl ? (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-white/60 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <img
                  src={privyUser?.twitter?.profilePictureUrl || "/img/twitter.png"}
                  alt="Profile"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
            ) : (
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <User className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
            )}
          </Button>

          {/* Desktop Dropdown Menu */}
          {isDropdownVisible && typeof window !== 'undefined' && (
            <div
              className="wallet-dropdown fixed backdrop-blur-xl bg-white/95 border border-white/60 rounded-2xl shadow-2xl shadow-blue-500/20 transition-all duration-300 z-[99999] animate-in slide-in-from-top-2 fade-in-0 w-[320px]"
              style={{
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              }}
            >
              <WalletContent />
            </div>
          )}
        </>
      )}
    </div>
  );
};
