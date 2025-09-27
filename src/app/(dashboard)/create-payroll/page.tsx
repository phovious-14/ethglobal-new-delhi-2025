'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDistribution } from '@/src/app/context/DistributionContext';
import { useChain } from '@/src/app/context/ChainContext';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import {
    DollarSign,
    Eye,
    Send,
    AlertCircle,
    Waves
} from 'lucide-react';
import { RecipientSelector } from '@/src/components/payroll/RecipientSelector';
import { InvoiceUploader } from '@/src/components/payroll/InvoiceUploader';
import { SuccessDialog } from '@/src/components/ui/success-dialog';
import { TokenSelector } from '@/src/components/ui/token-selector';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '@/src/hooks/use-toast';
import { useInstant } from '@/src/hooks/use-instant';
import { useBalances } from '@/src/hooks/use-balances';
import { parseTokenAmount, isTestnetChain } from '@/src/utils/tokenRegistry';
import { useToken } from '@/src/app/context/TokenContext';
import { env } from '@/src/env.mjs';
import { useStream, useBufferAmount } from '@/src/hooks/use-stream';
import {
    trackStreamCreationStart,
    trackStreamCreationSuccess,
    trackStreamCreationFailed,
    trackInstantPaymentStart,
    trackInstantPaymentSuccess,
    trackInstantPaymentFailed,
} from '@/src/utils/analytics';
import { initMixpanel } from '@/src/lib/mixpanelClient';
import { identifyUser } from '@/src/utils/analytics/IdentifyMixpanelUser';

interface PayrollFormData {
    payrollName: string;
    sendWalletAddress: string;
    receiverName: string;
    walletAddress: string;
    amount: string;
    endDateTime: string;
    flowRateUnit: 'hour' | 'day' | 'week' | 'month';
}

interface InvoiceData {
    id: string;
    fileName: string;
    amount: string;
    status: 'pending' | 'uploaded';
    type?: 'generated' | 'uploaded';
    file?: File;
}

