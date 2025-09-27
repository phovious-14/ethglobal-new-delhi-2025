'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, StopCircle } from 'lucide-react';
import FlowingBalance from './FlowingBalance/FlowingBalance';
import { useStream } from '@/src/hooks/use-stream';
import { useToast } from '@/src/hooks/use-toast';
import { pdf, Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { env } from '../env.mjs';
import { getDefaultTokenPair, isTestnetChain } from '../utils/tokenRegistry';
import { getCurrencyLogo } from '../utils/getCurrencyLogo';
import { calculateStreamAmountSimple } from '../utils/calculateStreamAmount';
import { usePrivy } from '@privy-io/react-auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateStreamQueries } from '@/src/utils/queryInvalidation';
import { useChain } from '@/src/app/context/ChainContext';

interface StreamVisualizerProps {
    id: string;
    accessToken: string;
    payrollName: string;
    sender: { address: string; name?: string };
    receiver: { address: string; name?: string };
    amount: string;
    startDate: Date;
    isCompleted?: boolean;
    onTogglePause?: () => void;
    onClose?: () => void;
    isActive?: boolean;
    immediate?: boolean;
    flowRateUnit?: 'hour' | 'day' | 'week' | 'month';
    endDate?: Date;
}

export const StreamVisualizer: React.FC<StreamVisualizerProps> = ({
    id,
    accessToken,
    payrollName,
    sender,
    receiver,
    amount,
    startDate,
    isCompleted = false,
    onTogglePause,
    onClose,
    isActive = true,
    immediate = false,
    flowRateUnit = 'month',
    endDate,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [particles, setParticles] = useState<Array<{ id: number; progress: number }>>([]);
    const animationRef = useRef<number>();
    const [visible, setVisible] = useState(true);
    const [localEndDate, setLocalEndDate] = useState<Date | undefined>(endDate);
    const [localIsCompleted, setLocalIsCompleted] = useState(isCompleted);
    const { activeChain } = useChain();

    const { user } = usePrivy();
    const { stopSuperfluidStreamAsync, isStopSuperfluidTransferPending, stopStreamAsync, isStopStreamPending } = useStream();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Generate random invoice number using the same pattern as create-payroll page
    const generateInvoiceNumber = useCallback(() => {
        const invoiceNumber = `INV-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        return invoiceNumber;
    }, []);

    const invoiceNumber = useMemo(() => {
        return generateInvoiceNumber();
    }, [generateInvoiceNumber]);

    // Update local state when props change
    useEffect(() => {
        setLocalEndDate(endDate);
        setLocalIsCompleted(isCompleted);
    }, [endDate, isCompleted]);


    // PDF generation helpers
    const generatePayrollPDFBlob = async (payrollData: any) => {
        const { professionalPdfStyles } = await import('@/src/utils/pdfStyles');

        const PayrollInvoicePDF = ({ payrollData }: { payrollData: any }) => {
            const invoiceNumber = payrollData.invoiceNumber || generateInvoiceNumber();
            const currentDate = new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            const endDate = payrollData.endDateTime ? new Date(payrollData.endDateTime).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }) : 'N/A';

            // Use centralized professional styles
            const styles = professionalPdfStyles;

            return (
                <Document>
                    <Page size="A4" style={styles.page}>
                        {/* Watermark */}
                        <Text style={styles.watermark}>PAYPULSE</Text>

                        {/* Enhanced Header */}
                        <View style={styles.header}>
                            <View>
                                <Image src="/img/paypulse.png" style={styles.logo} />
                            </View>
                            <View style={styles.invoiceInfo}>
                                <Text style={styles.invoiceTitle}>Payroll Invoice</Text>
                                <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>
                                <Text style={styles.invoiceDate}>
                                    Generated: {currentDate}
                                </Text>
                            </View>
                        </View>

                        {/* Decorative Line */}
                        <View style={styles.decorativeLine} />

                        {/* Recipient Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recipient Information</Text>
                            <View style={styles.recipientInfo}>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Recipient Name:</Text>
                                    <Text style={styles.value}>{payrollData.receiverName || 'N/A'}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Wallet Address:</Text>
                                    <Text style={[styles.value, styles.walletAddress]}>{payrollData.walletAddress || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Payment Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Payment Details</Text>
                            <View style={styles.paymentDetails}>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Payroll Name:</Text>
                                    <Text style={styles.value}>{payrollData.payrollName || 'N/A'}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Sender Wallet:</Text>
                                    <Text style={[styles.value, styles.walletAddress]}>{payrollData.sendWalletAddress || 'N/A'}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Payment Type:</Text>
                                    <View style={styles.distributionType}>
                                        <Text>{payrollData.isInstantDistribution ? 'Instant Payment' : 'Streaming Payment'}</Text>
                                    </View>
                                </View>
                                {payrollData.endDateTime && (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>End Date:</Text>
                                        <Text style={styles.value}>{endDate}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Decorative Line */}
                        <View style={styles.decorativeLine} />

                        {/* Total Section */}
                        <View style={styles.totalSection}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalAmount}>
                                    ${payrollData.displayCalculation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 12 })} {tokenConfig.superToken.symbol}
                                </Text>
                            </View>
                        </View>
                    </Page>
                </Document>
            );
        };
        const pdfDoc = <PayrollInvoicePDF payrollData={payrollData} />;
        const blob = await pdf(pdfDoc).toBlob();
        return blob;
    };

    const uploadPDFToPinata = async (pdfBlob: Blob, fileName: string) => {
        const formData = new FormData();
        formData.append('file', pdfBlob, fileName);
        formData.append('network', 'public');

        const res = await fetch('https://uploads.pinata.cloud/v3/files', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.NEXT_PUBLIC_PINATA_JWT}`,
            },
            body: formData,
        });
        const resData = await res.json();

        if (!res.ok) {
            throw new Error("Failed to upload to IPFS");
        }

        return resData;
    };

    // Handle stopping the stream
    const handleStopStream = async () => {
        try {
            const res = await stopSuperfluidStreamAsync({
                recipientAddress: receiver.address,
                amount: amount,
                superTokenAddr: tokenConfig.superToken.address,
                decimals: tokenConfig.superToken.decimals
            });

            // For stopping a stream, use current time as the end date
            // This ensures the PDF reflects the actual stop time
            const stopTime = new Date();
            const endDateTime = stopTime.toISOString();

            // Auto-generate/upload PDF after stopping stream
            // Build payrollData from props
            const payrollData = {
                payrollName: payrollName,
                sendWalletAddress: sender.address,
                receiverName: receiver.name || 'Recipient',
                walletAddress: receiver.address,
                amount: amount,
                isInstantDistribution: false,
                endDateTime,
                invoiceNumber: invoiceNumber,
                // Calculate the amount using the same end date as display for consistency
                displayCalculation: calculateStreamAmountSimple(amount, startDate, stopTime, activeChain.chainId),
            };

            // Generate PDF with the stop time as end date
            const pdfBlob = await generatePayrollPDFBlob(payrollData);
            // previewPDFBlob(pdfBlob);

            // Upload to Pinata
            try {
                const fileName = `drippay-invoice-${invoiceNumber}-${payrollData.receiverName || 'recipient'}.pdf`;
                const pinataData = await uploadPDFToPinata(pdfBlob, fileName);

                await stopStreamAsync({
                    id: id,
                    accessToken: accessToken,
                    streamStoppedTxHash: res?.transactionHash || '',
                    documentUrl: `https://indigo-obedient-wombat-704.mypinata.cloud/ipfs/${pinataData?.data?.cid}?pinataGatewayToken=${env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN}`,
                    invoiceNumber: invoiceNumber,
                    streamEndTime: payrollData.endDateTime
                });

                // Invalidate queries immediately to refresh UI
                invalidateStreamQueries(queryClient);

                // Update local state immediately for instant UI feedback
                setLocalEndDate(stopTime);
                setLocalIsCompleted(true);

                // Simply invalidate queries and let React Query handle the refresh
                // The parent component will automatically re-render with fresh data

                toast({
                    title: "Stream Stopped",
                    description: `Successfully stopped stream to ${receiver.name || receiver.address.slice(0, 6)}...`,
                    variant: "default"
                });
            } catch (err) {
                console.error('Pinata upload failed:', err);
            }
        } catch (error) {
            console.error('Error stopping stream:', error);

            toast({
                title: "Failed to Stop Stream",
                description: error instanceof Error ? error.message : "An error occurred while stopping the stream",
                variant: "destructive"
            });
        }
    };

    // Calculate total sent for display
    // Priority: localEndDate (when stopping stream) > endDate (stored data) > current time
    // This ensures consistency between display and PDF calculations
    const displayCalculation = calculateStreamAmountSimple(amount, startDate, localEndDate || endDate, activeChain.chainId);
    const tokenConfig = getDefaultTokenPair(activeChain.chainId);

    // Calculate duration from start date to end date (or now if no end date)
    const calculateDuration = () => {
        const end = (localEndDate || endDate) ? new Date(localEndDate || endDate!) : new Date();
        const start = new Date(startDate);
        const diffInMs = end.getTime() - start.getTime();

        const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    // Create and animate particles
    useEffect(() => {
        let particleId = 0;
        const maxParticles = 8;
        const spawnRate = 1500; // ms between spawns (faster spawning)

        // Initial particles
        const initialParticles = Array.from({ length: maxParticles }, (_, i) => ({
            id: particleId++,
            progress: (i / maxParticles) * 100
        }));
        setParticles(initialParticles);

        // Spawn new particles
        const spawnInterval = setInterval(() => {
            setParticles(prev => [
                ...prev.filter(p => p.progress < 100),
                { id: particleId++, progress: 0 }
            ].slice(-maxParticles));
        }, spawnRate);

        // Animate particles
        const animate = () => {
            setParticles(prev =>
                prev.map(particle => ({
                    ...particle,
                    progress: particle.progress + 1.5 // lightning speed movement
                })).filter(p => p.progress <= 105)
            );
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            clearInterval(spawnInterval);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);



    // Only show if visible, isActive, and not completed
    if (!visible) return null;

    return (
        <div className="relative z-[51] w-full mt-12 min-h-[50vh] sm:min-h-screen flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-6">
            {/* Modern Animated Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Subtle gradient layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-teal-100/30"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-indigo-100/20 via-blue-100/20 to-cyan-100/20"></div>

                {/* Floating geometric shapes */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"
                        animate={{
                            y: [-10, 10, -10],
                            x: [-5, 5, -5],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute top-3/4 right-1/4 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-teal-400/10 to-blue-400/10 rounded-full blur-2xl"
                        animate={{
                            y: [10, -10, 10],
                            x: [5, -5, 5],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 w-12 h-12 sm:w-18 sm:h-18 md:w-24 md:h-24 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"
                        animate={{
                            y: [-8, 8, -8],
                            x: [-3, 3, -3],
                            scale: [1, 1.15, 1]
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 4
                        }}
                    />
                </div>

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full" style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                                        radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />
                </div>
            </div>

            {/* Modern Close Button */}
            <motion.button
                onClick={() => {
                    if (onClose) onClose();
                    else setVisible(false);
                }}
                className="fixed top-12 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-110 hover:shadow-xl"
                aria-label="Close overlay"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
            >
                <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600" />
            </motion.button>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-6xl mt-8 sm:mt-0 md:mt-0">
                {/* Modern Header with sender and receiver */}
                <div className="flex flex-row justify-between items-center mb-4 sm:mb-6 md:mb-8 lg:mb-12 w-full gap-2 sm:gap-4 md:gap-6 lg:gap-8 bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-2xl border border-gray-200">
                    <motion.div
                        className="flex flex-col items-center space-y-2 sm:space-y-4"
                        initial={{ opacity: 0, x: -60, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        {/* Modern Sender Avatar */}
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl blur-xl opacity-30"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.5, 0.3]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <motion.div
                                className="relative w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl border-2 sm:border-3 md:border-4 border-white text-sm sm:text-base md:text-xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                animate={{
                                    boxShadow: [
                                        "0 20px 40px rgba(59, 130, 246, 0.3)",
                                        "0 25px 50px rgba(139, 92, 246, 0.4)",
                                        "0 20px 40px rgba(59, 130, 246, 0.3)"
                                    ]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                {sender.name ? sender.name[0].toUpperCase() : '?'}
                            </motion.div>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-600 mb-1 sm:mb-2 tracking-wide uppercase">Sender</p>
                            <div className="bg-white/80 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-6 lg:py-3 rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl border border-gray-200 shadow-lg">
                                <p className="text-[10px] sm:text-xs md:text-sm lg:text-base font-mono text-gray-700 font-medium">
                                    {sender.address.slice(0, 6)}...{sender.address.slice(-4)}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Modern Center Connection Line */}
                    <div ref={containerRef} className="relative h-8 sm:h-12 md:h-20 lg:h-32 xl:h-40 mb-2 sm:mb-3 md:mb-4 lg:mb-6 w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto">
                        {/* Modern Flowing particles - only show when stream is active and not completed */}
                        {!localIsCompleted && isActive && particles.map((particle) => (
                            <motion.div
                                key={particle.id}
                                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                                style={{
                                    left: `${Math.max(0, Math.min(100, particle.progress))}%`,
                                    transform: 'translateX(-50%) translateY(-50%)',
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: particle.progress > 95 ? 0 : 1,
                                    scale: particle.progress > 95 ? 0 : [0.8, 1.3, 1],
                                    y: particle.progress > 95 ? 0 : [-2, 2, -2]
                                }}
                                transition={{ duration: 0.8 }}
                            >
                                {/* Modern particle effects */}
                                <div className="absolute inset-0 w-4 h-4 sm:w-6 sm:h-6 md:w-10 md:h-10 lg:w-14 lg:h-14 xl:w-18 xl:h-18 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                                <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 md:w-8 md:h-8 lg:w-12 lg:h-12 xl:w-16 xl:h-16 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 rounded-full blur-lg opacity-40"></div>

                                {/* Modern particle core */}
                                <motion.div
                                    className="relative w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-14 xl:h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 rounded-full shadow-2xl border-2 sm:border-3 border-white flex items-center justify-center"
                                    animate={{
                                        rotate: [0, 360],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                >
                                    <span className="text-white text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-black">$</span>
                                </motion.div>

                                {/* Lightning speed trail effect */}
                                <div className="absolute top-1/2 right-full transform -translate-y-1/2 pointer-events-none">
                                    {/* Long trail */}
                                    <div className="w-8 sm:w-12 md:w-20 lg:w-28 xl:w-36 h-1 sm:h-1 md:h-1.5 lg:h-2 xl:h-2.5 bg-gradient-to-l from-blue-500/80 via-purple-500/60 to-transparent rounded-full blur-sm"></div>
                                    {/* Medium trail */}
                                    <div className="w-6 sm:w-8 md:w-16 lg:w-20 xl:w-28 h-0.5 sm:h-1 md:h-1 lg:h-1.5 xl:h-2 bg-gradient-to-l from-blue-400/60 via-purple-400/40 to-transparent rounded-full blur-md absolute top-0.5"></div>
                                    {/* Short trail */}
                                    <div className="w-4 sm:w-6 md:w-12 lg:w-16 xl:w-20 h-0.5 bg-gradient-to-l from-blue-300/40 via-purple-300/20 to-transparent rounded-full blur-lg absolute top-1"></div>
                                </div>

                                {/* Additional speed lines */}
                                <div className="absolute top-1/2 right-full transform -translate-y-1/2 pointer-events-none">
                                    <div className="w-6 sm:w-8 md:w-12 lg:w-18 xl:w-24 h-0.5 bg-gradient-to-l from-white/80 to-transparent rounded-full blur-sm absolute top-0"></div>
                                    <div className="w-4 sm:w-6 md:w-10 lg:w-14 xl:w-18 h-0.5 bg-gradient-to-l from-white/60 to-transparent rounded-full blur-sm absolute top-1 sm:top-2"></div>
                                    <div className="w-3 sm:w-4 md:w-8 lg:w-10 xl:w-14 h-0.5 bg-gradient-to-l from-white/40 to-transparent rounded-full blur-sm absolute top-2 sm:top-4"></div>
                                </div>

                                {/* Flashing sparkles around each coin */}
                                {[...Array(4)].map((_, i) => (
                                    <motion.div
                                        key={`coin-sparkle-${particle.id}-${i}`}
                                        className="absolute w-1 h-1 sm:w-1 sm:h-1 md:w-1.5 md:h-1.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 bg-yellow-400 rounded-full"
                                        style={{
                                            top: `${Math.sin(i * Math.PI / 2) * 8}px`,
                                            left: `${Math.cos(i * Math.PI / 2) * 8}px`,
                                        }}
                                        animate={{
                                            scale: [0, 1.5, 0],
                                            opacity: [0, 1, 0],
                                            rotate: [0, 180, 360]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: i * 0.3
                                        }}
                                    />
                                ))}
                            </motion.div>
                        ))}

                        {/* Static connection line when stream is completed */}
                        {localIsCompleted && (
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full opacity-50"></div>
                        )}
                    </div>

                    <motion.div
                        className="flex flex-col items-center space-y-2 sm:space-y-4"
                        initial={{ opacity: 0, x: 60, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        {/* Modern Receiver Avatar */}
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gradient-to-r from-teal-500 to-purple-600 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl blur-xl opacity-30"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.5, 0.3]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                            />
                            <motion.div
                                className="relative w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl border-2 sm:border-3 md:border-4 border-white text-sm sm:text-base md:text-xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-br from-teal-600 via-purple-600 to-blue-600 text-white"
                                whileHover={{ scale: 1.05, rotate: -5 }}
                                animate={{
                                    boxShadow: [
                                        "0 20px 40px rgba(45, 212, 191, 0.3)",
                                        "0 25px 50px rgba(139, 92, 246, 0.4)",
                                        "0 20px 40px rgba(45, 212, 191, 0.3)"
                                    ]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                            >
                                {receiver.name ? receiver.name[0].toUpperCase() : '?'}
                            </motion.div>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-600 mb-1 sm:mb-2 tracking-wide uppercase">Receiver</p>
                            <div className="bg-white/80 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-6 lg:py-3 rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl border border-gray-200 shadow-lg">
                                <p className="text-[10px] sm:text-xs md:text-sm lg:text-base font-mono text-gray-700 font-medium">
                                    {receiver.address.slice(0, 6)}...{receiver.address.slice(-4)}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Modern Controls and Info */}
                <motion.div
                    className="w-full max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    {/* Modern Flow Rate Display */}
                    <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                        <div className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-2xl border border-gray-200">
                            <motion.div
                                className="text-base sm:text-lg md:text-2xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 md:gap-4"
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                style={{
                                    backgroundSize: "200% 200%",
                                    backgroundImage: "linear-gradient(90deg, #2563eb, #7c3aed, #0d9488, #2563eb)"
                                }}
                            >
                                {isActive && !localIsCompleted ? (
                                    <FlowingBalance startingBalance={BigInt(isTestnetChain(activeChain.chainId) ? "000000000000000000" : "000000")} startingBalanceDate={startDate} flowRate={BigInt(amount)} />
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 md:gap-4">
                                        <img src={getCurrencyLogo()} alt="Currency Logo" width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full shadow-lg" />
                                        <span className="text-lg sm:text-2xl md:text-4xl lg:text-6xl font-black">{displayCalculation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 12 })}</span>
                                        <span className="text-xs sm:text-sm md:text-base lg:text-lg">{tokenConfig.superToken.symbol} sent!</span>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Modern Control Buttons */}
                    {user?.wallet?.address === sender.address ? <div className="flex items-center justify-center mt-3 sm:mt-4 md:mt-6 lg:mt-8">
                        <motion.button
                            onClick={handleStopStream}
                            disabled={isStopSuperfluidTransferPending || localIsCompleted}
                            className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 shadow-red-500/30 backdrop-blur-sm border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg"
                            whileHover={{ scale: isStopSuperfluidTransferPending ? 1 : 1.05, y: isStopSuperfluidTransferPending ? 0 : -2 }}
                            whileTap={{ scale: isStopSuperfluidTransferPending ? 1 : 0.98 }}
                            animate={{
                                boxShadow: ["0 10px 30px rgba(239, 68, 68, 0.3)", "0 15px 40px rgba(239, 68, 68, 0.4)", "0 10px 30px rgba(239, 68, 68, 0.3)"]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            {isStopSuperfluidTransferPending ? (
                                <motion.div
                                    className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                                    <StopCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                                    <span className="text-[10px] sm:text-xs md:text-sm lg:text-base">Stop & Get Invoice</span>
                                </div>
                            )}
                        </motion.button>
                    </div> : null}

                    {/* Modern Status Display */}
                    <motion.div
                        className="mt-3 sm:mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4"
                        animate={{
                            y: [0, -2, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="inline-flex items-center space-x-1.5 sm:space-x-2 md:space-x-4 bg-white/80 backdrop-blur-sm px-2 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-3 rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-200 shadow-lg">
                            <motion.div
                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full ${isCompleted ? 'bg-gray-400' : 'bg-green-500'} shadow-lg`}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <span className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 tracking-wide uppercase">
                                {localIsCompleted ? 'Stream Completed' : 'Stream Active'}
                            </span>
                        </div>

                        {/* Duration Display */}
                        <TooltipProvider>   <Tooltip delayDuration={100}  >
                            <TooltipTrigger>
                                <div className="inline-flex items-center space-x-1.5 sm:space-x-2 md:space-x-4 bg-white/80 backdrop-blur-sm px-2 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-3 rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-200 shadow-lg">
                                    <motion.div
                                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full bg-blue-500 shadow-lg"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.7, 1, 0.7]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                    <span className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 tracking-wide uppercase">
                                        {calculateDuration()}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Time Elapsed: {calculateDuration()}</p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default StreamVisualizer; 