'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    FileText,
    RefreshCw,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Zap,
    Waves,
    SendIcon,
    ArrowDown
} from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { useDistribution } from '@/src/app/context/DistributionContext';
import { useTransactionRecords } from '@/src/hooks/use-records';
import { usePrivy } from '@privy-io/react-auth';
import { env } from '@/src/env.mjs';
import { getTokenConfig } from '@/src/utils/tokenConfig';
import { useToast } from '@/src/components/ui/use-toast';
import { getCurrencyLogo } from '@/src/utils/getCurrencyLogo';
import { calculateStreamAmountSimple } from '@/src/utils/calculateStreamAmount';
import InstantPayrollTable from '@/src/components/payroll/InstantPayrollTable';
import StreamPayrollTable from '@/src/components/payroll/StreamPayrollTable';
import { Button } from '@/src/components/ui/button';
import { useChain } from '@/src/app/context/ChainContext';

export default function PayrollPage() {
    const { isInstantDistribution, isSenderMode } = useDistribution();
    const [accessToken, setAccessToken] = useState('');
    const { user, ready, getAccessToken } = usePrivy();
    const { toast } = useToast()
    const { activeChain } = useChain();

    const getUserAccessToken = useCallback(async () => {
        const userAccessToken = await getAccessToken();
        if (userAccessToken) {
            setAccessToken(userAccessToken);
        }
    }, [getAccessToken]);

    const {
        streamRecords,
        instantRecords,
        isLoading,
        error,
        refetch,
    } = useTransactionRecords(accessToken, isInstantDistribution, user?.wallet?.address || '', isSenderMode ? 'sender' : 'receiver', activeChain.chainId.toString());

    // Use the appropriate records based on distribution type
    const currentRecords = isInstantDistribution ? instantRecords : streamRecords;

    // Use API data if available, otherwise fallback to static data
    const finalRecords = React.useMemo(() => {
        if (isLoading) return [];
        if (error) {
            console.error('Error loading records:', error);
            return []; // Return empty array on error, could show fallback data instead
        }
        return Array.isArray(currentRecords) ? currentRecords : [];
    }, [currentRecords, isLoading, error]);

    useEffect(() => {
        if (user && ready) {
            getUserAccessToken();
        }
    }, [user, ready, getUserAccessToken]);

    const handleDownloadInvoice = async (record: any) => {
        try {
            // Fetch the file as a blob
            const response = await fetch(record.invoice?.documentUrl || '#');
            if (!response.ok) {
                throw new Error('Failed to download invoice');
            }

            const blob = await response.blob();

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${record.invoice?.invoiceNumber}.pdf`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Download Started",
                description: `Invoice ${record.invoice?.invoiceNumber} is being downloaded.`,
            });
        } catch (error) {
            console.error('Download failed:', error);
            toast({
                title: "Download Failed",
                description: "Failed to download the invoice. Please try again.",
                variant: "destructive",
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Calculate statistics based on current records
    const totalAmount = (finalRecords || []).reduce((sum: number, record: any) => {
        if (isInstantDistribution) {
            // Convert from wei to token units directly
            const amountWei = BigInt(record.amount?.toString() || '0');
            const divisor = BigInt(Math.pow(10, getTokenConfig(activeChain.chainId).superToken.decimals));
            const amount = Number(amountWei) / Number(divisor);
            return sum + amount;
        } else {
            // For streams, use the same logic as USDCStreamVisualizer
            if (record.streamStatus === 'completed' && record.streamEndTime) {
                // For completed streams, calculate from start to end date
                const totalSent = calculateStreamAmountSimple(
                    record.flowRate,
                    new Date(record.streamStartTime),
                    new Date(record.streamEndTime),
                    activeChain.chainId
                );
                return sum + totalSent;
            } else if (record.streamStatus === 'active') {
                // For active streams, calculate from start to now
                const totalSent = calculateStreamAmountSimple(
                    record.flowRate,
                    new Date(record.streamStartTime),
                    new Date(), // Current time
                    activeChain.chainId
                );
                return sum + totalSent;
            }
            return sum;
        }
    }, 0);
    const completedCount = (finalRecords || []).filter((record: any) => {
        const status = isInstantDistribution ? record.invoice?.invoiceStatus : record.streamStatus;
        return status === 'paid' || status === 'completed';
    }).length;
    // Change: Use 'active' for stream, 'pending' for instant
    const activeOrPendingCount = (finalRecords || []).filter((record: any) => {
        if (isInstantDistribution) {
            const status = record.invoice?.invoiceStatus;
            return status === 'pending';
        } else {
            const status = record.streamStatus;
            return status === 'active';
        }
    }).length;
    const successRate = (finalRecords || []).length > 0 ? (completedCount / (finalRecords || []).length) * 100 : 0;

    // Calculate max amount properly
    const maxAmount = (finalRecords || []).reduce((max: number, record: any) => {
        // Convert from wei to token units directly
        const amountWei = BigInt(record.amount?.toString() || '0');
        const divisor = BigInt(Math.pow(10, getTokenConfig(activeChain.chainId).superToken.decimals));
        const amount = Number(amountWei) / Number(divisor);
        return Math.max(max, amount);
    }, 0);

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-10">
                {/* Header Section */}
                <Card className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl sm:rounded-3xl">
                    <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                                <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl">
                                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-heading font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent tracking-tight leading-tight">
                                        Payrolls
                                    </CardTitle>
                                    <p className="text-slate-600 mt-1 flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-sans font-semibold">
                                        <span>Managing {isInstantDistribution ? 'Instant' : 'Streaming'} distributions as {isSenderMode ? 'Sender' : 'Receiver'}</span>
                                        {isInstantDistribution ? (
                                            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                                        ) : (
                                            <Waves className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                                        )}
                                        {isSenderMode ? (
                                            <SendIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                        ) : (
                                            <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>



                {/* Interactive Statistics Cards */}
                <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-${isInstantDistribution ? '3' : '4'} gap-3 sm:gap-4 lg:gap-8`}>
                    {/* Total Distributed Card */}
                    <Card className="group bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer transform hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl"></div>
                        <CardContent className="p-3 sm:p-6 lg:p-8 relative z-10">
                            <div className="flex items-center justify-between mb-2 sm:mb-4">
                                <div className="flex items-center gap-1.5 sm:gap-3">
                                    <Image src={getCurrencyLogo()} alt="Currency Logo" width={24} height={24} className="w-5 h-5 sm:w-8 sm:h-8 lg:w-8 lg:h-8 rounded-full group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-600 text-xs font-sans font-semibold tracking-wide uppercase mb-0.5 sm:mb-1 group-hover:text-blue-600 transition-colors duration-300">Total Distributed</p>
                                    <p className="text-sm sm:text-xl lg:text-2xl font-heading font-bold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors duration-300">
                                        ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
                                        {finalRecords.length} {isInstantDistribution ? 'payments' : 'streams'}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full h-1 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out group-hover:from-blue-600 group-hover:to-purple-700"
                                    style={{ width: `${Math.min((totalAmount / 10000) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="mt-1.5 sm:mt-3 flex items-center justify-between text-xs text-slate-500">
                                <span>Avg: ${finalRecords.length > 0 ? (totalAmount / finalRecords.length).toFixed(5) : '0'}</span>
                                <span>Max: ${maxAmount.toFixed(5)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completed Card */}
                    <Card className="group bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer transform hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl"></div>
                        <CardContent className="p-3 sm:p-6 lg:p-8 relative z-10">
                            <div className="flex items-center justify-between mb-2 sm:mb-4">
                                <div className="p-1 sm:p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                    <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-600 text-xs font-sans font-semibold tracking-wide uppercase mb-0.5 sm:mb-1 group-hover:text-green-600 transition-colors duration-300">Completed</p>
                                    <p className="text-sm sm:text-xl lg:text-2xl font-heading font-bold text-slate-900 tracking-tight group-hover:text-green-700 transition-colors duration-300">{completedCount}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
                                        {finalRecords.length > 0 ? ((completedCount / finalRecords.length) * 100).toFixed(1) : '0'}% of total
                                    </p>
                                </div>
                            </div>
                            <div className="w-full h-1 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out group-hover:from-green-600 group-hover:to-emerald-700"
                                    style={{ width: `${finalRecords.length > 0 ? (completedCount / finalRecords.length) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <div className="mt-1.5 sm:mt-3 flex items-center justify-between text-xs text-slate-500">
                                <span>This month: {completedCount}</span>
                                <span>Last month: {Math.floor(completedCount * 0.8)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Card - Only for streams */}
                    {!isInstantDistribution && (
                        <Card className="group bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer transform hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl"></div>
                            <CardContent className="p-3 sm:p-6 lg:p-8 relative z-10">
                                <div className="flex items-center justify-between mb-2 sm:mb-4">
                                    <div className="p-1 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                        <Waves className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-600 text-xs font-sans font-semibold tracking-wide uppercase mb-0.5 sm:mb-1 group-hover:text-blue-600 transition-colors duration-300">Active Streams</p>
                                        <p className="text-sm sm:text-xl lg:text-2xl font-heading font-bold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors duration-300">{activeOrPendingCount}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
                                            {finalRecords.length > 0 ? ((activeOrPendingCount / finalRecords.length) * 100).toFixed(1) : '0'}% of total
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full h-1 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out group-hover:from-blue-600 group-hover:to-indigo-700"
                                        style={{ width: `${finalRecords.length > 0 ? (activeOrPendingCount / finalRecords.length) * 100 : 0}%` }}
                                    ></div>
                                </div>

                            </CardContent>
                        </Card>
                    )}

                    {/* Success Rate Card */}
                    <Card className="group bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer transform hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl"></div>
                        <CardContent className="p-3 sm:p-6 lg:p-8 relative z-10">
                            <div className="flex items-center justify-between mb-2 sm:mb-4">
                                <div className="p-1 sm:p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-600 text-xs font-sans font-semibold tracking-wide uppercase mb-0.5 sm:mb-1 group-hover:text-purple-600 transition-colors duration-300">Success Rate</p>
                                    <p className="text-sm sm:text-xl lg:text-2xl font-heading font-bold text-slate-900 tracking-tight group-hover:text-purple-700 transition-colors duration-300">{Math.round(successRate)}%</p>
                                    <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
                                        {completedCount} of {finalRecords.length} successful
                                    </p>
                                </div>
                            </div>
                            <div className="w-full h-1 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-1000 ease-out group-hover:from-purple-600 group-hover:to-pink-700"
                                    style={{ width: `${successRate}%` }}
                                ></div>
                            </div>
                            <div className="mt-1.5 sm:mt-3 flex items-center justify-between text-xs text-slate-500">
                                <span>Target: 95%</span>
                                <span className={successRate >= 95 ? 'text-green-600' : 'text-orange-600'}>
                                    {successRate >= 95 ? '✓ On track' : '⚠ Needs attention'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <Card className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl sm:rounded-3xl">
                        <CardContent className="p-8 sm:p-12 lg:p-20">
                            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl">
                                    <RefreshCw className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 animate-spin text-white" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900 mb-2 sm:mb-4 tracking-tight">
                                        Loading {isInstantDistribution ? 'Instant' : 'Stream'} Records
                                    </h3>
                                    <p className="text-slate-600 text-sm sm:text-base font-sans font-medium">
                                        Fetching your transaction data...
                                    </p>
                                </div>
                                <div className="w-32 sm:w-40 lg:w-48 h-1.5 sm:h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <Card className="bg-white/95 backdrop-blur-xl border border-red-200/60 shadow-2xl rounded-2xl sm:rounded-3xl">
                        <CardContent className="p-6 sm:p-8 lg:p-10">
                            <div className="flex items-start gap-4 sm:gap-6 lg:gap-8">
                                <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl">
                                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900 mb-2 sm:mb-4 tracking-tight">Error Loading Records</h3>
                                    <p className="text-slate-600 mb-4 sm:mb-6 lg:mb-8 leading-relaxed text-sm sm:text-base font-sans font-medium">
                                        {error.message || 'Failed to load transaction records. Please try again.'}
                                    </p>
                                    <Button
                                        onClick={() => refetch?.()}
                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg"
                                    >
                                        <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Table Section with Integrated Controls */}
                {!isLoading && !error && (
                    <Card className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl sm:rounded-3xl">

                        {/* Table Content */}
                        <CardContent className="p-0">
                            {(finalRecords || []).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
                                    <div className="text-center space-y-4 sm:space-y-6 lg:space-y-8">
                                        <div className="mx-auto w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-slate-200/50 shadow-xl sm:shadow-2xl">
                                            {isInstantDistribution ? (
                                                <Zap className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600" />
                                            ) : (
                                                <Waves className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900 mb-2 sm:mb-4 tracking-tight">
                                                No {isInstantDistribution ? 'Instant' : 'Stream'} Records Found
                                            </h3>
                                            <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base leading-relaxed font-sans font-medium">
                                                {isInstantDistribution
                                                    ? "You haven't created any instant payments yet. Start by creating your first instant distribution."
                                                    : "You haven't created any streaming payments yet. Start by creating your first payment stream."
                                                }
                                            </p>
                                        </div>
                                        <div className="w-24 sm:w-28 lg:w-32 h-1.5 sm:h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
                                    </div>
                                </div>
                            ) : (
                                isInstantDistribution ? (
                                    <InstantPayrollTable
                                        records={finalRecords || []}
                                        isSenderMode={isSenderMode}
                                        onDownloadInvoice={handleDownloadInvoice}
                                        onCopy={copyToClipboard}
                                        onViewTx={(txHash) => {
                                            window.open(`https://${env.NEXT_PUBLIC_NETWORK === 'TESTNET' ? 'sepolia.' : ''}etherscan.io/tx/${txHash}`, '_blank');
                                        }}
                                    />
                                ) : (
                                    <StreamPayrollTable
                                        accessToken={accessToken}
                                        records={finalRecords || []}
                                        isSenderMode={isSenderMode}
                                        onDownloadInvoice={handleDownloadInvoice}
                                        onCopy={copyToClipboard}
                                        onViewTx={(txHash) => {
                                            window.open(`https://${env.NEXT_PUBLIC_NETWORK === 'TESTNET' ? 'sepolia.' : ''}etherscan.io/tx/${txHash}`, '_blank');
                                        }}
                                    />
                                )
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}