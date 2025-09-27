'use client';

import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { useToast } from '@/src/hooks/use-toast';
import { useInstant } from '@/src/hooks/use-instant';
import { useBalances } from '@/src/hooks/use-balances';
import { useToken } from '@/src/app/context/TokenContext';
import { TokenSelector } from '@/src/components/ui/token-selector';
import { ethers } from 'ethers';
import {
    Send,
    Wallet,
    Copy,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowRight,
    Zap
} from 'lucide-react';

export const TransferToken = () => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [showAnimation, setShowAnimation] = useState(false);
    const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});
    const [streamData, setStreamData] = useState<{
        name: string;
        recipientName: string;
        walletAddress: string;
        amount: string;
    }>({
        name: "",
        recipientName: "",
        walletAddress: "",
        amount: "",
    });

    const { createSuperfluidInstantAsync, isSuperfluidTransferPending } = useInstant();
    const { activeSymbol, tokenPair } = useToken();
    const balances = useBalances(activeSymbol);

    // Validation functions
    const validateRecipient = (address: string) => {
        if (!address) {
            return 'Recipient address is required';
        }
        if (!ethers.utils.isAddress(address)) {
            return 'Invalid Ethereum address';
        }
        return '';
    };

    const validateAmount = (amount: string) => {
        if (!amount) {
            return 'Amount is required';
        }
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return 'Amount must be greater than 0';
        }
        if (!balances?.superToken) {
            return 'Unable to fetch balance';
        }
        const balanceNum = parseFloat(balances.superToken);
        if (numAmount > balanceNum) {
            return `Insufficient balance. You have ${balances.superToken} ${balances.superTokenSymbol}`;
        }
        return '';
    };

    // Handle input changes with validation
    const handleRecipientChange = (value: string) => {
        setRecipientAddress(value);
        const error = validateRecipient(value);
        setErrors(prev => ({ ...prev, recipient: error }));
    };

    const handleAmountChange = (value: string) => {
        setAmount(value);
        const error = validateAmount(value);
        setErrors(prev => ({ ...prev, amount: error }));
    };

    // Transfer function
    const transferSuperToken = async () => {
        if (!recipientAddress || !amount) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        const data = await createSuperfluidInstantAsync({
            recipientAddress,
            amount,
            superTokenAddr: tokenPair.superToken.address,
            decimals: tokenPair.superToken.decimals
        });
        setStreamData({
            name: "Transfer",
            recipientName: "Recipient",
            walletAddress: data.recipientAddress,
            amount: data.amount,
        });
        setShowAnimation(true);
        setTimeout(() => {
            setStreamData({
                name: "",
                recipientName: "",
                walletAddress: "",
                amount: "",
            });
            setShowAnimation(false);
        }, 10000);
    };

    // Check if form is valid
    const isFormValid = recipientAddress && amount && !errors.recipient && !errors.amount;

    // Copy address to clipboard
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: "Address Copied",
                description: "Address copied to clipboard",
            });
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4">


            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                            <Send className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2 tracking-tight">Transfer {balances?.superTokenSymbol || 'Super Token'}</h1>
                    <p className="text-gray-600 font-sans font-medium">Send {balances?.superTokenSymbol || 'Super Token'} tokens to any wallet address</p>
                </div>

                {/* Main Card */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg font-heading font-bold tracking-tight">
                            <Zap className="h-5 w-5 text-blue-600" />
                            Transfer Details
                        </CardTitle>
                        <CardDescription className="font-sans font-medium">
                            Transfer {balances?.superTokenSymbol || 'Super Token'} using Superfluid's transfer function
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Token Selector */}
                        <TokenSelector
                            size="md"
                            showLabel={true}
                            className="w-full"
                        />

                        {/* Current Balance */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">Your Balance</span>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    {balances?.superToken || '0'} {balances?.superTokenSymbol || 'Super Token'}
                                </Badge>
                            </div>
                        </div>

                        {/* Recipient Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Recipient Address
                            </label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="0x..."
                                    value={recipientAddress}
                                    onChange={(e) => handleRecipientChange(e.target.value)}
                                    className={`pr-10 ${errors.recipient ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    disabled={isSuperfluidTransferPending}
                                />
                                {recipientAddress && (
                                    <button
                                        onClick={() => copyToClipboard(recipientAddress)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        {copied ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                            {errors.recipient && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        {errors.recipient}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Amount ({balances?.superTokenSymbol || 'Super Token'})
                            </label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                className={errors.amount ? 'border-red-500 focus:ring-red-500' : ''}
                                disabled={isSuperfluidTransferPending}
                                step="0.000001"
                                min="0"
                            />
                            {errors.amount && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        {errors.amount}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <Separator />

                        {/* Transfer Button */}
                        <Button
                            onClick={transferSuperToken}
                            disabled={!isFormValid || isSuperfluidTransferPending}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSuperfluidTransferPending ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Transferring...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Send className="h-5 w-5" />
                                    <span>Transfer {balances?.superTokenSymbol || 'Super Token'}</span>
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};