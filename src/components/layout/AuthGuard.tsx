"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const router = useRouter();
    const { authenticated, ready } = usePrivy();
    const { wallets, ready: walletsReady } = useWallets();

    useEffect(() => {
        // Only check authentication when both Privy and wallets are ready
        if (ready && walletsReady) {
            // If user is not authenticated or has no wallets, redirect to home
            if (!authenticated || wallets.length === 0) {
                router.push("/");
            }
        }
    }, [authenticated, wallets.length, ready, walletsReady, router]);

    // Show loading state while checking authentication
    if (!ready || !walletsReady) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 flex flex-col items-center space-y-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
                            Checking Authentication
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Verifying wallet connection...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // If user is not authenticated or has no wallets, show redirect message
    if (!authenticated || wallets.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 flex flex-col items-center space-y-4">
                    <div className="p-3 bg-gradient-to-br from-red-500 via-pink-600 to-red-600 rounded-2xl shadow-2xl">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-red-900 via-pink-900 to-red-800 bg-clip-text text-transparent">
                            Authentication Required
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Redirecting to home page...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // If authenticated and has wallets, render children
    return <>{children}</>;
}; 