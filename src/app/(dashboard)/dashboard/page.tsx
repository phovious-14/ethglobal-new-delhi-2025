'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { useDistribution } from '@/src/app/context/DistributionContext';
import { usePrivy } from '@privy-io/react-auth';
import { useTransactionRecords } from '@/src/hooks/use-records';
import { getTokenConfig } from '@/src/utils/tokenConfig';
import { calculateStreamAmountSimple } from '@/src/utils/calculateStreamAmount';
import {
    DollarSign,
    Users,
    Activity,
    TrendingUp,
    Waves,
    Zap,
    Clock,
    CheckCircle,
    AlertCircle,
    Coins,
    BarChart3,
    Shield,
    Sparkles,
    CreditCard,
    PieChart,
    LineChart,
    Target,
    RefreshCw,
    Network,
    SendIcon,
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Cell, Pie, BarChart, Bar } from 'recharts';
import { useChain } from '@/src/app/context/ChainContext';

export default function DashboardPage() {
    const { isSenderMode } = useDistribution();
    const [activeTab, setActiveTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('7d');
    const [accessToken, setAccessToken] = useState('');
    const { user, ready, getAccessToken } = usePrivy();
    const { activeChain } = useChain();

    const getUserAccessToken = useCallback(async () => {
        const userAccessToken = await getAccessToken();
        if (userAccessToken) {
            setAccessToken(userAccessToken);
        }
    }, [getAccessToken]);

    // Fetch both stream and instant records for comprehensive dashboard view
    const {
        streamRecords,
        isLoading,
        error,
    } = useTransactionRecords(accessToken, false, user?.wallet?.address || '', isSenderMode ? 'sender' : 'receiver', activeChain.chainId.toString()); // Always fetch streams

    // Fetch instant records separately
    const {
        instantRecords: instantRecordsData,
        isLoading: isLoadingInstants,
        error: instantError,
    } = useTransactionRecords(accessToken, true, user?.wallet?.address || '', isSenderMode ? 'sender' : 'receiver', activeChain.chainId.toString()); // Always fetch instants

    // Combine both stream and instant records for comprehensive dashboard view
    const combinedRecords = React.useMemo(() => {
        if (isLoading || isLoadingInstants) return [];
        if (error || instantError) {
            console.error('Error loading records:', error || instantError);
            return [];
        }

        const streamArray = Array.isArray(streamRecords) ? streamRecords : [];
        const instantArray = Array.isArray(instantRecordsData) ? instantRecordsData : [];

        // Add type identifier to each record
        const streamsWithType = streamArray.map((record: any) => ({ ...record, paymentType: 'stream' }));
        const instantsWithType = instantArray.map((record: any) => ({ ...record, paymentType: 'instant' }));

        return [...streamsWithType, ...instantsWithType];
    }, [streamRecords, instantRecordsData, isLoading, isLoadingInstants, error, instantError]);

    // Use combined records for dashboard statistics
    const finalRecords = combinedRecords;

    // Generate dynamic daily activity data based on time range
    const generateDailyActivityData = (records: any[], range: string) => {
        if (records.length === 0) {
            return [];
        }

        const now = new Date();
        let startDate: Date;
        let timeSlots: string[] = [];
        let timeFormat: string;

        // Calculate start date based on range
        switch (range) {
            case '1d':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                timeSlots = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
                timeFormat = 'hour';
                break;
            case '3d':
                startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
                timeSlots = ['Day 1', 'Day 2', 'Day 3'];
                timeFormat = 'day';
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                timeSlots = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                timeFormat = 'day';
                break;
            case '1m':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                timeSlots = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                timeFormat = 'week';
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                timeSlots = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                timeFormat = 'day';
        }

        // Filter records within the time range
        const filteredRecords = records.filter((record: any) => {
            const recordDate = new Date(record.createdAt || record.startTime);
            return recordDate >= startDate && recordDate <= now;
        });

        // Initialize data structure
        const activityData: { [key: string]: number } = {};
        timeSlots.forEach(slot => {
            activityData[slot] = 0;
        });

        // Process filtered records - calculate total sent amounts
        filteredRecords.forEach((record: any) => {
            const recordDate = new Date(record.createdAt || record.startTime);
            let totalAmount = 0;

            if (record.paymentType === 'instant') {
                // For instant payments, convert from token decimals
                const amountWei = BigInt(record.amount?.toString() || '0');
                const divisor = BigInt(Math.pow(10, getTokenConfig(activeChain.chainId).superToken.decimals));
                totalAmount = Number(amountWei) / Number(divisor);
            } else {
                // For streams, calculate total sent amount
                if (record.streamStatus === 'completed' && record.streamEndTime) {
                    // For completed streams, calculate from start to end date
                    totalAmount = calculateStreamAmountSimple(
                        record.flowRate,
                        new Date(record.streamStartTime),
                        new Date(record.streamEndTime),
                        activeChain.chainId
                    );
                } else if (record.streamStatus === 'active') {
                    // For active streams, calculate from start to now
                    totalAmount = calculateStreamAmountSimple(
                        record.flowRate,
                        new Date(record.streamStartTime),
                        new Date(), // Current time
                        activeChain.chainId
                    );
                }
            }

            let timeSlot: string = '';

            if (timeFormat === 'hour') {
                const hour = recordDate.getHours();
                if (hour < 4) timeSlot = '00:00';
                else if (hour < 8) timeSlot = '04:00';
                else if (hour < 12) timeSlot = '08:00';
                else if (hour < 16) timeSlot = '12:00';
                else if (hour < 20) timeSlot = '16:00';
                else timeSlot = '20:00';
            } else if (timeFormat === 'day') {
                const dayDiff = Math.floor((now.getTime() - recordDate.getTime()) / (24 * 60 * 60 * 1000));
                if (range === '3d') {
                    timeSlot = timeSlots[Math.min(dayDiff, 2)];
                } else {
                    const dayOfWeek = recordDate.getDay();
                    timeSlot = timeSlots[dayOfWeek];
                }
            } else if (timeFormat === 'week') {
                const weekDiff = Math.floor((now.getTime() - recordDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
                timeSlot = timeSlots[Math.min(weekDiff, 3)];
            }

            if (timeSlot && activityData.hasOwnProperty(timeSlot)) {
                activityData[timeSlot] += totalAmount;
            }
        });

        // Create data array with all time slots (including zero values)
        const dynamicData = timeSlots.map(slot => ({
            time: slot,
            amount: Math.round(activityData[slot] * 100) / 100
        }));

        // Sort data by time for proper chronological order
        return dynamicData.sort((a, b) => {
            if (timeFormat === 'hour') {
                return parseInt(a.time) - parseInt(b.time);
            } else if (timeFormat === 'day' && range === '3d') {
                return parseInt(a.time.split(' ')[1]) - parseInt(b.time.split(' ')[1]);
            } else if (timeFormat === 'week') {
                return parseInt(a.time.split(' ')[1]) - parseInt(b.time.split(' ')[1]);
            }
            return 0;
        });
    };

    const dailyActivityData = generateDailyActivityData(finalRecords, timeRange);

    // Use only real data for chart visualization
    const enhancedDailyActivityData = React.useMemo(() => {
        // Use only real data with proper formatting
        const realData = dailyActivityData.map(item => ({
            time: item.time,
            amount: Math.round(item.amount * 100) / 100,
            hasRealData: true
        }));

        // Sort data by time for proper chronological order
        return realData.sort((a, b) => {
            if (timeRange === '1d') {
                return parseInt(a.time) - parseInt(b.time);
            } else if (timeRange === '3d') {
                return parseInt(a.time.split(' ')[1]) - parseInt(b.time.split(' ')[1]);
            } else if (timeRange === '1m') {
                return parseInt(a.time.split(' ')[1]) - parseInt(b.time.split(' ')[1]);
            }
            // For 7d, maintain day order
            const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return dayOrder.indexOf(a.time) - dayOrder.indexOf(b.time);
        });
    }, [dailyActivityData, timeRange]);

    // Generate distribution data from real combined data - only Stream and Instant
    const distributionData = [
        { name: 'Stream', value: finalRecords.filter((r: any) => r.paymentType === 'stream').length, color: '#3B82F6' },
        { name: 'Instant', value: finalRecords.filter((r: any) => r.paymentType === 'instant').length, color: '#10B981' },
    ];

    useEffect(() => {
        if (user && ready) {
            getUserAccessToken();
        }
    }, [user, ready, getUserAccessToken]);

    // Calculate real statistics from combined payroll data
    const totalAmount = (finalRecords || []).reduce((sum: number, record: any) => {
        if (record.paymentType === 'instant') {
            // For instant payments, convert from token decimals
            const amountWei = BigInt(record.amount?.toString() || '0');
            const divisor = BigInt(Math.pow(10, getTokenConfig(activeChain.chainId).superToken.decimals));
            const amount = Number(amountWei) / Number(divisor);
            return sum + amount;
        } else {
            // For streams, use the same logic as payroll page
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
        if (record.paymentType === 'instant') {
            return record.invoice?.invoiceStatus === 'paid';
        } else {
            return record.streamStatus === 'completed';
        }
    }).length;

    const activeOrPendingCount = (finalRecords || []).filter((record: any) => {
        if (record.paymentType === 'instant') {
            return record.invoice?.invoiceStatus === 'pending';
        } else {
            return record.streamStatus === 'active';
        }
    }).length;

    const successRate = (finalRecords || []).length > 0 ? (completedCount / (finalRecords || []).length) * 100 : 0;

    // Calculate additional metrics from combined data
    const totalPayments = finalRecords.length;
    const streamCount = finalRecords.filter((r: any) => r.paymentType === 'stream').length;
    const instantCount = finalRecords.filter((r: any) => r.paymentType === 'instant').length;
    const activeStreams = activeOrPendingCount;
    const totalDistributed = totalAmount;
    const monthlyGrowth = finalRecords.length > 0 ? Math.min((finalRecords.length / 10) * 100, 50) : 0; // Mock growth based on record count
    const networkUptime = 99.9;
    const averageGasPrice = 0.002;
    // Calculate total recipients with better error handling and debugging
    const totalRecipients = React.useMemo(() => {
        if (finalRecords.length === 0) return 0;

        // Filter out records with invalid receiver addresses
        const validRecords = finalRecords.filter((r: any) =>
            r.receiverWalletAddress &&
            r.receiverWalletAddress.trim() !== '' &&
            r.receiverWalletAddress !== 'undefined' &&
            r.receiverWalletAddress !== 'null'
        );

        // Create a set of unique receiver addresses
        const uniqueRecipients = new Set(validRecords.map((r: any) => r.receiverWalletAddress.toLowerCase()));

        return uniqueRecipients.size;
    }, [finalRecords]);
    const scrollTransactions = finalRecords.length * 2; // Mock calculation
    const usdcVolume = totalAmount; // Already converted in totalAmount calculation

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return {
                date: diffInHours < 1 ? 'Just now' : `${Math.floor(diffInHours)}h ago`,
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        } else if (diffInHours < 48) {
            return {
                date: 'Yesterday',
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        } else {
            return {
                date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        }
    };

    // Generate recent transactions from combined real data, sorted by start time
    const recentTransactions = finalRecords
        .sort((a: any, b: any) => {
            const timeA = new Date(a.createdAt || a.startTime || 0).getTime();
            const timeB = new Date(b.createdAt || b.startTime || 0).getTime();
            return timeB - timeA; // Sort by newest first
        })
        .slice(0, 5)
        .map((record: any, index: number) => {
            const isStream = record.paymentType === 'stream';
            const startTime = record.createdAt || record.startTime;
            const endTime = record.endTime;
            const flowRate = record.flowRate;

            // Calculate total amount for streams
            let totalAmount = 0;
            let flowRateFormatted = null;

            if (isStream) {
                const flowRateWei = BigInt(flowRate?.toString() || '0');
                const divisor = BigInt(Math.pow(10, getTokenConfig(activeChain.chainId).superToken.decimals));
                flowRateFormatted = Number(flowRateWei) / Number(divisor);

                if (record.streamStatus === 'completed' && startTime && endTime) {
                    const start = new Date(startTime);
                    const end = new Date(endTime);
                    const durationMs = end.getTime() - start.getTime();
                    const durationHours = durationMs / (1000 * 60 * 60);
                    totalAmount = (flowRateFormatted * durationHours) / 3600; // Convert flow rate to total
                } else if (record.streamStatus === 'active') {
                    // For active streams, calculate total based on time elapsed
                    const start = new Date(startTime);
                    const now = new Date();
                    const durationMs = now.getTime() - start.getTime();
                    const durationHours = durationMs / (1000 * 60 * 60);
                    totalAmount = (flowRateFormatted * durationHours) / 3600; // Convert flow rate to total
                } else {
                    // For other stream statuses, show flow rate as amount
                    totalAmount = flowRateFormatted;
                }
            } else {
                // For instant payments
                const amountWei = BigInt(record.amount?.toString() || '0');
                const divisor = BigInt(Math.pow(10, getTokenConfig(activeChain.chainId).superToken.decimals));
                totalAmount = Number(amountWei) / Number(divisor);
            }

            // Calculate duration for streams
            let duration = null;
            if (isStream && startTime) {
                const start = new Date(startTime);
                const end = endTime ? new Date(endTime) : new Date();
                const durationMs = end.getTime() - start.getTime();
                const durationHours = Math.round(durationMs / (1000 * 60 * 60));
                const durationDays = Math.floor(durationHours / 24);

                if (durationDays > 0) {
                    duration = `${durationDays}d ${durationHours % 24}h`;
                } else {
                    duration = `${durationHours}h`;
                }
            }

            return {
                id: record._id || `tx-${index}`,
                type: record.paymentType || 'unknown',
                recipient: record.receiverName || record.receiverWalletAddress || 'Unknown',
                sender: record.senderName || record.senderWalletAddress || 'Unknown',
                recipientAddress: record.receiverWalletAddress,
                senderAddress: record.senderWalletAddress,
                amount: totalAmount,
                flowRate: flowRateFormatted,
                status: record.paymentType === 'instant' ? 'completed' : (record.streamStatus || 'active'),
                startTime: startTime ? formatDateTime(startTime).date : 'Unknown',
                endTime: endTime ? formatDateTime(endTime).date : null,
                duration,
                time: startTime ? formatDateTime(startTime).date : 'Unknown',
                isStream,
                // Additional fields for comprehensive display
                payrollName: record.payrollName || 'Unnamed Payroll',
                txHash: record.txHash || record.streamStartTxHash || record.streamStoppedTxHash,
                invoice: record.invoice,
                currency: record.currency || 'USDC',
                chainId: record.chainId,
                invoiceId: record.invoiceId,
                // Stream-specific fields
                streamStartTxHash: record.streamStartTxHash,
                streamEndTxHash: record.streamStoppedTxHash,
                flowRateUnit: record.flowRateUnit || 'hour',
                // Instant-specific fields
                instantTxHash: record.txHash
            };
        });

    // Real-time system metrics calculated from combined payroll data
    const systemMetrics = {
        totalStreams: totalPayments, // Total payments (streams + instant)
        activeStreams,
        totalDistributed,
        monthlyGrowth,
        networkUptime,
        averageGasPrice,
        totalRecipients,
        successRate,
        scrollTransactions,
        usdcVolume,
    };

    const formatCurrency = (amount: number) => {
        const tokenConfig = getTokenConfig(activeChain.chainId);
        const currencySymbol = tokenConfig.superToken.symbol === 'USDCx' ? 'USDCx' : tokenConfig.superToken.symbol;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
        }).format(amount).replace('$', currencySymbol);
    };

    const formatCurrencyStyled = (amount: number, size: 'large' | 'medium' | 'small' = 'large') => {
        const tokenConfig = getTokenConfig(activeChain.chainId);
        const currencySymbol = tokenConfig.superToken.symbol === 'USDCx' ? 'USDCx' : tokenConfig.superToken.symbol;

        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
        }).format(amount).replace('$', '');

        const sizeClasses = {
            large: 'text-4xl font-black tracking-tight',
            medium: 'text-xl font-semibold',
            small: 'text-sm font-medium'
        };

        return (
            <span className="flex items-end">
                <span className={sizeClasses[size]}>{formattedAmount}</span>
                <span className="text-lg font-medium text-gray-600 ml-2">{currencySymbol}</span>
            </span>
        );
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    // Helper function to get time slot for a given date and time range
    const getTimeSlot = (date: Date, range: string): string => {
        const now = new Date();

        if (range === '1d') {
            const hour = date.getHours();
            if (hour < 4) return '00:00';
            else if (hour < 8) return '04:00';
            else if (hour < 12) return '08:00';
            else if (hour < 16) return '12:00';
            else if (hour < 20) return '16:00';
            else return '20:00';
        } else if (range === '3d') {
            const dayDiff = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
            return `Day ${Math.min(dayDiff + 1, 3)}`;
        } else if (range === '7d') {
            const dayOfWeek = date.getDay();
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[dayOfWeek];
        } else if (range === '1m') {
            const weekDiff = Math.floor((now.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
            return `Week ${Math.min(weekDiff + 1, 4)}`;
        }
        return '';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        return type === 'stream' ? <Waves className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" /> : <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 relative">
            {/* Fixed Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Large bubble top-left */}
                <div className="absolute -top-10 -left-10 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>

                {/* Medium bubble top-right */}
                <div className="absolute -top-10 -right-10 w-60 h-60 bg-gradient-to-br from-purple-400/20 via-pink-500/20 to-rose-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Small bubble center */}
                <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-gradient-to-br from-indigo-400/20 via-blue-500/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>

                {/* Large bubble bottom-right */}
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-green-400/20 via-emerald-500/20 to-teal-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Medium bubble bottom-left */}
                <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>

                {/* Floating small bubbles */}
                <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-gradient-to-br from-pink-400/15 via-rose-500/15 to-purple-600/15 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-gradient-to-br from-yellow-400/15 via-orange-500/15 to-red-600/15 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 min-h-screen">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-20 sm:pt-6 pb-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-8">
                        <div>
                            <div className="inline-flex items-center gap-1.5 sm:gap-3 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl px-2 sm:px-4 py-1 sm:py-2 shadow-lg">
                                <div className="w-4 h-4 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
                                        Dashboard
                                    </h1>
                                    <p className="text-xs sm:text-sm text-gray-600 font-normal sm:font-medium flex items-center gap-1 sm:gap-2">
                                        Real-time overview of your combined payroll ecosystem as {isSenderMode ? 'Sender' : 'Receiver'}
                                        {(isLoading || isLoadingInstants) && (
                                            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-600" />
                                        )}
                                        {(error || instantError) && (
                                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
                        {/* Total Value Distributed */}
                        <Card className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 cursor-pointer group transform hover:scale-105 hover:bg-white/80">
                            <CardContent className="p-3 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors duration-300">Total Value {isSenderMode ? 'Distributed' : 'Received'}</p>
                                        <div className="py-2 sm:py-3">
                                            <div className="text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                                                {formatCurrencyStyled(systemMetrics.totalDistributed, 'large')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 sm:mt-2">
                                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                            <span className="text-xs sm:text-sm text-green-600 font-medium">+{systemMetrics.monthlyGrowth.toFixed(1)}%</span>
                                            <span className="text-xs sm:text-sm text-gray-500">this month</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Streams/Payments */}
                        <Card className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 cursor-pointer group transform hover:scale-105 hover:bg-white/80">
                            <CardContent className="p-3 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-600 group-hover:text-green-600 transition-colors duration-300">
                                            Active
                                        </p>
                                        <div className="py-2 sm:py-3">
                                            <div className="text-3xl sm:text-4xl font-black tracking-tight group-hover:text-blue-700 transition-colors duration-300">
                                                {systemMetrics.activeStreams}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 sm:mt-2">
                                            <span className="text-xs sm:text-sm text-gray-600">
                                                of {systemMetrics.totalStreams} total
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <SendIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Success Rate */}
                        <Card className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 cursor-pointer group transform hover:scale-105 hover:bg-white/80">
                            <CardContent className="p-3 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-600 group-hover:text-orange-600 transition-colors duration-300">Success Rate</p>
                                        <div className="py-2 sm:py-3">
                                            <div className="text-3xl sm:text-4xl font-black tracking-tight group-hover:text-orange-700 transition-colors duration-300">
                                                {Math.round(systemMetrics.successRate)}%
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 sm:mt-2">
                                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                            <span className="text-xs sm:text-sm text-green-600 font-medium">
                                                {completedCount} of {systemMetrics.totalStreams} successful
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-6">
                        <div className="flex justify-center">
                            <TabsList className="inline-flex h-8 sm:h-14 items-center justify-center rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl p-1 sm:p-2 gap-1 sm:gap-2">
                                <TabsTrigger
                                    value="overview"
                                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 sm:px-6 py-1 sm:py-3 text-xs sm:text-sm font-semibold ring-offset-background transition-all duration-500 ease-out transform hover:scale-105 ${activeTab === 'overview'
                                        ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl transform scale-105 border-0'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/80 hover:shadow-lg border border-transparent hover:border-white/40'
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5 sm:gap-3">
                                        <div className={`hidden sm:block p-1.5 sm:p-2 rounded-lg transition-all duration-500 ${activeTab === 'overview'
                                            ? 'bg-white/10 backdrop-blur'
                                            : 'bg-blue-50 group-hover:bg-blue-100'
                                            }`}>
                                            <BarChart3 className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-500 ${activeTab === 'overview' ? 'text-white' : 'text-blue-600'
                                                }`} />
                                        </div>
                                        <span className={`font-semibold transition-all duration-500 ${activeTab === 'overview' ? 'text-white' : 'text-gray-600'}`}>Overview</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="transactions"
                                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 sm:px-6 py-1 sm:py-3 text-xs sm:text-sm font-semibold ring-offset-background transition-all duration-500 ease-out transform hover:scale-105 ${activeTab === 'transactions'
                                        ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl transform scale-105 border-0'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/80 hover:shadow-lg border border-transparent hover:border-white/40'
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5 sm:gap-3">
                                        <div className={`hidden sm:block p-1.5 sm:p-2 rounded-lg transition-all duration-500 ${activeTab === 'transactions'
                                            ? 'bg-white/10 backdrop-blur'
                                            : 'bg-green-50 group-hover:bg-green-100'
                                            }`}>
                                            <Activity className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-500 ${activeTab === 'transactions' ? 'text-white' : 'text-green-600'
                                                }`} />
                                        </div>
                                        <span className={`font-semibold transition-all duration-500 ${activeTab === 'transactions' ? 'text-white' : 'text-gray-600'}`}>Recent Transactions</span>
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-3 sm:space-y-6">


                            {/* Main Charts - Daily Activity & Distribution */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                                {/* Daily Activity Chart */}
                                <Card className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 transform hover:scale-[1.02] hover:bg-white/80">
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-1.5 sm:gap-3">
                                                <div className="p-3 sm:p-4 rounded-2xl shadow-xl bg-gradient-to-r from-blue-500 to-purple-600">
                                                    <LineChart className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
                                                        Payment Activity
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-gray-600 font-normal">
                                                        Total sent amounts over time
                                                    </div>
                                                </div>
                                            </CardTitle>
                                            <div className="flex items-center gap-1">
                                                {['1d', '3d', '7d', '1m'].map((range) => (
                                                    <button
                                                        key={range}
                                                        onClick={() => setTimeRange(range)}
                                                        className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${timeRange === range
                                                            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg'
                                                            : 'bg-white/60 text-gray-600 hover:bg-white/80 hover:shadow-md border border-white/40'
                                                            }`}
                                                    >
                                                        {range === '1d' ? '1D' : range === '3d' ? '3D' : range === '7d' ? '7D' : '1M'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-center">
                                        {enhancedDailyActivityData.length > 0 ? (
                                            <div className="w-full h-[250px] sm:h-[300px] flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RechartsLineChart data={enhancedDailyActivityData}>
                                                        <defs>
                                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                                            </linearGradient>
                                                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                                                <stop offset="0%" stopColor="#3B82F6" />
                                                                <stop offset="50%" stopColor="#8B5CF6" />
                                                                <stop offset="100%" stopColor="#6366F1" />
                                                            </linearGradient>
                                                            <filter id="lineShadow" x="-50%" y="-50%" width="200%" height="200%">
                                                                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#3B82F6" floodOpacity="0.3" />
                                                                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#8B5CF6" floodOpacity="0.2" />
                                                            </filter>
                                                            <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                                                                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1E40AF" floodOpacity="0.4" />
                                                            </filter>
                                                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                                                                <stop offset="30%" stopColor="#3B82F6" stopOpacity={0.6} />
                                                                <stop offset="60%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                                <stop offset="85%" stopColor="#3B82F6" stopOpacity={0.1} />
                                                                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                                                        <Tooltip
                                                            content={({ active, payload, label }) => {
                                                                if (active && payload && payload.length) {
                                                                    const amount = payload[0].value as number;
                                                                    const tokenConfig = getTokenConfig(activeChain.chainId);

                                                                    return (
                                                                        <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/60 z-50">
                                                                            <p className="font-bold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2">{label}</p>
                                                                            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                                                {formatNumber(amount)} {tokenConfig.superToken.symbol}
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                            cursor={{
                                                                stroke: '#3B82F6',
                                                                strokeWidth: 2,
                                                                strokeDasharray: '5 5'
                                                            }}
                                                            wrapperStyle={{ zIndex: 1000 }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="amount"
                                                            stroke="#3B82F6"
                                                            strokeWidth={4}
                                                            style={{ filter: 'url(#lineShadow)' }}
                                                            dot={{
                                                                fill: '#3B82F6',
                                                                stroke: '#ffffff',
                                                                strokeWidth: 3,
                                                                r: 6,
                                                                style: { filter: 'url(#dotShadow)' }
                                                            }}
                                                            activeDot={{
                                                                r: 10,
                                                                stroke: '#ffffff',
                                                                strokeWidth: 4,
                                                                fill: '#3B82F6',
                                                                style: { filter: 'url(#dotShadow)' }
                                                            }}
                                                        />
                                                        {/* Primary gradient fill with transparency - creates shadow effect */}
                                                        <Area
                                                            type="monotone"
                                                            dataKey="amount"
                                                            stroke="transparent"
                                                            fill="url(#areaGradient)"
                                                            fillOpacity={1}
                                                        />
                                                        {/* Secondary subtle fill for enhanced depth */}
                                                        <Area
                                                            type="monotone"
                                                            dataKey="amount"
                                                            stroke="transparent"
                                                            fill="url(#colorAmount)"
                                                            fillOpacity={0.1}
                                                        />
                                                    </RechartsLineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-[250px] sm:h-[300px]">
                                                <div className="text-center">
                                                    <LineChart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-1 sm:mb-2" />
                                                    <p className="text-xs sm:text-sm text-gray-500">No activity data available</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Distribution Types */}
                                <Card className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 transform hover:scale-[1.02] hover:bg-white/80">
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-1.5 sm:gap-3">
                                                <div className="p-3 sm:p-4 rounded-2xl shadow-xl bg-gradient-to-r from-green-500 to-emerald-600">
                                                    <PieChart className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 via-green-900 to-slate-800 bg-clip-text text-transparent">
                                                        Payment Types
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-gray-600 font-normal">
                                                        Stream vs Instant payments
                                                    </div>
                                                </div>
                                            </CardTitle>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="outline" className="text-xs bg-green-50/80 backdrop-blur-sm text-green-700 border-green-200/60 font-semibold">
                                                    {distributionData.reduce((sum, item) => sum + item.value, 0)} total
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center h-[250px] sm:h-[300px]">
                                        <div className="w-full h-[150px] sm:h-[200px] flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsPieChart>
                                                    <defs>
                                                        <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                                                            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.1" />
                                                        </filter>
                                                        <linearGradient id="streamGradient" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                                                            <stop offset="100%" stopColor="#1E40AF" stopOpacity={1} />
                                                        </linearGradient>
                                                        <linearGradient id="instantGradient" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                                                            <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                                                        </linearGradient>
                                                    </defs>
                                                    <Pie
                                                        data={distributionData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={70}
                                                        paddingAngle={8}
                                                        dataKey="value"
                                                        style={{ filter: 'url(#pieShadow)' }}
                                                    >
                                                        {distributionData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.name === 'Stream' ? 'url(#streamGradient)' : 'url(#instantGradient)'}
                                                                stroke="#ffffff"
                                                                strokeWidth={3}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                const data = payload[0].payload;
                                                                const total = distributionData.reduce((sum, item) => sum + item.value, 0);
                                                                const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

                                                                return (
                                                                    <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/60">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <div
                                                                                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                                                                                style={{ backgroundColor: data.color }}
                                                                            ></div>
                                                                            <p className="font-semibold text-gray-900">{data.name}</p>
                                                                        </div>
                                                                        <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                                                            {data.value}
                                                                        </p>
                                                                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                                                            {percentage}% of total payments
                                                                        </p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                        cursor={{
                                                            fill: 'rgba(255, 255, 255, 0.1)',
                                                            stroke: '#ffffff',
                                                            strokeWidth: 2
                                                        }}
                                                    />
                                                </RechartsPieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-2 sm:mt-4">
                                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                                {distributionData.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-1.5 sm:gap-2">
                                                        <div
                                                            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                                                            style={{ backgroundColor: item.color }}
                                                        />
                                                        <span className="text-xs sm:text-sm text-gray-600">{item.name}</span>
                                                        <span className="text-xs sm:text-sm font-medium">{Math.round(item.value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Top Recipients & Key Insights */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                                {/* Top Recipients */}
                                <Card className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] hover:bg-white/80">
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-1.5 sm:gap-3">
                                                <div className="p-2 sm:p-3 rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-pink-600">
                                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-base sm:text-lg font-bold text-gray-900">
                                                        {isSenderMode ? 'Top Recipients' : 'Top Senders'}
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-gray-600 font-normal">
                                                        {isSenderMode ? 'Most active payment recipients' : 'Most active payment senders'}
                                                    </div>
                                                </div>
                                            </CardTitle>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                                    {finalRecords.length > 0 ? Object.keys(finalRecords.reduce((acc: any, record: any) => {
                                                        const person = isSenderMode
                                                            ? (record.receiverName || record.receiverWalletAddress || 'Unknown')
                                                            : (record.senderName || record.senderWalletAddress || 'Unknown');
                                                        acc[person] = true;
                                                        return acc;
                                                    }, {})).length : 0} total
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="max-h-60 sm:max-h-80 overflow-y-auto space-y-2 sm:space-y-3 pr-1 sm:pr-2">
                                            {(() => {
                                                const recipientStats = finalRecords.reduce((acc: any, record: any) => {
                                                    // In sender mode, show top recipients. In receiver mode, show top senders
                                                    const person = isSenderMode
                                                        ? (record.receiverName || record.receiverWalletAddress || 'Unknown')
                                                        : (record.senderName || record.senderWalletAddress || 'Unknown');

                                                    // Calculate total amount based on payment type
                                                    let amount = 0;
                                                    if (record.paymentType === 'instant') {
                                                        // For instant payments, convert from token decimals
                                                        const amountWei = BigInt(record.amount?.toString() || '0');
                                                        const divisor = BigInt(Math.pow(10, getTokenConfig(activeChain.chainId).superToken.decimals));
                                                        amount = Number(amountWei) / Number(divisor);
                                                    } else {
                                                        // For streams, calculate total sent amount
                                                        if (record.streamStatus === 'completed' && record.streamEndTime) {
                                                            // For completed streams, calculate from start to end date
                                                            amount = calculateStreamAmountSimple(
                                                                record.flowRate,
                                                                new Date(record.streamStartTime),
                                                                new Date(record.streamEndTime),
                                                                activeChain.chainId
                                                            );
                                                        } else if (record.streamStatus === 'active') {
                                                            // For active streams, calculate from start to now
                                                            amount = calculateStreamAmountSimple(
                                                                record.flowRate,
                                                                new Date(record.streamStartTime),
                                                                new Date(), // Current time
                                                                activeChain.chainId
                                                            );
                                                        }
                                                    }

                                                    if (!acc[person]) {
                                                        acc[person] = {
                                                            name: person,
                                                            total: 0,
                                                            count: 0,
                                                            lastPayment: null,
                                                            paymentTypes: new Set()
                                                        };
                                                    }
                                                    acc[person].total += amount;
                                                    acc[person].count += 1;
                                                    acc[person].paymentTypes.add(record.paymentType || 'unknown');

                                                    const paymentDate = new Date(record.createdAt || record.startTime);
                                                    if (!acc[person].lastPayment || paymentDate > acc[person].lastPayment) {
                                                        acc[person].lastPayment = paymentDate;
                                                    }
                                                    return acc;
                                                }, {});

                                                const topRecipients = Object.values(recipientStats)
                                                    .sort((a: any, b: any) => b.total - a.total)
                                                    .slice(0, 8);

                                                if (topRecipients.length === 0) {
                                                    return (
                                                        <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-3 sm:px-4">
                                                            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                                                                <Users className="w-7 sm:w-8 h-7 sm:h-8 text-purple-600" />
                                                            </div>
                                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                                                                {isSenderMode ? 'No Recipients Yet' : 'No Senders Yet'}
                                                            </h3>
                                                            <p className="text-xs sm:text-sm text-gray-600 text-center max-w-sm">
                                                                {isSenderMode
                                                                    ? 'Start making payments to see your top recipients here.'
                                                                    : 'Start receiving payments to see your top senders here.'
                                                                }
                                                            </p>
                                                        </div>
                                                    );
                                                }

                                                return topRecipients.map((recipient: any, index: number) => {
                                                    const isTop3 = index < 3;
                                                    const percentageOfTotal = totalAmount > 0 ? (recipient.total / totalAmount) * 100 : 0;
                                                    const avgAmount = recipient.total / recipient.count;
                                                    const daysSinceLastPayment = recipient.lastPayment ?
                                                        Math.floor((new Date().getTime() - recipient.lastPayment.getTime()) / (1000 * 60 * 60 * 24)) : null;

                                                    return (
                                                        <div key={index} className={`relative flex items-center justify-between p-3 sm:p-4 rounded-2xl border ${isTop3
                                                            ? 'bg-gradient-to-r from-purple-50/40 to-pink-50/40 border-purple-200/30'
                                                            : 'bg-white/60 border-white/40'
                                                            }`}>

                                                            <div className="flex items-center gap-3 relative z-10">
                                                                {/* Rank badge */}
                                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                                                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                                                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-yellow-600' :
                                                                            'bg-gradient-to-br from-purple-500/30 to-pink-500/30'
                                                                    }`}>
                                                                    {index < 3 ? (
                                                                        <span className="text-white font-bold text-xs sm:text-sm">
                                                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-purple-600 font-bold text-xs sm:text-sm">{index + 1}</span>
                                                                    )}
                                                                </div>

                                                                {/* Recipient info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                                                        <h4 className="font-semibold text-gray-900 truncate">
                                                                            {recipient.name}
                                                                        </h4>
                                                                        {isTop3 && (
                                                                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                                                                Top {index + 1}
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                                        <span className="flex items-center gap-1">
                                                                            <CreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                                            {recipient.count} payments
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Waves className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                                            {Array.from(recipient.paymentTypes).join(', ')}
                                                                        </span>
                                                                        {daysSinceLastPayment !== null && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                                                {daysSinceLastPayment === 0 ? 'Today' :
                                                                                    daysSinceLastPayment === 1 ? 'Yesterday' :
                                                                                        `${daysSinceLastPayment}d ago`}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Progress bar showing percentage of total */}
                                                                    <div className="mt-1 sm:mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                                                            style={{ width: `${Math.min(percentageOfTotal, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Amount info */}
                                                            <div className="text-right relative z-10">
                                                                <div className="flex flex-col items-end">
                                                                    <div className="text-gray-900">
                                                                        {formatCurrencyStyled(recipient.total, 'medium')}
                                                                    </div>
                                                                    <div className="text-xs sm:text-sm text-purple-600 font-medium mt-0.5 sm:mt-1">
                                                                        {percentageOfTotal.toFixed(1)}% of total
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Key Insights */}
                                <Card className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] hover:bg-white/80">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-1.5 sm:gap-3">
                                            <div className="p-2 sm:p-3 rounded-lg shadow-lg bg-gradient-to-r from-orange-500 to-yellow-600">
                                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            Key Insights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-center">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 w-full max-w-4xl">
                                            {(() => {
                                                const totalTransactions = finalRecords.length;

                                                // Use the same totalAmount calculation that's already computed above
                                                // This ensures consistency with the "Total Value Distributed" metric
                                                const avgTransactionAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

                                                return [
                                                    {
                                                        title: 'Avg Transaction',
                                                        value: formatCurrencyStyled(avgTransactionAmount, 'medium'),
                                                        icon: <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />,
                                                        color: 'text-green-600',
                                                        bgColor: 'bg-green-50'
                                                    },
                                                    {
                                                        title: isSenderMode ? 'Total Receivers' : 'Total Senders',
                                                        value: systemMetrics.totalRecipients.toString(),
                                                        icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
                                                        color: 'text-purple-600',
                                                        bgColor: 'bg-purple-50'
                                                    },
                                                    {
                                                        title: 'Scroll Transactions',
                                                        value: formatNumber(systemMetrics.scrollTransactions),
                                                        icon: <Network className="w-4 h-4 sm:w-5 sm:h-5" />,
                                                        color: 'text-indigo-600',
                                                        bgColor: 'bg-indigo-50'
                                                    },
                                                    {
                                                        title: 'USDC Volume',
                                                        value: formatCurrencyStyled(systemMetrics.usdcVolume, 'medium'),
                                                        icon: <Coins className="w-4 h-4 sm:w-5 sm:h-5" />,
                                                        color: 'text-emerald-600',
                                                        bgColor: 'bg-emerald-50'
                                                    }
                                                ].map((insight, index) => (
                                                    <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/60 rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-300 cursor-pointer group">
                                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${insight.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                                            <div className={insight.color}>
                                                                {insight.icon}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{insight.title}</p>
                                                            <p className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{insight.value}</p>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>


                        </TabsContent>



                        {/* Transactions Tab */}
                        <TabsContent value="transactions" className="space-y-3 sm:space-y-6">
                            <Card className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl rounded-3xl transition-all duration-500 hover:bg-white/80">
                                <CardHeader className="pb-4 sm:pb-6">
                                    <div className="flex items-center justify-between sm:flex-row flex-col gap-2 sm:gap-0">
                                        <CardTitle className="flex items-center gap-1.5 sm:gap-3 text-lg sm:text-xl">
                                            <div className="p-2 rounded-2xl shadow-xl">
                                                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                                            </div>
                                            <div>
                                                <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
                                                    Recent Transactions
                                                </div>
                                            </div>
                                        </CardTitle>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="outline" className="sm:text-xs text-[10px] bg-white/60 backdrop-blur-sm border-white/40 font-semibold">
                                                {recentTransactions.length} recent transactions
                                            </Badge>
                                            <Badge variant="secondary" className="sm:text-xs text-[10px] bg-blue-50/60 backdrop-blur-sm text-blue-700 border-blue-200/40 font-semibold">
                                                Mixed streams & instant
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {recentTransactions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-8">
                                            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                                                <Activity className="w-7 sm:w-8 h-7 sm:h-8 text-blue-600" />
                                            </div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No Recent Transactions</h3>
                                            <p className="text-xs sm:text-sm text-gray-600 text-center max-w-md">
                                                You haven't made any payments yet. Start by creating your first payroll.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 sm:space-y-4">
                                            {recentTransactions.map((tx, index) => (
                                                <div
                                                    key={tx.id}
                                                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/40 hover:border-blue-200/60 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:bg-white/80"
                                                >
                                                    {/* Left Section - Icon and Main Info */}
                                                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
                                                        {/* Transaction Type Icon */}
                                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 flex-shrink-0 ${tx.isStream
                                                            ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600'
                                                            : 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600'
                                                            }`}>
                                                            <div className="text-white">
                                                                {tx.isStream ? <Waves className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                                                            </div>
                                                        </div>

                                                        {/* Main Transaction Info */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* Payroll Name and Recipient */}
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-3 mb-1 sm:mb-2">
                                                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 text-sm sm:text-base lg:text-lg truncate">
                                                                    {tx.payrollName}
                                                                </h4>
                                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium w-fit px-2 py-0.5">
                                                                    {tx.recipient}
                                                                </Badge>
                                                            </div>

                                                            {/* Payment Type and Time */}
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-3 mb-1 sm:mb-2">
                                                                <span className="text-xs sm:text-sm text-gray-600 capitalize font-normal">
                                                                    {tx.isStream ? 'Streaming' : 'Instant'} payment
                                                                </span>
                                                                <span className="hidden sm:inline text-xs sm:text-sm text-gray-400">•</span>
                                                                <span className="text-xs sm:text-sm text-gray-500 font-normal">
                                                                    {tx.startTime}
                                                                </span>
                                                            </div>

                                                            {/* Stream-specific Details */}
                                                            {tx.isStream && (
                                                                <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                                                                    {/* Flow Rate Row */}
                                                                    {tx.flowRate && (
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 lg:gap-2">
                                                                            <span className="text-xs sm:text-sm text-blue-600 font-medium">
                                                                                Flow Rate:
                                                                            </span>
                                                                            <span className="text-xs sm:text-sm text-gray-700 font-normal">
                                                                                {formatCurrencyStyled(tx.flowRate, 'small')}
                                                                            </span>
                                                                            <span className="text-xs sm:text-sm text-gray-500 font-normal">
                                                                                per {tx.flowRateUnit}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {/* Duration and Status Row */}
                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-3">
                                                                        {tx.duration && (
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                                                                                    Duration:
                                                                                </span>
                                                                                <span className="text-xs sm:text-sm text-gray-700 font-normal">
                                                                                    {tx.duration}
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {tx.status === 'active' && (
                                                                            <>
                                                                                {tx.duration && <span className="hidden sm:inline text-xs sm:text-sm text-gray-400">•</span>}
                                                                                <div className="flex items-center gap-1">
                                                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                                    <span className="text-xs sm:text-sm text-green-600 font-medium">
                                                                                        Active
                                                                                    </span>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Instant-specific Details */}
                                                            {!tx.isStream && tx.instantTxHash && (
                                                                <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                                                                    {/* Transaction Hash Row */}
                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 lg:gap-2">
                                                                        <span className="text-xs sm:text-sm text-green-600 font-medium">
                                                                            Transaction:
                                                                        </span>
                                                                        <span className="text-xs sm:text-sm text-gray-700 font-mono font-normal">
                                                                            {tx.instantTxHash.slice(0, 8)}...
                                                                        </span>
                                                                    </div>

                                                                    {/* Invoice Status Row */}
                                                                    {tx.invoice?.invoiceStatus && (
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 lg:gap-2">
                                                                            <span className="text-xs sm:text-sm text-purple-600 font-medium">
                                                                                Invoice:
                                                                            </span>
                                                                            <span className="text-xs sm:text-sm text-gray-700 font-normal capitalize">
                                                                                {tx.invoice.invoiceStatus}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Right Section - Amount and Status */}
                                                    <div className="flex flex-col items-start sm:items-end gap-2 sm:gap-3 mt-3 sm:mt-0 sm:ml-4 lg:ml-6 w-full sm:w-auto">
                                                        {/* Amount */}
                                                        <div className="text-left sm:text-right w-full sm:w-auto">
                                                            <div className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                                                                {formatCurrencyStyled(tx.amount, 'medium')}
                                                            </div>
                                                            {tx.isStream && tx.flowRate && tx.status === 'active' && (
                                                                <div className="text-xs sm:text-sm text-blue-600 font-normal mt-0.5 sm:mt-1">
                                                                    {formatCurrencyStyled(tx.flowRate, 'small')} per {tx.flowRateUnit}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Status Badges */}
                                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                                                            <Badge
                                                                className={`${getStatusColor(tx.status)} group-hover:scale-105 transition-transform duration-300 font-normal px-2 py-0.5 text-xs`}
                                                            >
                                                                {tx.status}
                                                            </Badge>
                                                            {tx.invoice?.documentUrl && (
                                                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 font-normal px-2 py-0.5">
                                                                    Invoice
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {/* Additional Info for Completed Streams */}
                                                        {tx.isStream && tx.status === 'completed' && tx.endTime && (
                                                            <div className="text-xs sm:text-sm text-gray-500 text-left sm:text-right font-normal w-full sm:w-auto">
                                                                Ended: {tx.endTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
} 