import { getTokenConfig } from './tokenRegistry';
import { useChain } from '@/src/app/context/ChainContext';

export interface StreamAmountParams {
    amount: string;
    startDate: Date;
    endDate?: Date;
    flowRateUnit?: 'hour' | 'day' | 'week' | 'month';
}

export interface StreamAmountResult {
    totalSent: number;
    totalSentToken: number;
    flowRate: number;
    durationInSeconds: number;
    tokenSymbol: string;
}

/**
 * Calculate the total amount sent in a stream based on flow rate and duration
 * @param params - Stream parameters including amount, start/end dates, and flow rate unit
 * @returns Object containing calculated amounts and metadata
 */
export function calculateStreamAmount(params: StreamAmountParams): StreamAmountResult {
    const { amount, startDate, endDate, flowRateUnit = 'month' } = params;
    const { activeChain } = useChain();
    const tokenConfig = getTokenConfig(activeChain.chainId);
    const decimals = tokenConfig.superToken.decimals;

    // Determine seconds per unit
    const unitSeconds = {
        hour: 60 * 60,
        day: 24 * 60 * 60,
        week: 7 * 24 * 60 * 60,
        month: 30 * 24 * 60 * 60,
    };

    const secondsPerUnit = unitSeconds[flowRateUnit] || unitSeconds['month'];
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const durationInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    // Calculate flow rate in wei/second
    const flowRate = (parseFloat(amount) * Math.pow(10, decimals)) / secondsPerUnit;

    // Calculate total sent in wei
    const totalSent = flowRate * durationInSeconds;

    // Convert to token units
    const totalSentToken = totalSent / Math.pow(10, decimals);

    return {
        totalSent,
        totalSentToken,
        flowRate,
        durationInSeconds,
        tokenSymbol: tokenConfig.superToken.symbol
    };
}

/**
 * Calculate the total amount sent in a stream (simplified version for display)
 * This version uses the amount directly as the flow rate per second
 * @param amount - Flow rate amount
 * @param startDate - Stream start date
 * @param endDate - Stream end date (optional, defaults to current time)
 * @param chainId - Chain ID for token configuration
 * @returns Total amount sent in token units
 */
export function calculateStreamAmountSimple(
    amount: string,
    startDate: Date,
    endDate?: Date,
    chainId?: number
): number {
    // If chainId is not provided, use a default or throw an error
    if (!chainId) {
        // Default to mainnet Scroll (or you could throw an error)
        chainId = 534352;
    }

    const tokenConfig = getTokenConfig(chainId);
    const decimals = tokenConfig.superToken.decimals;

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const durationInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    // For simple calculation, treat amount as flow rate per second
    const totalSent = (parseFloat(amount) * durationInSeconds) / Math.pow(10, decimals);

    return totalSent;
} 