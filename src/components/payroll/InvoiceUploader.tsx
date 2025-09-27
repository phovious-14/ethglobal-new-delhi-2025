'use client';

import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Upload, CheckCircle, FileText } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { getTokenConfig } from '@/src/utils/tokenConfig';
import { useChain } from '@/src/app/context/ChainContext';

interface InvoiceData {
    id: string;
    fileName: string;
    amount: string;
    status: 'pending' | 'uploaded';
    type?: 'generated' | 'uploaded';
    file?: File;
}

interface InvoiceUploaderProps {
    formData: {
        payrollName: string;
        sendWalletAddress: string;
        receiverName: string;
        walletAddress: string;
        amount: string;
        endDateTime: string;
    };
    isInstantDistribution: boolean;
    invoices: InvoiceData[];
    selectedPDFId: string;
    onInvoicesChange: (invoices: InvoiceData[]) => void;
    onSelectedPDFChange: (id: string) => void;
    onGeneratedPDFsChange: (pdfs: Blob[]) => void;
    onUploadInvoice?: (invoice: InvoiceData) => void;
    invoiceNumber?: string;
}

export const InvoiceUploader: React.FC<InvoiceUploaderProps> = ({
    formData,
    isInstantDistribution,
    invoices,
    selectedPDFId,
    onInvoicesChange,
    onSelectedPDFChange,
    onGeneratedPDFsChange,
    onUploadInvoice,
    invoiceNumber
}) => {
    const [dragActive, setDragActive] = useState(false);
    const { activeChain } = useChain();
    // Generate random invoice number if not provided
    const generateInvoiceNumber = () => {
        return `INV-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    };

    const enhancedInvoiceNumber = invoiceNumber || generateInvoiceNumber();

    const handleFileUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        // Keep only the latest uploaded file
        const latestFile = files[files.length - 1];

        // Validate file type
        if (!latestFile.type.includes('pdf') && !latestFile.name.toLowerCase().endsWith('.pdf')) {
            alert('Please upload a PDF file only.');
            return;
        }

        const newInvoice: InvoiceData = {
            id: Date.now().toString(),
            fileName: latestFile.name,
            amount: formData.amount || (Math.random() * 1000 + 100).toFixed(2),
            status: 'uploaded' as const,
            type: 'uploaded' as const,
            file: latestFile
        };

        // Replace all existing invoices with just this new one
        onInvoicesChange([newInvoice]);
        onGeneratedPDFsChange([]); // Clear generated PDFs when uploading
        onSelectedPDFChange(newInvoice.id); // Auto-select the uploaded PDF

        // Pass invoice to parent component
        if (onUploadInvoice) {
            onUploadInvoice(newInvoice);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const removeInvoice = () => {
        onInvoicesChange([]);
        onGeneratedPDFsChange([]);
        onSelectedPDFChange('');
    };

    return (
        <div className="space-y-1.5">
            {/* Ultra Smooth Minimal Invoice Section */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-200/40 rounded-xl p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                            <FileText className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-gray-800">Invoice</span>
                    </div>
                    {invoices.length > 0 && (
                        <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs sm:text-sm font-medium text-green-700">Ready</span>
                        </div>
                    )}
                </div>

                {/* Smooth Action Buttons */}
                <div className="flex gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
                    <Button
                        onClick={async () => {
                            try {
                                const { pdf, Document, Page, Text, View, Image } = await import('@react-pdf/renderer');
                                const { professionalPdfStyles } = await import('@/src/utils/pdfStyles');

                                // Use centralized professional styles
                                const styles = professionalPdfStyles;

                                const pdfDoc = (
                                    <Document>
                                        <Page size="A4" style={styles.page}>
                                            {/* Watermark */}
                                            <Text style={styles.watermark}>DRIPPAY</Text>

                                            {/* Enhanced Header */}
                                            <View style={styles.header}>
                                                <View>
                                                    <Image src="/img/drippay.png" style={styles.logo} />
                                                </View>
                                                <View style={styles.invoiceInfo}>
                                                    <Text style={styles.invoiceTitle}>Payroll Invoice</Text>
                                                    <Text style={styles.invoiceNumber}>#{enhancedInvoiceNumber}</Text>
                                                    <Text style={styles.invoiceDate}>
                                                        Generated: {new Date().toLocaleString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })}
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
                                                        <Text style={styles.value}>{formData.receiverName || 'Not Specified'}</Text>
                                                    </View>
                                                    <View style={styles.row}>
                                                        <Text style={styles.label}>Wallet Address:</Text>
                                                        <Text style={[styles.value, styles.walletAddress]}>{formData.walletAddress || 'Not Specified'}</Text>
                                                    </View>
                                                    <View style={styles.row}>
                                                        <Text style={styles.label}>Payroll Name:</Text>
                                                        <Text style={styles.value}>{formData.payrollName || 'Not Specified'}</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Payment Details */}
                                            <View style={styles.section}>
                                                <Text style={styles.sectionTitle}>Payment Details</Text>
                                                <View style={styles.paymentDetails}>
                                                    <View style={styles.row}>
                                                        <Text style={styles.label}>Payment Type:</Text>
                                                        <View style={styles.distributionType}>
                                                            <Text>{isInstantDistribution ? 'Instant Payment' : 'Streaming Payment'}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.row}>
                                                        <Text style={styles.label}>Amount:</Text>
                                                        <View style={styles.amountDisplay}>
                                                            <Text style={styles.value}>${formData.amount || '0.00'} {getTokenConfig(activeChain.chainId).superToken.symbol}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Decorative Line */}
                                            <View style={styles.decorativeLine} />

                                            {/* Total Section */}
                                            <View style={styles.totalSection}>
                                                <View style={styles.totalRow}>
                                                    <Text style={styles.totalLabel}>Total Amount</Text>
                                                    <Text style={styles.totalAmount}>${formData.amount || '0.00'} USDC</Text>
                                                </View>
                                            </View>
                                        </Page>
                                    </Document>
                                );

                                const blob = await pdf(pdfDoc).toBlob();

                                const newInvoice: InvoiceData = {
                                    id: Date.now().toString(),
                                    fileName: `drippay-invoice-${enhancedInvoiceNumber}-${formData.receiverName || 'recipient'}.pdf`,
                                    amount: formData.amount || '0.00',
                                    status: 'uploaded',
                                    type: 'generated'
                                };
                                onInvoicesChange([newInvoice]);
                                onGeneratedPDFsChange([blob]);
                                onSelectedPDFChange(newInvoice.id);
                                if (onUploadInvoice) {
                                    onUploadInvoice(newInvoice);
                                }
                            } catch (error) {
                                console.error('Error generating PDF:', error);
                            }
                        }}
                        className="flex-1 h-8 sm:h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 text-xs sm:text-sm font-semibold transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Generate PDF
                    </Button>

                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex-1">
                        <Button
                            variant="outline"
                            className="w-full h-8 sm:h-10 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-300 text-xs sm:text-sm font-semibold transform hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => {
                                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                                if (fileInput) {
                                    fileInput.click();
                                }
                            }}
                        >
                            Upload PDF
                        </Button>
                    </label>
                </div>

                {/* Smooth Drag Area */}
                <div
                    className={`
                        border-2 border-dashed rounded-xl p-2.5 sm:p-3 text-center transition-all duration-300 cursor-pointer hover:bg-gray-50/50
                        ${dragActive ? 'border-blue-400 bg-blue-50/80 scale-[1.02]' : 'border-gray-300 hover:border-blue-300'}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => {
                        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                        if (fileInput) {
                            fileInput.click();
                        }
                    }}
                >
                    <Upload className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 transition-all duration-300 ${dragActive ? 'text-blue-500 scale-110' : 'text-gray-400'}`} />
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                        {dragActive ? 'Drop PDF here' : 'Drag & drop or click to upload'}
                    </p>
                </div>
            </div>

            {/* Smooth File Display */}
            {invoices.length > 0 && (
                <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-md border border-gray-200/40 rounded-xl p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-sm sm:text-base font-semibold text-gray-800">Selected File</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeInvoice}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1 h-6 sm:h-7 rounded-lg transition-all duration-200"
                        >
                            Remove
                        </Button>
                    </div>

                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-sm ${selectedPDFId === invoice.id
                                ? 'bg-blue-100/80 border-blue-300 shadow-sm'
                                : 'bg-white/80 border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => onSelectedPDFChange(invoice.id)}
                        >
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shadow-sm ${invoice.type === 'generated' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'
                                }`}>
                                {invoice.type === 'generated' ? (
                                    <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                ) : (
                                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{invoice.fileName}</p>
                                <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                                    <span className="text-xs sm:text-sm font-medium text-gray-600">${invoice.amount}</span>
                                    <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg font-medium ${invoice.type === 'generated' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {invoice.type === 'generated' ? 'Generated' : 'Uploaded'}
                                    </span>
                                </div>
                            </div>
                            {selectedPDFId === invoice.id && (
                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full shadow-sm animate-pulse"></div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 