const CreatePayrollPage = () => {
    const { isInstantDistribution } = useDistribution();
    const { activeSymbol, tokenPair } = useToken();
    const { activeChain } = useChain();
    const [formData, setFormData] = useState<PayrollFormData>({
        payrollName: `Payroll ${new Date().toLocaleDateString()}`,
        sendWalletAddress: '',
        receiverName: '',
        walletAddress: '',
        amount: '',
        endDateTime: '',
        flowRateUnit: 'month',
    });
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [generatedPDFs, setGeneratedPDFs] = useState<Blob[]>([]);
    const [selectedPDFId, setSelectedPDFId] = useState<string>('');
    const [accessToken, setAccessToken] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [amountError, setAmountError] = useState<string>("");
    const [pendingInvoice, setPendingInvoice] = useState<InvoiceData | null>(null);
    const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState<string>('');

    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
    const [successDialogData, setSuccessDialogData] = useState<{
        type: 'instant' | 'stream';
        message: string;
    } | null>(null);
    const isSubmittingRef = useRef(false);

    // Enhanced UX states
    const [showInvoiceSection, setShowInvoiceSection] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [autoAdvance, setAutoAdvance] = useState(true);

    const { toast } = useToast();

    const { ready, user: privyUser, getAccessToken } = usePrivy();

    const { createInstantAsync, createSuperfluidInstantAsync } = useInstant();
    const { createStreamAsync, createSuperfluidStreamAsync } = useStream();

    const balances = useBalances(activeSymbol);
    const tokenConfig = tokenPair; // Use selected token pair instead of default

    // Calculate flow rate using the same logic as Home.tsx
    const calculateFlowRate = useCallback((amount: string, unit: 'hour' | 'day' | 'week' | 'month'): string => {
        if (!amount || parseFloat(amount) <= 0) return '';

        const numAmount = parseFloat(amount);
        let durationInSeconds: number;

        // Calculate duration based on unit
        switch (unit) {
            case 'hour':
                durationInSeconds = 60 * 60; // 1 hour
                break;
            case 'day':
                durationInSeconds = 24 * 60 * 60; // 1 day
                break;
            case 'week':
                durationInSeconds = 7 * 24 * 60 * 60; // 1 week
                break;
            case 'month':
                durationInSeconds = 30 * 24 * 60 * 60; // 30 days
                break;
            default:
                durationInSeconds = 30 * 24 * 60 * 60; // Default to 30 days
        }

        const weiAmount = Math.pow(10, Number(tokenConfig.superToken.decimals)) * numAmount;
        const flowRate = weiAmount / durationInSeconds;

        //log buffer via calling superfluid function


        return BigInt(Math.floor(flowRate)).toString();
    }, []);

    // Memoized handlers to prevent unnecessary re-renders
    const handleInputChange = useCallback((field: keyof PayrollFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Validate amount when amount field changes
        if (field === 'amount') {
            const error = validateAmount(value);
            setAmountError(error);
        }
    }, [balances, tokenConfig]);

    // Balance validation
    const validateAmount = (amount: string): string => {
        if (!amount) {
            return '';
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
            return `Insufficient balance. You have ${balances.superToken} ${tokenConfig.superToken.symbol}`;
        }
        return '';
    };

    const handleFormDataChange = useCallback((field: 'receiverName' | 'walletAddress', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleInvoicesChange = useCallback((newInvoices: InvoiceData[]) => {
        setInvoices(newInvoices);
    }, []);

    const handleSelectedPDFChange = useCallback((id: string) => {
        setSelectedPDFId(id);
    }, []);

    const handleGeneratedPDFsChange = useCallback((pdfs: Blob[]) => {
        setGeneratedPDFs(pdfs);
    }, []);

    const generateInvoiceNumber = useCallback(() => {
        const invoiceNumber = `INV-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        setCurrentInvoiceNumber(invoiceNumber);
        return invoiceNumber;
    }, []);

    const uploadInvoice = useCallback((invoice: InvoiceData) => {
        setPendingInvoice(invoice);
    }, []);

    const uploadInvoiceToIPFS = useCallback(async (invoice: InvoiceData) => {
        try {
            let fileToUpload: File;

            if (invoice.type === 'uploaded' && invoice.file) {
                // Use the uploaded file
                fileToUpload = invoice.file;
            } else if (invoice.type === 'generated') {
                // For generated invoices, we need to get the PDF blob from generatedPDFs
                const generatedPDF = generatedPDFs.find((_, index) => index === 0); // Get the first generated PDF
                if (!generatedPDF) {
                    throw new Error('Generated PDF not found');
                }
                fileToUpload = new File([generatedPDF], invoice.fileName, { type: 'application/pdf' });
            } else {
                throw new Error('Invalid invoice type');
            }

            // Upload to IPFS
            const formData = new FormData();
            formData.append("file", fileToUpload, fileToUpload.name);
            formData.append("network", "public");

            const res = await fetch("https://uploads.pinata.cloud/v3/files", {
                method: "POST",
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
        } catch (error) {
            console.error('Failed to upload invoice to IPFS:', error);
            throw error;
        }
    }, [generatedPDFs]);

    const getUserAccessToken = useCallback(async () => {
        const userAccessToken = await getAccessToken();
        if (userAccessToken) {
            setAccessToken(userAccessToken);
        }
    }, [getAccessToken]);

    // Separate handleSubmit functions - Remove useCallback to prevent re-creation issues
    const handleSubmitInstant = async () => {
        initMixpanel();

        identifyUser(privyUser?.id || "", privyUser?.email?.address || "", privyUser?.wallet?.address || "");
        // Track instant payment start
        if (privyUser?.wallet?.address) {
            trackInstantPaymentStart({
                distinct_id: privyUser?.id || "",
                walletAddress: privyUser.wallet.address,
                recipientAddress: formData.walletAddress,
                amount: formData.amount,
                payrollName: formData.payrollName,
                network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                tokenSymbol: tokenConfig.superToken.symbol,
                isTestnet: isTestnetChain(activeChain.chainId)
            });
        }

        try {
            let documentUrl = '';
            let invoiceNumber = '';

            // Handle invoice upload if there's a pending invoice
            if (pendingInvoice) {
                try {
                    const ipfsData = await uploadInvoiceToIPFS(pendingInvoice);
                    if (ipfsData) {
                        documentUrl = `https://indigo-obedient-wombat-704.mypinata.cloud/ipfs/${ipfsData?.data?.cid}?pinataGatewayToken=${env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN}`;
                        // Use currentInvoiceNumber if available, otherwise generate a new one
                        invoiceNumber = currentInvoiceNumber || generateInvoiceNumber();
                    }
                } catch (uploadError) {
                    // Track instant payment failure
                    if (privyUser?.wallet?.address) {
                        trackInstantPaymentFailed({
                            distinct_id: privyUser?.id || "",
                            walletAddress: privyUser.wallet.address,
                            recipientAddress: formData.walletAddress,
                            amount: formData.amount,
                            payrollName: formData.payrollName,
                            network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                            tokenSymbol: tokenConfig.superToken.symbol,
                            isTestnet: isTestnetChain(activeChain.chainId),
                            error: "Failed to upload invoice to IPFS"
                        });
                    }
                    console.error("Failed to upload invoice to IPFS:", uploadError);
                    setInvoices([]);
                    setPendingInvoice(null);
                    setShowInvoiceSection(false);
                    setShowPreview(false);
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                    toast({
                        title: "Failed to create Superfluid instant",
                        description: "Please try again. If the problem persists, please contact support.",
                        variant: "destructive"
                    });
                    return;
                    // Continue with the process even if upload fails
                }
            } else if (selectedPDFId) {
                // If no pending invoice but there's a selected PDF, use that
                const selectedInvoice = invoices.find(inv => inv.id === selectedPDFId);
                if (selectedInvoice) {
                    invoiceNumber = selectedInvoice.fileName;
                    // For selected invoices, we need to provide a document URL
                    // Since we can't upload existing files to IPFS, we'll use a placeholder
                    documentUrl = `https://placeholder.com/invoice/${selectedInvoice.id}`;
                }
            }

            // Ensure we have required invoice data
            if (!invoiceNumber) {
                toast({
                    title: "Invoice Required",
                    description: "Please generate or select an invoice before proceeding.",
                    variant: "destructive"
                });
                setIsSubmitting(false);
                return;
            }

            // Validate all required fields before creating payment
            if (!formData.payrollName || !privyUser?.wallet?.address || !formData.receiverName ||
                !formData.walletAddress || !formData.amount) {
                toast({
                    title: "Missing Required Fields",
                    description: "Please ensure all required fields are filled before proceeding.",
                    variant: "destructive"
                });
                setIsSubmitting(false);
                return;
            }

            // Create Superfluid instant payment
            const txData = await createSuperfluidInstantAsync({
                recipientAddress: formData.walletAddress,
                amount: formData.amount,
                superTokenAddr: tokenConfig.superToken.address,
                decimals: tokenConfig.superToken.decimals,
            });

            if (!txData?.transactionHash) {

                // Track instant payment failure
                if (privyUser?.wallet?.address) {
                    trackInstantPaymentFailed({
                        distinct_id: privyUser?.id || "",
                        walletAddress: privyUser.wallet.address,
                        recipientAddress: formData.walletAddress,
                        amount: formData.amount,
                        payrollName: formData.payrollName,
                        network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                        tokenSymbol: tokenConfig.superToken.symbol,
                        isTestnet: isTestnetChain(activeChain.chainId),
                        error: "Failed to create Superfluid instant"
                    });
                }
                setFormData({
                    sendWalletAddress: '',
                    payrollName: `Payroll ${new Date().toLocaleDateString()}`,
                    receiverName: '',
                    walletAddress: '',
                    amount: '',
                    endDateTime: '',
                    flowRateUnit: 'month',
                });
                setInvoices([]);
                setPendingInvoice(null);
                setShowInvoiceSection(false);
                setShowPreview(false);
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                toast({
                    title: "Failed to create Superfluid instant",
                    description: "Please try again. If the problem persists, please contact support.",
                    variant: "destructive"
                });
                return;
            }

            // Final validation to ensure all required fields are present
            if (!invoiceNumber || !txData.transactionHash || !formData.payrollName ||
                !privyUser?.wallet?.address || !formData.receiverName || !formData.walletAddress ||
                !formData.amount || !env.NEXT_PUBLIC_TOKEN_SYMBOL || !documentUrl) {
                toast({
                    title: "Missing Required Data",
                    description: "Some required data is missing. Please try again.",
                    variant: "destructive"
                });
                setIsSubmitting(false);
                return;
            }

            // Create the instant record in backend
            const data = await createInstantAsync({
                payrollName: formData.payrollName,
                senderWalletAddress: privyUser?.wallet?.address || '',
                receiverName: formData.receiverName,
                receiverWalletAddress: formData.walletAddress,
                amount: parseTokenAmount(formData.amount, tokenConfig.superToken.decimals),
                chainId: activeChain.chainId.toString(),
                txHash: txData.transactionHash,
                accessToken: accessToken,
                invoiceNumber: invoiceNumber,
                documentUrl: documentUrl,
                tokenSymbol: tokenConfig.superToken.symbol as "PYUSDx",
            });

            if (!data) {
                // Track instant payment failure
                if (privyUser?.wallet?.address) {
                    trackInstantPaymentFailed({
                        distinct_id: privyUser?.id || "",
                        walletAddress: privyUser.wallet.address,
                        recipientAddress: formData.walletAddress,
                        amount: formData.amount,
                        payrollName: formData.payrollName,
                        network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                        tokenSymbol: tokenConfig.superToken.symbol,
                        isTestnet: isTestnetChain(activeChain.chainId),
                        error: "Storing instant payment record in database failed"
                    });
                }

                setFormData({
                    sendWalletAddress: '',
                    payrollName: `Payroll ${new Date().toLocaleDateString()}`,
                    receiverName: '',
                    walletAddress: '',
                    amount: '',
                    endDateTime: '',
                    flowRateUnit: 'month',
                });
                setInvoices([]);
                setPendingInvoice(null);
                setShowInvoiceSection(false);
                setShowPreview(false);
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                toast({
                    title: "Failed to create instant payment record",
                    description: "Please try again. If the problem persists, please contact support.",
                    variant: "destructive"
                });
                return;
            }

            // Track instant payment success
            if (privyUser?.wallet?.address) {
                trackInstantPaymentSuccess({
                    distinct_id: privyUser?.id || "",
                    walletAddress: privyUser.wallet.address,
                    recipientAddress: formData.walletAddress,
                    amount: formData.amount,
                    payrollName: formData.payrollName,
                    paymentId: data?.id,
                    network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                    tokenSymbol: tokenConfig.superToken.symbol,
                    transactionHash: txData.transactionHash,
                    isTestnet: isTestnetChain(activeChain.chainId)
                });
            }

            // Show success dialog
            setSuccessDialogData({
                type: 'instant',
                message: `Successfully sent ${formData.amount} ${tokenConfig.superToken.symbol} to ${formData.receiverName}!`
            });
            setIsSuccessDialogOpen(true);

            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    sendWalletAddress: '',
                    payrollName: `Payroll ${new Date().toLocaleDateString()}`,
                    receiverName: '',
                    walletAddress: '',
                    amount: '',
                    endDateTime: '',
                    flowRateUnit: 'month',
                });
                setInvoices([]);
                setPendingInvoice(null);
                setShowInvoiceSection(false);
                setShowPreview(false);
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            }, 1000); // Reduced delay since dialog handles its own timing
        } catch (error) {
            console.error('Error creating payroll:', error);

            // Track instant payment failure
            if (privyUser?.wallet?.address) {
                trackInstantPaymentFailed({
                    distinct_id: privyUser?.id || "",
                    walletAddress: privyUser.wallet.address,
                    recipientAddress: formData.walletAddress,
                    amount: formData.amount,
                    payrollName: formData.payrollName,
                    network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                    tokenSymbol: tokenConfig.superToken.symbol,
                    isTestnet: isTestnetChain(activeChain.chainId),
                    error: "Failed to create instant payment record or cancelled tx"
                });
            }

            toast({
                title: "Payroll Failed",
                description: "Failed to create payroll. Please try again.",
                variant: "destructive"
            });
            setFormData({
                sendWalletAddress: '',
                payrollName: '',
                receiverName: '',
                walletAddress: '',
                amount: '',
                endDateTime: '',
                flowRateUnit: 'month',
            });
            setInvoices([]);
            setPendingInvoice(null);
            setShowInvoiceSection(false);
            setShowPreview(false);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const handleSubmitStream = async () => {
        initMixpanel();

        identifyUser(privyUser?.id || "", privyUser?.email?.address || "", privyUser?.wallet?.address || "");
        // Track stream creation start

        if (privyUser?.wallet?.address) {
            trackStreamCreationStart({
                distinct_id: privyUser?.id || "",
                walletAddress: privyUser.wallet.address,
                recipientAddress: formData.walletAddress,
                amount: formData.amount,
                flowRate: calculateFlowRate(formData.amount, formData.flowRateUnit),
                payrollName: formData.payrollName,
                network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                tokenSymbol: tokenConfig.superToken.symbol,
                startDate: new Date().toISOString(),
                endDate: formData.endDateTime,
                isTestnet: isTestnetChain(activeChain.chainId)
            });
        }

        try {
            const txData = await createSuperfluidStreamAsync({
                recipientAddress: formData.walletAddress,
                amount: calculateFlowRate(formData.amount, formData.flowRateUnit),
                superTokenAddr: tokenConfig.superToken.address,
                decimals: tokenConfig.superToken.decimals,
            });

            if (!txData?.transactionHash) {
                // Track stream creation failure
                if (privyUser?.wallet?.address) {
                    trackStreamCreationFailed({
                        distinct_id: privyUser?.id || "",
                        walletAddress: privyUser.wallet.address,
                        recipientAddress: formData.walletAddress,
                        amount: formData.amount,
                        flowRate: calculateFlowRate(formData.amount, formData.flowRateUnit),
                        payrollName: formData.payrollName,
                        network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                        tokenSymbol: tokenConfig.superToken.symbol,
                        startDate: new Date().toISOString(),
                        endDate: formData.endDateTime,
                        isTestnet: isTestnetChain(activeChain.chainId),
                        error: "Failed to create stream"
                    });
                }
                setFormData({
                    sendWalletAddress: '',
                    payrollName: `Payroll ${new Date().toLocaleDateString()}`,
                    receiverName: '',
                    walletAddress: '',
                    amount: '',
                    endDateTime: '',
                    flowRateUnit: 'month',
                });
                setInvoices([]);
                setPendingInvoice(null);
                setShowInvoiceSection(false);
                setShowPreview(false);
                isSubmittingRef.current = false;
                setIsSubmitting(false);

                toast({
                    title: "Failed to create Superfluid stream",
                    description: "Please try again. If the problem persists, please contact support.",
                    variant: "destructive"
                });

                return;
            }

            const data = await createStreamAsync({
                payrollName: formData.payrollName,
                senderWalletAddress: privyUser?.wallet?.address || '',
                receiverName: formData.receiverName,
                receiverWalletAddress: formData.walletAddress,
                amount: parseTokenAmount(formData.amount, tokenConfig.superToken.decimals),
                flowRate: calculateFlowRate(formData.amount, formData.flowRateUnit),
                streamStartTime: new Date().toISOString(),
                accessToken: accessToken,
                streamStartTxHash: txData.transactionHash,
                flowRateUnit: formData.flowRateUnit,
                tokenSymbol: tokenConfig.superToken.symbol as "PYUSDx",
                chainId: activeChain.chainId.toString(),
            });

            if (!data) {
                // Track stream creation failure
                if (privyUser?.wallet?.address) {
                    trackStreamCreationFailed({
                        distinct_id: privyUser.wallet.address,
                        walletAddress: privyUser.wallet.address,
                        recipientAddress: formData.walletAddress,
                        amount: formData.amount,
                        flowRate: calculateFlowRate(formData.amount, formData.flowRateUnit),
                        payrollName: formData.payrollName,
                        network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                        tokenSymbol: tokenConfig.superToken.symbol,
                        startDate: new Date().toISOString(),
                        endDate: formData.endDateTime,
                        isTestnet: isTestnetChain(activeChain.chainId),
                        error: "Storing stream in database failed"
                    });
                }
                toast({
                    title: "Failed to create stream",
                    description: "Please try again. If the problem persists, please contact support.",
                    variant: "destructive"
                });
                return;
            }

            // Track stream creation success
            if (privyUser?.wallet?.address) {
                trackStreamCreationSuccess({
                    distinct_id: privyUser.wallet.address,
                    walletAddress: privyUser.wallet.address,
                    recipientAddress: formData.walletAddress,
                    amount: formData.amount,
                    flowRate: calculateFlowRate(formData.amount, formData.flowRateUnit),
                    payrollName: formData.payrollName,
                    streamId: data?.id,
                    network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                    tokenSymbol: tokenConfig.superToken.symbol,
                    startDate: new Date().toISOString(),
                    endDate: formData.endDateTime,
                    isTestnet: isTestnetChain(activeChain.chainId)
                });
            }

            // Show success dialog
            setSuccessDialogData({
                type: 'stream',
                message: `Successfully started streaming ${formData.amount} ${tokenConfig.superToken.symbol} per ${formData.flowRateUnit} to ${formData.receiverName}!`
            });
            setIsSuccessDialogOpen(true);

            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    sendWalletAddress: '',
                    payrollName: `Payroll ${new Date().toLocaleDateString()}`,
                    receiverName: '',
                    walletAddress: '',
                    amount: '',
                    endDateTime: '',
                    flowRateUnit: 'month',
                });
                setInvoices([]);
                setPendingInvoice(null);
                setShowInvoiceSection(false);
                setShowPreview(false);
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            }, 1000); // Reduced delay since dialog handles its own timing
        } catch (error) {
            console.error('Error creating payroll:', error);

            // Track stream creation failure
            if (privyUser?.wallet?.address) {
                trackStreamCreationFailed({
                    distinct_id: privyUser.wallet.address,
                    walletAddress: privyUser.wallet.address,
                    recipientAddress: formData.walletAddress,
                    amount: formData.amount,
                    flowRate: calculateFlowRate(formData.amount, formData.flowRateUnit),
                    payrollName: formData.payrollName,
                    network: isTestnetChain(activeChain.chainId) ? 'testnet' : 'mainnet',
                    tokenSymbol: tokenConfig.superToken.symbol,
                    startDate: new Date().toISOString(),
                    endDate: formData.endDateTime,
                    isTestnet: isTestnetChain(activeChain.chainId),
                    error: "Failed to create stream or cancelled tx"
                });
            }

            toast({
                title: "Payroll Failed",
                description: "Failed to create payroll. Please try again.",
                variant: "destructive"
            });
            setFormData({
                sendWalletAddress: '',
                payrollName: `Payroll ${new Date().toLocaleDateString()}`,
                receiverName: '',
                walletAddress: '',
                amount: '',
                endDateTime: '',
                flowRateUnit: 'month',
            });
            setInvoices([]);
            setPendingInvoice(null);
            setShowInvoiceSection(false);
            setShowPreview(false);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };



    // Main handleSubmit delegates to the correct function
    const handleSubmit = async () => {
        // Prevent multiple submissions
        if (isSubmittingRef.current) {
            return;
        }

        // Set submitting immediately to prevent multiple calls
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            if (isInstantDistribution) {
                await handleSubmitInstant();
            } else {
                await handleSubmitStream();
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    // Enhanced validation with auto-advance support
    const isBasicFormComplete = useMemo(() => {
        return formData.payrollName && formData.receiverName && formData.walletAddress && formData.amount && !amountError &&
            (!isInstantDistribution ? (formData.flowRateUnit) : true);
    }, [formData, isInstantDistribution, amountError]);

    const isInvoiceComplete = useMemo(() => {
        return !isInstantDistribution || (invoices.length > 0 && selectedPDFId);
    }, [isInstantDistribution, invoices.length, selectedPDFId]);

    const canSubmit = useMemo(() => {
        return isBasicFormComplete && isInvoiceComplete;
    }, [isBasicFormComplete, isInvoiceComplete]);

    // Auto-advance logic
    useEffect(() => {
        if (autoAdvance && isBasicFormComplete && !showPreview) {
            setShowPreview(true);
        }
    }, [isBasicFormComplete, autoAdvance, showPreview]);

    // Auto-show invoice section for instant payments
    useEffect(() => {
        if (isInstantDistribution && !showInvoiceSection) {
            setShowInvoiceSection(true);
        }
    }, [isInstantDistribution, showInvoiceSection]);

    useEffect(() => {
        if (privyUser && ready) {
            getUserAccessToken();
        }
    }, [privyUser, ready, getUserAccessToken]);

    // Clear invoice state when switching from instant to stream mode
    useEffect(() => {
        if (!isInstantDistribution) {
            // Clear invoice state when switching to stream mode
            setInvoices([]);
            setSelectedPDFId('');
            setGeneratedPDFs([]);
            setPendingInvoice(null);
        }
    }, [isInstantDistribution]);

    // Calculate flowRate for buffer
    const flowRate = useMemo(() => {
        if (!isInstantDistribution && formData.amount && formData.flowRateUnit) {
            return calculateFlowRate(formData.amount, formData.flowRateUnit);
        }
        return undefined;
    }, [formData.amount, formData.flowRateUnit, isInstantDistribution, calculateFlowRate]);
    const { data: bufferAmount, isLoading: bufferLoading, error: bufferError } = useBufferAmount(flowRate, tokenConfig.superToken.address);



    const renderEnhancedLayout = () => (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 p-2 sm:p-3">
            <div className="max-w-6xl mx-auto">
                {/* Compact Header */}
                <div className="text-center mb-3 sm:mb-4">
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
                            {isInstantDistribution ? 'Instant Payment' : 'Stream Payment'}
                        </h1>
                    </div>
                </div>

                {/* Main Container - Compact Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Form Section - 3 columns on desktop, full width on mobile */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-3 sm:p-4 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto overflow-x-hidden">
                            <div className="space-y-3 sm:space-y-4">
                                {/* Token Selector */}
                                <div className="group">
                                    <TokenSelector
                                        size="md"
                                        showLabel={true}
                                        className="w-full"
                                    />
                                </div>

                                {/* Compact Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {/* Payroll Name */}
                                    <div className="group">
                                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                            <Label htmlFor="payrollName" className="text-xs font-semibold text-slate-700">
                                                Payroll Name
                                            </Label>
                                            <div className="flex items-center gap-1 bg-blue-100/80 backdrop-blur-sm rounded-lg px-1.5 py-0.5 sm:px-2 sm:py-1">
                                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-medium text-blue-800">
                                                    Required
                                                </span>
                                            </div>
                                        </div>
                                        <Input
                                            id="payrollName"
                                            value={formData.payrollName}
                                            onChange={(e) => handleInputChange('payrollName', e.target.value)}
                                            className="h-9 sm:h-10 rounded-xl border-2 border-slate-200/60 bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 text-sm shadow-sm hover:shadow-md"
                                        />
                                    </div>

                                    {/* Amount */}
                                    <div className="group">
                                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                            <Label htmlFor="amount" className="text-xs font-semibold text-slate-700">
                                                Amount
                                            </Label>
                                            <div className="flex items-center gap-1 bg-green-100/80 backdrop-blur-sm rounded-lg px-1.5 py-0.5 sm:px-2 sm:py-1">
                                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-medium text-green-800">
                                                    {balances?.superToken || '0'} {tokenConfig.superToken.symbol}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    value={formData.amount}
                                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                                    placeholder="0.00"
                                                    className={`h-9 sm:h-10 rounded-xl border-2 border-slate-200/60 bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 text-sm pl-8 shadow-sm hover:shadow-md ${amountError ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                    step="0.000001"
                                                    min="0"
                                                />
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-semibold">
                                                    {tokenConfig.superToken.symbol === 'USDCx' ? '$' : tokenConfig.superToken.symbol.charAt(0)}
                                                </div>
                                            </div>
                                            {!isInstantDistribution && (
                                                <Select
                                                    value={formData.flowRateUnit}
                                                    onValueChange={(value: 'hour' | 'day' | 'week' | 'month') =>
                                                        handleInputChange('flowRateUnit', value)
                                                    }
                                                >
                                                    <SelectTrigger className="h-9 sm:h-10 w-20 sm:w-24 rounded-xl border-2 border-slate-200/60 bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 shadow-sm hover:shadow-md">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-2xl">
                                                        <SelectItem value="hour">/hour</SelectItem>
                                                        <SelectItem value="day">/day</SelectItem>
                                                        <SelectItem value="week">/week</SelectItem>
                                                        <SelectItem value="month">/month</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>

                                        {/* Quick Amount Buttons */}
                                        <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2">
                                            {(isTestnetChain(activeChain.chainId) ? [0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005] : [10, 50, 100, 500]).map((amount) => (
                                                <Button
                                                    key={amount}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleInputChange('amount', amount.toString())}
                                                    className={`h-5 sm:h-6 px-2 sm:px-2.5 rounded-md border-slate-200/60 bg-white/50 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-xs font-medium ${formData.amount === amount.toString()
                                                        ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-sm scale-105'
                                                        : 'text-slate-600 hover:text-blue-700 hover:scale-105'
                                                        }`}
                                                >
                                                    {isTestnetChain(activeChain.chainId)
                                                        ? (amount < 0.001 ? `${(amount * 1000000).toFixed(0)}μ` : `${(amount * 1000).toFixed(1)}m`)
                                                        : `$${amount.toLocaleString()}`
                                                    }
                                                </Button>
                                            ))}
                                        </div>
                                        {amountError && (
                                            <div className="text-xs text-red-500 mt-1 flex items-center gap-1 bg-red-50/80 backdrop-blur-sm rounded-lg p-2">
                                                <AlertCircle className="h-3 w-3" />
                                                {amountError}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recipient - Compact */}
                                <div className="group">
                                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2 block">
                                        Recipient
                                    </Label>
                                    <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-2.5 sm:p-3 border border-slate-200/60">
                                        <RecipientSelector
                                            formData={formData}
                                            onFormDataChange={handleFormDataChange}
                                            accessToken={accessToken}
                                        />
                                    </div>
                                </div>

                                {/* Stream Info - Compact */}
                                {!isInstantDistribution && formData.amount && (
                                    <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/60 rounded-xl p-2.5 sm:p-3 shadow-lg">
                                        <div className="flex items-center gap-2.5 sm:gap-3">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                                                <Waves className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-blue-900">Perpetual Stream</h4>
                                                {bufferAmount && (
                                                    <p className="text-xs text-blue-700">
                                                        Buffer: {(Number(bufferAmount) / Math.pow(10, tokenConfig.superToken.decimals)).toLocaleString(undefined, { maximumFractionDigits: 10 })} {tokenConfig.superToken.symbol}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Invoice - Compact */}
                                {isInstantDistribution && (
                                    <div className="border-t border-slate-200/60 pt-2.5 sm:pt-3">
                                        <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                                            <Label className="text-xs font-semibold text-slate-700">
                                                Invoice
                                            </Label>
                                            <div className="bg-red-100/80 backdrop-blur-sm rounded-lg px-1.5 py-0.5 sm:px-2 sm:py-1">
                                                <span className="text-xs font-medium text-red-800">Required</span>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/30 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 border border-slate-200/60">
                                            <div className="mb-2.5 sm:mb-3 p-1.5 sm:p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-xs text-blue-800">
                                                    💡 Click "Generate PDF" to create invoice
                                                </p>
                                            </div>
                                            <InvoiceUploader
                                                formData={formData}
                                                isInstantDistribution={isInstantDistribution}
                                                invoices={invoices}
                                                selectedPDFId={selectedPDFId}
                                                onInvoicesChange={handleInvoicesChange}
                                                onSelectedPDFChange={handleSelectedPDFChange}
                                                onGeneratedPDFsChange={handleGeneratedPDFsChange}
                                                onUploadInvoice={uploadInvoice}
                                                invoiceNumber={currentInvoiceNumber}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Send Button - Compact */}
                                <div className="border-t border-slate-200/60 pt-2.5 sm:pt-3">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit || isSubmitting}
                                        className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold relative group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2 relative z-10">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 relative z-10">
                                                <Send className="w-4 h-4" />
                                                {isInstantDistribution ? 'Send Payment' : 'Start Stream'}
                                            </div>
                                        )}
                                    </Button>

                                    {!canSubmit && (
                                        <div className="text-xs text-slate-500 text-center mt-2 bg-slate-50/80 backdrop-blur-sm rounded-lg p-2">
                                            {!isBasicFormComplete ? 'Complete all required fields above' :
                                                isInstantDistribution && (!invoices.length || !selectedPDFId) ? 'Invoice is required for instant payments' :
                                                    'Please check your inputs'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section - Compact Sidebar */}
                    <div className="lg:col-span-1 order-last lg:order-last">
                        <div className="lg:sticky lg:top-4">
                            {showPreview && isBasicFormComplete ? (
                                <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border border-purple-400/60 rounded-2xl shadow-xl shadow-purple-500/20">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10"></div>
                                    <div className="relative z-10 p-2.5 sm:p-3 lg:p-4">
                                        <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                                <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                                            </div>
                                            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white">Payment Summary</h3>
                                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 lg:p-4 border border-white/20 space-y-2 sm:space-y-2.5 lg:space-y-3">
                                                <div>
                                                    <p className="text-xs text-purple-300 font-medium uppercase tracking-wider mb-1">Recipient</p>
                                                    <p className="text-white font-semibold text-sm sm:text-base">{formData.receiverName}</p>
                                                    <p className="text-gray-300 text-xs font-mono break-all leading-relaxed">{formData.walletAddress}</p>
                                                </div>

                                                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-2 sm:p-2.5 lg:p-3 border border-green-500/30">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                                            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                                                                <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-base sm:text-lg lg:text-xl font-bold text-white">{formData.amount}</p>
                                                                <p className="text-gray-300 text-xs">{tokenConfig.superToken.symbol} {isInstantDistribution ? '' : ` / ${formData.flowRateUnit}`}</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 text-center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 shadow-lg">
                                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-700 mb-1 sm:mb-1.5 lg:mb-2">Complete the form</h3>
                                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Your payment summary will appear here once all fields are filled</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-1 sm:p-2 pt-20 sm:pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-xl">
                    <div className="p-2 sm:p-4">
                        {renderEnhancedLayout()}
                    </div>
                </div>
            </div>
            {successDialogData && (
                <SuccessDialog
                    isOpen={isSuccessDialogOpen}
                    onClose={() => {
                        setIsSuccessDialogOpen(false);
                        setSuccessDialogData(null);
                    }}
                    type={successDialogData.type}
                    message={successDialogData.message}
                />
            )}
        </div>
    );
};

export default CreatePayrollPage;


