/**
 * Web3 Utilities for FlowScheduler Contract Integration
 * Provides helper functions for interacting with the FlowScheduler contract
 */

import { ethers } from 'ethers';
import { FLOW_SCHEDULER_DEPLOYMENT, FLOW_SCHEDULER_DEPLOYMENT_BASE_SEPOLIA, FLOW_SCHEDULER_ABI } from './contract-info';

/**
 * Get FlowScheduler contract instance
 * @param providerOrSigner - Web3 provider or signer
 * @param chainId - Chain ID to determine which deployment to use
 * @returns FlowScheduler contract instance
 */
export function getFlowSchedulerContract(providerOrSigner: ethers.providers.Provider | ethers.Signer, chainId?: number) {
    const deployment = chainId === 84532 ? FLOW_SCHEDULER_DEPLOYMENT_BASE_SEPOLIA : FLOW_SCHEDULER_DEPLOYMENT;
    return new ethers.Contract(
        deployment.addresses.flowScheduler,
        FLOW_SCHEDULER_ABI,
        providerOrSigner
    );
}

/**
 * Check if user is connected to the correct network
 * @param provider - Web3 provider
 * @param chainId - Chain ID to check against (defaults to Base Sepolia)
 * @returns True if on the specified network
 */
export async function isCorrectNetwork(provider: ethers.providers.Provider, chainId: number = 84532) {
    try {
        const network = await provider.getNetwork();
        return network.chainId === chainId;
    } catch (error) {
        console.error('Error checking network:', error);
        return false;
    }
}

/**
 * Switch to Base Sepolia network (for MetaMask)
 * @param ethereum - Window ethereum object
 * @returns Success status
 */
export async function switchToBaseSepolia(ethereum: any) {
    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${FLOW_SCHEDULER_DEPLOYMENT_BASE_SEPOLIA.chainId.toString(16)}` }],
        });
        return true;
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if ((switchError as any).code === 4902) {
            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${FLOW_SCHEDULER_DEPLOYMENT_BASE_SEPOLIA.chainId.toString(16)}`,
                        chainName: 'Base Sepolia',
                        nativeCurrency: {
                            name: 'Ethereum',
                            symbol: 'ETH',
                            decimals: 18,
                        },
                        rpcUrls: ['https://sepolia.base.org'],
                        blockExplorerUrls: ['https://sepolia.basescan.org/'],
                    }],
                });
                return true;
            } catch (addError) {
                console.error('Error adding Base Sepolia network:', addError);
                return false;
            }
        }
        console.error('Error switching to Base Sepolia:', switchError);
        return false;
    }
}

/**
 * Calculate flow rate from amount per time unit
 * @param amount - Amount per time unit
 * @param timeUnit - Time unit in seconds (3600 for hour, 86400 for day, etc.)
 * @param decimals - Token decimals (18 for most tokens)
 * @returns Flow rate as string
 */
export function calculateFlowRate(amount: string | number, timeUnit: number, decimals = 18) {
    const amountBN = ethers.utils.parseUnits(amount.toString(), decimals);
    const flowRate = amountBN.div(timeUnit);
    return flowRate.toString();
}

/**
 * Calculate flow rate based on total amount and time period between start and end dates
 * @param totalAmount - Total amount to be streamed
 * @param startDate - Start date (Unix timestamp)
 * @param endDate - End date (Unix timestamp)
 * @param decimals - Token decimals (18 for most tokens)
 * @returns Flow rate as string
 */
export function calculateFlowRateFromPeriod(
    totalAmount: string | number,
    startDate: number,
    endDate: number,
    decimals = 18
) {
    if (startDate >= endDate) {
        throw new Error('Start date must be before end date');
    }

    const totalAmountBN = ethers.utils.parseUnits(totalAmount.toString(), decimals);
    const timePeriod = endDate - startDate;

    if (timePeriod <= 0) {
        throw new Error('Invalid time period: end date must be after start date');
    }

    const flowRate = totalAmountBN.div(timePeriod);
    return flowRate.toString();
}

