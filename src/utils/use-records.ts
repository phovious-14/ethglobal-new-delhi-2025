import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstant } from "../api/routers/instant";
import { getStream } from "../api/routers/stream";

// Invoice interface
export interface Invoice {
    _id: string;
    invoiceNumber: string;
    documentUrl: string;
    invoiceType: 'instant' | 'stream';
    invoiceStatus: 'paid' | 'pending' | 'failed' | 'processing';
    createdAt: string;
    updatedAt: string;
}

// Instant transaction record interface matching the new API response
export interface TransactionRecord {
    _id: string;
    txHash: string;
    payrollName: string;
    senderWalletAddress: string;
    receiverWalletAddress: string;
    receiverName: string;
    amount: number;
    currency: string;
    chainId: number;
    invoiceId: string;
    createdAt: string;
    invoice: Invoice;
    tokenSymbol: string;
}

// Stream record interface matching the stream API response
export interface StreamRecord {
    _id: string;
    streamStartTxHash: string;
    payrollName: string;
    senderWalletAddress: string;
    receiverWalletAddress: string;
    receiverName: string;
    streamStatus: 'active' | 'inactive' | 'completed' | 'failed';
    streamStartTime: string;
    streamEndTime: string;
    amount: string;
    flowRate: string;
    flowRateUnit: string;
    invoiceId: string;
    invoice: Invoice;
    streamStoppedTxHash?: string;
    tokenSymbol: string;
}

// Hook interface
interface UseRecordsOptions {
    accessToken: string;
    walletAddress: string;
    isInstantDistribution: boolean;
    enabled?: boolean;
    type: 'sender' | 'receiver';
    chainId: string;
}

// Main hook
export const useRecords = ({
    accessToken,
    walletAddress,
    isInstantDistribution,
    enabled = true,
    type,
    chainId
}: UseRecordsOptions) => {
    const queryClient = useQueryClient();

    // Query for stream records
    const {
        data: streamRecords,
        isLoading: isLoadingStreams,
        error: streamError,
        refetch: refetchStreams
    } = useQuery({
        queryKey: ['stream-records', walletAddress, accessToken, type, chainId],
        queryFn: () => getStream(accessToken, walletAddress, type, chainId),
        enabled: enabled && !isInstantDistribution && !!accessToken,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 2,
        retryDelay: 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: false, // Prevent refetch on reconnect
        refetchInterval: false,
    });

    // Query for instant records
    const {
        data: instantRecords,
        isLoading: isLoadingInstants,
        error: instantError,
        refetch: refetchInstants
    } = useQuery({
        queryKey: ['instant-records', walletAddress, accessToken, type, chainId],
        queryFn: () => getInstant(accessToken, walletAddress, type, chainId),
        enabled: enabled && isInstantDistribution && !!accessToken,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 2,
        retryDelay: 1000,
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        refetchOnMount: false, // Prevent refetch on mount if data exists
        refetchOnReconnect: false, // Prevent refetch on reconnect
        refetchInterval: false,
    });

    // Computed values based on toggle state
    const currentRecords = isInstantDistribution ? instantRecords : streamRecords;
    const isLoading = isInstantDistribution ? isLoadingInstants : isLoadingStreams;
    const error = isInstantDistribution ? instantError : streamError;
    const refetch = isInstantDistribution ? refetchInstants : refetchStreams;

    // Helper function to get records by type
    const getRecordsByType = (type: 'stream' | 'instant') => {
        if (type === 'stream') {
            return streamRecords || [];
        } else {
            return instantRecords || [];
        }
    };

    // Helper function to get all records (both types)
    const getAllRecords = () => {
        const streams = streamRecords || [];
        const instants = instantRecords || [];
        return [...streams, ...instants];
    };

    return {
        // Current records based on toggle
        records: currentRecords || [],
        isLoading,
        error,
        refetch: refetch || (() => { }),

        // Type-specific data
        streamRecords: streamRecords || [],
        instantRecords: instantRecords || [],
        isLoadingStreams,
        isLoadingInstants,
        streamError,
        instantError,

        // Helper functions
        getRecordsByType,
        getAllRecords,

        // Toggle state
        isInstantDistribution,

        // Query invalidation helpers
        invalidateStreams: () => queryClient.invalidateQueries({
            queryKey: ['stream-records', walletAddress, accessToken, type, chainId]
        }),
        invalidateInstants: () => queryClient.invalidateQueries({
            queryKey: ['instant-records', walletAddress, accessToken, type, chainId]
        }),
        invalidateAll: () => {
            queryClient.invalidateQueries({
                queryKey: ['stream-records', walletAddress, accessToken, type, chainId]
            });
            queryClient.invalidateQueries({
                queryKey: ['instant-records', walletAddress, accessToken, type, chainId]
            });
        }
    };
};

// Convenience hook for getting records with default options
export const useTransactionRecords = (accessToken: string, isInstantDistribution: boolean, walletAddress: string, type: 'sender' | 'receiver', chainId: string) => {

    return useRecords({
        accessToken,
        isInstantDistribution,
        enabled: !!accessToken,
        walletAddress,
        type,
        chainId,
    });
};
