import { StyleSheet } from '@react-pdf/renderer';

// Compact professional PDF styles for invoices and stream visualizations
export const professionalPdfStyles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 20,
        fontFamily: 'Helvetica',
        position: 'relative',
    },
    // Compact header with better spacing
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        borderBottom: '2px solid #1e40af',
        paddingBottom: 15,
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    companyInfo: {
        flex: 1,
        marginLeft: 15,
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 2,
        letterSpacing: -0.3,
    },
    companyDetails: {
        fontSize: 10,
        color: '#6b7280',
        lineHeight: 1.3,
    },
    invoiceInfo: {
        alignItems: 'flex-end',
    },
    invoiceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 5,
        letterSpacing: -0.3,
    },
    invoiceNumber: {
        fontSize: 12,
        color: '#374151',
        marginBottom: 2,
        fontWeight: '600',
    },
    invoiceDate: {
        fontSize: 11,
        color: '#6b7280',
    },
    // Compact content sections
    section: {
        marginBottom: 15,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 6,
        border: '1px solid #e2e8f0',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 10,
        borderBottom: '1px solid #cbd5e1',
        paddingBottom: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        borderBottom: '1px solid #f1f5f9',
    },
    rowLast: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    label: {
        fontSize: 11,
        color: '#64748b',
        flex: 1,
        fontWeight: '500',
    },
    value: {
        fontSize: 11,
        color: '#111827',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    // Compact total amount styling
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669',
        backgroundColor: '#ecfdf5',
        padding: 10,
        borderRadius: 6,
        border: '2px solid #10b981',
        textAlign: 'center',
        marginTop: 15,
    },
    // Compact footer styling
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        textAlign: 'center',
        borderTop: '1px solid #e2e8f0',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 9,
        color: '#94a3b8',
        lineHeight: 1.3,
    },
    // Distribution type styling
    distributionType: {
        fontSize: 10,
        color: '#059669',
        backgroundColor: '#d1fae5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        fontWeight: '600',
    },
    // Amount display styling
    amountDisplay: {
        fontSize: 11,
        color: '#111827',
        fontWeight: '600',
    },
    // Decorative elements
    decorativeLine: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 10,
    },
    // Watermark
    watermark: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: 36,
        color: '#000000',
        opacity: 0.03,
        fontWeight: 'bold',
    },
    // Compact recipient info
    recipientInfo: {
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 6,
        marginBottom: 15,
        border: '1px solid #e2e8f0',
    },
    // Compact payment details
    paymentDetails: {
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 6,
        marginBottom: 15,
        border: '1px solid #e2e8f0',
    },
    // Compact total section
    totalSection: {
        borderTop: '2px solid #1e40af',
        paddingTop: 15,
        marginTop: 15,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 6,
        border: '1px solid #e2e8f0',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e40af',
        letterSpacing: -0.2,
    },
    walletAddress: {
        fontFamily: 'Courier',
        fontSize: 9,
        color: '#64748b',
        backgroundColor: '#f1f5f9',
        padding: '2px 4px',
        borderRadius: 3,
        border: '1px solid #e2e8f0',
    },
    // Additional compact styles
    twoColumnLayout: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    column: {
        flex: 1,
        marginHorizontal: 5,
    },
    statusBadge: {
        fontSize: 10,
        fontWeight: '600',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        textAlign: 'center',
    },
    statusActive: {
        backgroundColor: '#d1fae5',
        color: '#059669',
    },
    statusCompleted: {
        backgroundColor: '#dbeafe',
        color: '#2563eb',
    },
    statusPending: {
        backgroundColor: '#fef3c7',
        color: '#d97706',
    },
}); 