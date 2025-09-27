"use client";

import React, { useState, useEffect } from "react";
import { Home, Coins, Zap, HelpCircle, Star, Briefcase, DollarSign, MessageCircle, Menu, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { AuthButton } from "./AuthButton";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Image from "next/image";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";

type LayoutProps = {
  children: React.ReactNode;
  className?: string;
  promptLogin?: boolean;
};

const Layout = ({ children, className, promptLogin }: LayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { wallets } = useWallets();
  const { signer } = useSigner(wallets);
  const { ready, authenticated, linkWallet, user } = usePrivy();
  const { login } = useLogin();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { title: 'Home', href: '/', dropdown: false },
    { title: 'Usecases', href: '#usecases', dropdown: false },
    { title: 'FAQ', href: '#faq', dropdown: false },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Enhanced Glassmorphic Navigation */}
      <nav className="fixed top-4 left-2 right-2 sm:left-10 sm:right-10 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6">
              {/* Enhanced Logo */}
              <Link href="/" className={`flex items-center group space-x-2 sm:space-x-3`}>
                <div className="relative">
                  <Image
                    src="/img/drippay.png"
                    alt="DripPay"
                    width={32}
                    height={32}
                    className="rounded-lg w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-2xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Drip</span>
                    <span className="text-white ml-1">Pay</span>
                  </div>
                </div>
              </Link>

              {/* Enhanced Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2">

                <Link
                  href="/"
                  className={`px-4 sm:px-6 py-3 font-medium text-sm rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:border hover:border-blue-500/30 backdrop-blur-sm`}
                >
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </div>
                </Link>

                <Link
                  href="/blog"
                  className={`px-4 sm:px-6 py-3 font-medium text-sm rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-purple-500/20 hover:border hover:border-indigo-500/30 backdrop-blur-sm`}
                >
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>Blog</span>
                  </div>
                </Link>

                <Link
                  href="#future"
                  className={`px-4 sm:px-6 py-3 font-medium text-sm rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 hover:border hover:border-emerald-500/30 backdrop-blur-sm`}
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>What's Next</span>
                  </div>
                </Link>

                <Link
                  href="#faq"
                  className={`px-4 sm:px-6 py-3 font-medium text-sm rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:border hover:border-blue-500/30 backdrop-blur-sm`}
                >
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>FAQ</span>
                  </div>
                </Link>

                <div className="relative">
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
                    className={`px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-300 cursor-pointer flex items-center space-x-2 relative overflow-hidden group ${isActive('/my-campaigns') || isActive('/send-streams') || isActive('/receive-streams')
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/50 shadow-lg'
                      : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border border-transparent shadow-xl hover:shadow-2xl hover:shadow-orange-500/25 hover:scale-105'
                      }`}
                    style={{
                      background: isActive('/my-campaigns') || isActive('/send-streams') || isActive('/receive-streams')
                        ? 'linear-gradient(45deg, rgba(249, 115, 22, 0.2), rgba(239, 68, 68, 0.2))'
                        : 'linear-gradient(90deg, #f97316, #dc2626, #ea580c, #f97316)',
                      backgroundSize: isActive('/my-campaigns') || isActive('/send-streams') || isActive('/receive-streams')
                        ? '200% 200%'
                        : '200% 100%',
                      animation: isActive('/my-campaigns') || isActive('/send-streams') || isActive('/receive-streams')
                        ? 'none'
                        : 'shimmer 3s ease-in-out infinite',
                    }}
                  >
                    <Zap className="w-4 h-4 group-hover:animate-pulse" />
                    <span>Launch App</span>
                  </Button>
                </div>
              </div>

              {/* Enhanced Mobile Menu Button */}
              <div className="flex items-center space-x-3">
                <button
                  className="md:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 focus:outline-none backdrop-blur-sm"
                  aria-label="Open menu"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-6 h-6 text-gray-300" />
                </button>
                <div className="hidden sm:block">
                  <AuthButton promptLogin={promptLogin} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <div className="absolute top-4 right-4 left-4 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Image
                    src="/img/drippay.png"
                    alt="DripPay"
                    width={32}
                    height={32}
                    className="rounded-lg w-8 h-8"
                  />
                  <div className="text-xl font-black">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Drip</span>
                    <span className="text-white ml-1">Pay</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 flex items-center justify-center transition-all duration-300 hover:border-gray-500/50"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              <div className="space-y-3">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </Link>

                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-300"
                >
                  <Star className="w-5 h-5" />
                  <span className="font-medium">Blog</span>
                </Link>

                <Link
                  href="#future"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">What's Next</span>
                </Link>

                <Link
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">FAQ</span>
                </Link>

                <Button
                  onClick={() => {
                    if (!signer && user) {
                      linkWallet();
                    } else if (!signer || !authenticated || !user) {
                      login();
                    } else {
                      router.push('/dashboard');
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                >
                  <Zap className="w-5 h-5" />
                  <span>Launch App</span>
                </Button>

                <div className="pt-3 border-t border-gray-700/50">
                  <AuthButton promptLogin={promptLogin} />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className={className}>
        {children}
      </main>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />

      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
