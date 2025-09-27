'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/src/components/ui/dialog';
import { useSelfVerify } from '@/src/hooks/use-self-verify';
import {
    SelfQRcodeWrapper,
    SelfAppBuilder,
    type SelfApp,
    getUniversalLink,
} from "@selfxyz/qrcode";
import { env } from '../env.mjs';
import { useToast } from '../hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';

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
    const { user: privyUser } = usePrivy();
    const userId = useMemo(() => privyUser?.id, [privyUser?.id]);
    // Use useMemo to cache the array to avoid creating a new array on each render
    const excludedCountries = useMemo(() => [], []);

    // Use useEffect to ensure code only executes on the client side
    useEffect(() => {
        try {
            const app = new SelfAppBuilder({
                version: 2,
                appName: env.NEXT_PUBLIC_SELF_APP_NAME || "PayPulse",
                scope: env.NEXT_PUBLIC_SELF_SCOPE || "self-workshop",
                endpoint: `${env.NEXT_PUBLIC_SELF_ENDPOINT?.toLowerCase()}`,
                logoBase64:
                    "https://res.cloudinary.com/dm6aa7jlg/image/upload/v1758968759/paypulse_nztrst.png", // url of a png image, base64 is accepted but not recommended
                userId: userId,
                endpointType: "staging_celo",
                userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
                userDefinedData: "PYUSD payroll & invoice",
                disclosures: {
                    // what you want to verify from users' identity
                    minimumAge: 18,
                    // ofac: true,
                    excludedCountries: excludedCountries,
                    // what you want users to reveal
                    // name: false,
                    // issuing_state: true,
                    // nationality: true,
                    // date_of_birth: true,
                    // passport_number: false,
                    // gender: true,
                    // expiry_date: false,
                }
            }).build();

            console.log("app", app);

            setSelfApp(app);
            setUniversalLink(getUniversalLink(app));
        } catch (error) {
            console.error("Failed to initialize Self app:", error);
        }
    }, [excludedCountries, userId]);

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

    const handleSuccessfulVerification = async () => {
        try {
            selfVerify(accessToken || "")
            setTimeout(() => queryClient.refetchQueries({ queryKey: ["user", userId, accessToken] }), 1000);
            toast({
                title: "Verification successful",
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Error verifying user:", error);
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
                            {title}
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
                            {selfApp ? (
                                <div className="p-4 bg-white rounded-2xl shadow-xl border border-emerald-100">
                                    <SelfQRcodeWrapper
                                        selfApp={selfApp}
                                        onSuccess={handleSuccessfulVerification}
                                        onError={() => {
                                            toast({
                                                title: "Error: Failed to verify identity",
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
                                        <p className="text-gray-500 text-sm font-medium">Generating QR Code...</p>
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
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{linkCopied ? "Copied!" : "Copy Link"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={openSelfApp}
                            disabled={!universalLink}
                            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-emerald-300 disabled:to-teal-300 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
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


