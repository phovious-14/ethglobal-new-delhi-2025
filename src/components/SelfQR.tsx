'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/src/components/ui/dialog';
import { Shield, Copy, ExternalLink, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useSelfVerify } from '@/src/hooks/use-self-verify';

import {
    SelfQRcodeWrapper,
    SelfAppBuilder,
    type SelfApp,
    countries,
    getUniversalLink,
} from "@selfxyz/qrcode";
import { env } from '../env.mjs';
import { useToast } from '../hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type SelfQRProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    handleSubmit?: () => void;
    accessToken: string;
};

export default function SelfQR({ open, onOpenChange, title = 'Your QR', handleSubmit, accessToken }: SelfQRProps) {
    const { selfVerify } = useSelfVerify();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [linkCopied, setLinkCopied] = useState(false);
    const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
    const [universalLink, setUniversalLink] = useState("");
    const [isInitializing, setIsInitializing] = useState(true);
    const [initError, setInitError] = useState<string | null>(null);
    const [retryTick, setRetryTick] = useState(0);
    const [userId] = useState("0x36dCB6173777a17CE1E0910EC0D6F31a64b6b9c7");
    // Use useMemo to cache the array to avoid creating a new array on each render
    const excludedCountries = useMemo(() => [countries.UNITED_STATES], []);

    // Use useEffect to ensure code only executes on the client side
    useEffect(() => {
        let cancelled = false;
        setIsInitializing(true);
        setInitError(null);

        const appName = env.NEXT_PUBLIC_SELF_APP_NAME;
        const scope = env.NEXT_PUBLIC_SELF_SCOPE;
        const endpoint = env.NEXT_PUBLIC_SELF_ENDPOINT?.toLowerCase();

        // Basic validation
        if (!appName || !scope || !endpoint) {
            setInitError("Missing Self configuration. Please check environment variables.");
            setIsInitializing(false);
            return () => { cancelled = true; };
        }

        const timeoutId = window.setTimeout(() => {
            if (!cancelled) {
                setInitError("QR initialization timed out. Please try again.");
                setIsInitializing(false);
            }
        }, 10000);

        try {
            const app = new SelfAppBuilder({
                version: 2,
                appName: appName || "PayPulse",
                scope: scope || "self-workshop",
                endpoint: endpoint,
                logoBase64: "https://res.cloudinary.com/dm6aa7jlg/image/upload/v1758968759/paypulse_nztrst.png",
                userId: userId,
                endpointType: "staging_celo",
                userIdType: "hex",
                userDefinedData: "PYUSD payroll & invoice",
                disclosures: {
                    minimumAge: 18,
                    excludedCountries: excludedCountries,
                }
            }).build();

            if (cancelled) return;
            setSelfApp(app);
            const link = getUniversalLink(app);
            if (!link) {
                setInitError("Failed to create universal link.");
            } else {
                setUniversalLink(link);
            }
        } catch (error) {
            console.error("Failed to initialize Self app:", error);
            if (!cancelled) setInitError("Failed to initialize Self app. Check network and configuration.");
        } finally {
            if (!cancelled) setIsInitializing(false);
            window.clearTimeout(timeoutId);
        }

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [excludedCountries, userId, retryTick]);

    const copyToClipboard = () => {
        if (!universalLink) return;

        navigator.clipboard
            .writeText(universalLink)
            .then(() => {
                setLinkCopied(true);
                toast({
                    title: "Universal link copied to clipboard!",
                });
                setTimeout(() => setLinkCopied(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy text: ", err);
                toast({
                    title: "Failed to copy link",
                });
            });
    };

    const openSelfApp = () => {
        if (!universalLink) return;

        window.open(universalLink, "_blank");
        toast({
            title: "Opening Self App...",
        });
    };

    const retryInitialization = () => {
        setSelfApp(null);
        setUniversalLink("");
        setInitError(null);
        setIsInitializing(true);
        setRetryTick((n) => n + 1);
    };

    const handleSuccessfulVerification = async () => {
        try {
            selfVerify(accessToken || "")
            queryClient.invalidateQueries({ queryKey: ["user", userId, accessToken] });
            toast({
                title: "Verification successful",
                description: "Your identity has been verified successfully!"
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Error verifying user:", error);
            toast({
                title: "Verification failed",
                description: "There was an error processing your verification.",
                variant: "destructive"
            });
            onOpenChange(false);
            return
        }
        handleSubmit?.();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded-3xl border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/20 backdrop-blur-xl">
                <DialogHeader className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                            <img src="/img/self.png" alt="self-verify" className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                            Identity Verification
                        </DialogTitle>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Scan the QR code with your Self app to verify your identity
                    </p>
                </DialogHeader>

                <div className="space-y-6 p-2">
                    {/* QR Code Section */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {initError ? (
                                <div className="w-[280px] min-h-[280px] bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
                                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                                    <p className="text-red-600 text-sm mb-4 font-medium">{initError}</p>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={retryInitialization}
                                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500 transition-colors shadow-md"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>Retry</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onOpenChange(false)}
                                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : selfApp ? (
                                <div className="p-4 bg-white rounded-2xl shadow-xl border border-emerald-100">
                                    <SelfQRcodeWrapper
                                        selfApp={selfApp}
                                        onSuccess={handleSuccessfulVerification}
                                        onError={() => {
                                            toast({
                                                title: "Verification failed",
                                                description: "Failed to verify identity. Please try again.",
                                                variant: "destructive"
                                            });
                                            onOpenChange(false);
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="w-[280px] h-[280px] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center rounded-2xl shadow-xl border border-gray-200">
                                    <div className="text-center space-y-3">
                                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-gray-500 text-sm font-medium">{isInitializing ? "Generating QR Code..." : "Preparing..."}</p>
                                    </div>
                                </div>
                            )}

                            {/* Decorative elements */}
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-60 animate-pulse"></div>
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={copyToClipboard}
                            disabled={!universalLink}
                            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {linkCopied ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    <span>Copy Link</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={openSelfApp}
                            disabled={!universalLink}
                            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-emerald-300 disabled:to-teal-300 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open Self App</span>
                        </button>
                    </div>

                    {/* User Address Display */}
                    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/50 rounded-xl p-4">
                        <div className="text-center space-y-2">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-emerald-700 text-xs uppercase tracking-wide font-semibold">
                                    Connected Wallet
                                </span>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/60">
                                <p className="text-gray-700 text-sm font-mono break-all">
                                    {userId || <span className="text-gray-400">Not connected</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