/**
 * Convert flow rate to human readable format
 * @param flowRate - Flow rate as string
 * @param timeUnit - Time unit in seconds
 * @param decimals - Token decimals
 * @returns Human readable flow rate
 */
export function formatFlowRate(flowRate: string, timeUnit = 86400, decimals = 18) {
    const flowRateBN = ethers.BigNumber.from(flowRate);
    const amountPerTimeUnit = flowRateBN.mul(timeUnit);
    return ethers.utils.formatUnits(amountPerTimeUnit, decimals);
}

/**
 * Calculate total amount from flow rate and time period
 * @param flowRate - Flow rate as string
 * @param startDate - Start date (Unix timestamp)
 * @param endDate - End date (Unix timestamp)
 * @param decimals - Token decimals (18 for most tokens)
 * @returns Total amount as string
 */
export function calculateTotalAmountFromFlowRate(
    flowRate: string,
    startDate: number,
    endDate: number,
    decimals = 18
) {
    if (startDate >= endDate) {
        throw new Error('Start date must be before end date');
    }

    const flowRateBN = ethers.BigNumber.from(flowRate);
    const timePeriod = endDate - startDate;

    if (timePeriod <= 0) {
        throw new Error('Invalid time period: end date must be after start date');
    }

    const totalAmount = flowRateBN.mul(timePeriod);
    return ethers.utils.formatUnits(totalAmount, decimals);
}

// Gas limit utilities
export type FlowOp = 'createFlowSchedule' | 'deleteFlowSchedule' | 'executeCreateFlow' | 'executeDeleteFlow';

export const GAS_LIMITS: Record<FlowOp, { min: ethers.BigNumber; recommended: ethers.BigNumber; max: ethers.BigNumber }> = {
    createFlowSchedule: {
        min: ethers.BigNumber.from(200000),
        recommended: ethers.BigNumber.from(400000),
        max: ethers.BigNumber.from(1200000),
    },
    deleteFlowSchedule: {
        min: ethers.BigNumber.from(120000),
        recommended: ethers.BigNumber.from(250000),
        max: ethers.BigNumber.from(800000),
    },
    executeCreateFlow: {
        min: ethers.BigNumber.from(400000),
        recommended: ethers.BigNumber.from(800000),
        max: ethers.BigNumber.from(1800000),
    },
    executeDeleteFlow: {
        min: ethers.BigNumber.from(200000),
        recommended: ethers.BigNumber.from(500000),
        max: ethers.BigNumber.from(1400000),
    },
};

export function getGasLimitsForOp(op: FlowOp) {
    return GAS_LIMITS[op];
}

export function validateGasLimitForOp(op: FlowOp, gasLimit: ethers.BigNumberish) {
    const limits = getGasLimitsForOp(op);
    const gas = ethers.BigNumber.from(gasLimit);
    if (gas.lt(limits.min)) {
        console.warn(`Gas limit below minimum for ${op}. Using min ${limits.min.toString()}.`);
        return limits.min;
    }
    if (gas.gt(limits.max)) {
        console.warn(`Gas limit above maximum for ${op}. Using max ${limits.max.toString()}.`);
        return limits.max;
    }
    return gas;
}

/**
 * Generate schedule ID (keccak256 hash of superToken, sender, receiver)
 * @param superToken - SuperToken address
 * @param sender - Sender address
 * @param receiver - Receiver address
 * @returns Schedule ID
 */
export function generateScheduleId(superToken: string, sender: string, receiver: string) {
    return ethers.utils.keccak256(
        ethers.utils.solidityPack(
            ['address', 'address', 'address'],
            [superToken, sender, receiver]
        )
    );
}

/**
 * Convert timestamp to Unix timestamp
 * @param date - Date to convert
 * @returns Unix timestamp
 */
export function toUnixTimestamp(date: Date | string | number) {
    if (date instanceof Date) {
        return Math.floor(date.getTime() / 1000);
    }
    if (typeof date === 'string') {
        return Math.floor(new Date(date).getTime() / 1000);
    }
    return Math.floor(date / 1000);
}

/**
 * Convert Unix timestamp to Date
 * @param timestamp - Unix timestamp
 * @returns JavaScript Date object
 */
export function fromUnixTimestamp(timestamp: number) {
    return new Date(timestamp * 1000);
}

/**
 * Validate flow schedule parameters
 * @param params - Schedule parameters
 * @returns Validation result with isValid boolean and errors array
 */
export function validateScheduleParams(params: any) {
    const errors = [];
    const {
        superToken,
        receiver,
        startDate,
        startMaxDelay,
        flowRate,
        startAmount,
        endDate
    } = params;

    // Validate addresses
    if (!ethers.utils.isAddress(superToken)) {
        errors.push('Invalid SuperToken address');
    }
    if (!ethers.utils.isAddress(receiver)) {
        errors.push('Invalid receiver address');
    }

    // Validate timestamps
    const now = Math.floor(Date.now() / 1000);

    if (startDate && startDate <= now) {
        errors.push('Start date must be in the future');
    }

    if (endDate && endDate <= now) {
        errors.push('End date must be in the future');
    }

    if (startDate && endDate && startDate >= endDate) {
        errors.push('End date must be after start date');
    }

    // Validate flow rate
    if (startDate && !flowRate) {
        errors.push('Flow rate is required when start date is specified');
    }

    if (flowRate && ethers.BigNumber.from(flowRate).lte(0)) {
        errors.push('Flow rate must be positive');
    }

    // Validate start amount
    if (startAmount && ethers.BigNumber.from(startAmount).lt(0)) {
        errors.push('Start amount cannot be negative');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Parse contract error messages
 * @param error - Contract error
 * @returns Human readable error message
 */
export function parseContractError(error: any) {
    const errorMessages = {
        'TimeWindowInvalid': 'Invalid time window for the schedule',
        'AccountInvalid': 'Invalid account address provided',
        'ZeroAddress': 'Address cannot be zero',
        'HostInvalid': 'Invalid Superfluid host',
        'ScheduleInvalid': 'Invalid schedule parameters',
        'UserDataInvalid': 'Invalid user data provided'
    };

    const errorString = error.toString();

    for (const [errorName, message] of Object.entries(errorMessages)) {
        if (errorString.includes(errorName)) {
            return message;
        }
    }

    // Check for common Web3 errors
    if (errorString.includes('insufficient funds')) {
        return 'Insufficient funds for transaction';
    }
    if (errorString.includes('user rejected')) {
        return 'Transaction rejected by user';
    }
    if (errorString.includes('execution reverted')) {
        return 'Transaction failed - check parameters and try again';
    }

    return 'An unexpected error occurred';
}

/**
 * Wait for transaction confirmation
 * @param tx - Transaction response
 * @param confirmations - Number of confirmations to wait for
 * @returns Transaction receipt
 */
export async function waitForTransaction(tx: any, confirmations = 1) {
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for ${confirmations} confirmation(s)...`);

    const receipt = await tx.wait(confirmations);
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    return receipt;
}

/**
 * Get transaction status and details
 * @param txHash - Transaction hash
 * @param provider - Web3 provider
 * @returns Transaction details
 */
export async function getTransactionStatus(txHash: string, provider: ethers.providers.Provider) {
    try {
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);

        return {
            hash: txHash,
            status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
            blockNumber: receipt?.blockNumber,
            gasUsed: receipt?.gasUsed?.toString(),
            explorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`
        };
    } catch (error) {
        return {
            hash: txHash,
            status: 'error',
            error: (error as any).message
        };
    }
}

/**
 * Estimate gas for contract function call
 * @param contract - Contract instance
 * @param functionName - Function name
 * @param params - Function parameters
 * @returns Estimated gas
 */
export async function estimateGas(contract: ethers.Contract, functionName: string, params: any[], options?: { bufferPercent?: number }) {
    try {
        const gasEstimate = await contract.estimateGas[functionName](...params);
        const defaultBuffer = functionName === 'executeCreateFlow' ? 50 : 20;
        const bufferPercent = options?.bufferPercent ?? defaultBuffer;
        return gasEstimate.mul(100 + bufferPercent).div(100);
    } catch (error) {
        console.error('Gas estimation failed:', error);
        throw error;
    }
}

