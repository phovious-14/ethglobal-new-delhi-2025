/**
 * React hooks for FlowScheduler contract interactions
 * Provides easy-to-use hooks for frontend integration
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { useSigner } from '@/src/hooks/use-signer';
import { env } from '@/src/env.mjs';
import {
    getFlowSchedulerContract,
    isCorrectNetwork,
    calculateFlowRate,
    calculateFlowRateFromPeriod,
    formatFlowRate,
    generateScheduleId,
    validateScheduleParams,
    parseContractError,
    waitForTransaction,
    estimateGas,
    getGasLimitsForOp,
    validateGasLimitForOp
} from '../utils/web3-utils';

/**
 * Main hook for FlowScheduler contract interactions
 * @param provider - Web3 provider
 * @param account - Connected wallet address
 * @returns FlowScheduler contract methods and state
 */
export function useFlowScheduler() {
    const { wallets } = useWallets();
    const { signer } = useSigner(wallets);
    const provider = signer?.provider as ethers.providers.Provider | undefined;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCorrectNet, setIsCorrectNet] = useState<boolean>(false);

    // Check network on mount and provider change
    useEffect(() => {
        if (provider) {
            isCorrectNetwork(provider, 84532).then(setIsCorrectNet); // Base Sepolia
        }
    }, [provider]);

    // Get contract instance with signer
    const contract = useMemo(() => {
        if (!signer || !isCorrectNet) return null;
        return getFlowSchedulerContract(signer, 84532); // Base Sepolia
    }, [signer, isCorrectNet]);

    // Switch to correct network
    const switchNetwork = useCallback(async () => {
        if (!window.ethereum) {
            setError('MetaMask not detected');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const chainHex = `0x${Number(84532).toString(16)}`; // Base Sepolia
            try {
                await (window.ethereum as any).request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: chainHex }],
                });
                setIsCorrectNet(true);
                return true;
            } catch (switchError: any) {
                if (switchError?.code === 4902) {
                    try {
                        await (window.ethereum as any).request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: chainHex,
                                chainName: 'Base Sepolia',
                                nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
                                rpcUrls: ['https://sepolia.base.org'],
                                blockExplorerUrls: ['https://sepolia.basescan.org/'],
                            }],
                        });
                        setIsCorrectNet(true);
                        return true;
                    } catch (addError) {
                        console.error('Error adding Base Sepolia network:', addError);
                        return false;
                    }
                }
                console.error('Error switching to Base Sepolia:', switchError);
                return false;
            }
        } catch (err) {
            setError(parseContractError(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create flow schedule
    interface CreateFlowScheduleParams {
        superToken: string;
        receiver: string;
        startDate: number;
        startMaxDelay?: number;
        flowRate: string;
        startAmount?: string | number;
        endDate?: number;
        userData?: string;
        ctx?: string;
    }

    const createFlowSchedule = useCallback(async (params: CreateFlowScheduleParams) => {
        if (!contract) {
            throw new Error('Contract not available');
        }

        const {
            superToken,
            receiver,
            startDate,
            startMaxDelay = 0,
            flowRate,
            startAmount = 0,
            endDate = 0,
            userData = '0x',
            ctx = '0x'
        } = params;

        setIsLoading(true);
        setError(null);

        try {
            // Validate parameters
            const validation = validateScheduleParams(params);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Estimate gas
            const gasLimit = await estimateGas(contract, 'createFlowSchedule', [
                superToken,
                receiver,
                startDate,
                startMaxDelay,
                flowRate,
                startAmount,
                endDate,
                userData,
                ctx
            ]);

            // Send transaction
            const tx = await contract.createFlowSchedule(
                superToken,
                receiver,
                startDate,
                startMaxDelay,
                flowRate,
                startAmount,
                endDate,
                userData,
                ctx,
                { gasLimit }
            );

            const receipt = await waitForTransaction(tx);
            console.log('receipt', receipt);
            console.log('tx', tx);
            const txHash = await tx.wait();
            console.log('txHash', txHash);
            return { tx, receipt };
        } catch (err) {
            const errorMessage = parseContractError(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    // Delete flow schedule
    const deleteFlowSchedule = useCallback(async (superToken: string, receiver: string, ctx: string = '0x') => {
        if (!contract) {
            throw new Error('Contract not available');
        }

        setIsLoading(true);
        setError(null);

        try {
            const gasLimit = await estimateGas(contract, 'deleteFlowSchedule', [
                superToken,
                receiver,
                ctx
            ]);

            const tx = await contract.deleteFlowSchedule(superToken, receiver, ctx, { gasLimit });
            const receipt = await waitForTransaction(tx);
            return { tx, receipt };
        } catch (err) {
            const errorMessage = parseContractError(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    // Execute create flow
    const executeCreateFlow = useCallback(async (
        superToken: string,
        sender: string,
        receiver: string,
        userData: string = '0x',
        overrides?: { gasLimit?: string | number }
    ) => {
        if (!contract) {
            throw new Error('Contract not available');
        }

        setIsLoading(true);
        setError(null);

        try {
            const limits = getGasLimitsForOp('executeCreateFlow');
            let gasLimit: ethers.BigNumber | undefined;
            try {
                const est = await estimateGas(contract, 'executeCreateFlow', [
                    superToken,
                    sender,
                    receiver,
                    userData
                ], { bufferPercent: 50 });
                gasLimit = est;
            } catch (estErr) {
                console.warn('estimateGas failed (executeCreateFlow). Preflighting with callStatic...', estErr);
                try {
                    await contract.callStatic.executeCreateFlow(superToken, sender, receiver, "0x");
                } catch (preflightErr) {
                    throw new Error(parseContractError(preflightErr));
                }
                gasLimit = limits.recommended;
            }

            if (overrides?.gasLimit !== undefined) {
                gasLimit = validateGasLimitForOp('executeCreateFlow', overrides.gasLimit);
            }

            console.log('superToken', superToken);
            console.log('sender', sender);
            console.log('receiver', receiver);
            console.log('userData', userData);
            console.log('gasLimit', gasLimit?.toString());

            const tx = await contract.executeCreateFlow(superToken, sender, receiver, "0x", gasLimit ? { gasLimit } : {});
            const receipt = await waitForTransaction(tx);
            return { tx, receipt };
        } catch (err) {
            const errorMessage = parseContractError(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    // Execute delete flow
    const executeDeleteFlow = useCallback(async (
        superToken: string,
        sender: string,
        receiver: string,
        userData: string = '0x',
        overrides?: ethers.CallOverrides
    ) => {
        if (!contract) {
            throw new Error('Contract not available');
        }

        setIsLoading(true);
        setError(null);

        try {
            const limits = getGasLimitsForOp('executeDeleteFlow');
            let gasLimit: ethers.BigNumber | undefined;
            try {
                const est = await estimateGas(contract, 'executeDeleteFlow', [
                    superToken,
                    sender,
                    receiver,
                    userData
                ], { bufferPercent: 50 });
                gasLimit = est;
            } catch (estErr) {
                console.warn('estimateGas failed (executeDeleteFlow). Preflighting with callStatic...', estErr);
                try {
                    await contract.callStatic.executeDeleteFlow(superToken, sender, receiver, "0x");
                } catch (preflightErr) {
                    throw new Error(parseContractError(preflightErr));
                }
                gasLimit = limits.recommended;
            }

            if (overrides?.gasLimit !== undefined) {
                gasLimit = validateGasLimitForOp('executeDeleteFlow', overrides.gasLimit as ethers.BigNumberish);
            }

            console.log('superToken', superToken);
            console.log('sender', sender);
            console.log('receiver', receiver);
            console.log('userData', userData);
            console.log('gasLimit', gasLimit?.toString());

            const tx = await contract.executeDeleteFlow(superToken, sender, receiver, "0x", gasLimit ? { gasLimit } : {});
            const receipt = await waitForTransaction(tx);
            return { tx, receipt };
        } catch (err) {
            const errorMessage = parseContractError(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    // Get flow schedule
    interface FlowSchedule {
        startDate: number;
        startMaxDelay: number;
        endDate: number;
        flowRate: string;
        startAmount: string;
        userData: string;
    }

    const getFlowSchedule = useCallback(async (superToken: string, sender: string, receiver: string): Promise<FlowSchedule> => {
        if (!contract) {
            throw new Error('Contract not available');
        }

        console.log('contract', contract);

        try {
            const schedule = await contract.getFlowSchedule(superToken, sender, receiver);
            console.log({
                startDate: schedule[0].toString(),
                startMaxDelay: schedule[1].toString(),
                endDate: schedule[2].toString(),
                flowRate: schedule[3].toString(),
                startAmount: schedule[4].toString(),
                userData: schedule[5].toString()
            });
            return {
                startDate: schedule[0].toString(),
                startMaxDelay: schedule[1].toString(),
                endDate: schedule[2].toString(),
                flowRate: schedule[3].toString(),
                startAmount: schedule[4].toString(),
                userData: schedule[5].toString()
            };
        } catch (err) {
            const errorMessage = parseContractError(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [contract]);

    return {
        // State
        isLoading,
        error,
        isCorrectNet,
        contract,

        // Actions
        switchNetwork,
        createFlowSchedule,
        deleteFlowSchedule,
        executeCreateFlow,
        executeDeleteFlow,
        getFlowSchedule,

        // Utils
        clearError: () => setError(null)
    };
}

/**
 * Hook for watching FlowScheduler contract events
 * @param provider - Web3 provider
 * @param filters - Event filters
 * @returns Event listeners and state
 */
type FlowEvent =
    | { type: 'FlowScheduleCreated'; superToken: string; sender: string; receiver: string; startDate: number; startMaxDelay: number; flowRate: string; endDate: number; startAmount: string; userData: string; blockNumber: number; transactionHash: string; timestamp: number }
    | { type: 'FlowScheduleDeleted'; superToken: string; sender: string; receiver: string; blockNumber: number; transactionHash: string; timestamp: number }
    | { type: 'CreateFlowExecuted'; superToken: string; sender: string; receiver: string; startDate: number; startMaxDelay: number; flowRate: string; startAmount: string; userData: string; blockNumber: number; transactionHash: string; timestamp: number }
    | { type: 'DeleteFlowExecuted'; superToken: string; sender: string; receiver: string; endDate: number; userData: string; blockNumber: number; transactionHash: string; timestamp: number };

export function useFlowSchedulerEvents(provider: ethers.providers.Provider, filters: Partial<Record<keyof FlowEvent, string>> = {}) {
    const [events, setEvents] = useState<FlowEvent[]>([]);
    const [isListening, setIsListening] = useState<boolean>(false);

    const contract = useMemo(() => {
        if (!provider) return null;
        return getFlowSchedulerContract(provider);
    }, [provider]);

    // Start listening to events
    const startListening = useCallback(() => {
        if (!contract || isListening) return;

        setIsListening(true);

        // Listen to FlowScheduleCreated events
        const onFlowScheduleCreated = (superToken: string, sender: string, receiver: string, startDate: any, startMaxDelay: any, flowRate: any, endDate: any, startAmount: any, userData: string, event: any) => {
            const newEvent = {
                type: 'FlowScheduleCreated',
                superToken,
                sender,
                receiver,
                startDate: startDate.toNumber(),
                startMaxDelay: startMaxDelay.toNumber(),
                flowRate: flowRate.toString(),
                endDate: endDate.toNumber(),
                startAmount: startAmount.toString(),
                userData,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: Date.now()
            };

            setEvents((prev) => [newEvent as FlowEvent, ...prev].slice(0, 100)); // Keep last 100 events
        };

        // Listen to FlowScheduleDeleted events
        const onFlowScheduleDeleted = (superToken: string, sender: string, receiver: string, event: any) => {
            const newEvent = {
                type: 'FlowScheduleDeleted',
                superToken,
                sender,
                receiver,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: Date.now()
            };

            setEvents((prev) => [newEvent as FlowEvent, ...prev].slice(0, 100));
        };

        // Listen to CreateFlowExecuted events
        const onCreateFlowExecuted = (superToken: string, sender: string, receiver: string, startDate: any, startMaxDelay: any, flowRate: any, startAmount: any, userData: string, event: any) => {
            const newEvent = {
                type: 'CreateFlowExecuted',
                superToken,
                sender,
                receiver,
                startDate: startDate.toNumber(),
                startMaxDelay: startMaxDelay.toNumber(),
                flowRate: flowRate.toString(),
                startAmount: startAmount.toString(),
                userData,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: Date.now()
            };

            setEvents((prev) => [newEvent as FlowEvent, ...prev].slice(0, 100));
        };

        // Listen to DeleteFlowExecuted events
        const onDeleteFlowExecuted = (superToken: string, sender: string, receiver: string, endDate: any, userData: string, event: any) => {
            const newEvent = {
                type: 'DeleteFlowExecuted',
                superToken,
                sender,
                receiver,
                endDate: endDate.toNumber(),
                userData,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: Date.now()
            };

            setEvents((prev) => [newEvent as FlowEvent, ...prev].slice(0, 100));
        };

        // Set up event listeners
        contract.on('FlowScheduleCreated', onFlowScheduleCreated);
        contract.on('FlowScheduleDeleted', onFlowScheduleDeleted);
        contract.on('CreateFlowExecuted', onCreateFlowExecuted);
        contract.on('DeleteFlowExecuted', onDeleteFlowExecuted);

        return () => {
            contract.removeAllListeners();
            setIsListening(false);
        };
    }, [contract, isListening]);

    // Stop listening to events
    const stopListening = useCallback(() => {
        if (contract && isListening) {
            contract.removeAllListeners();
            setIsListening(false);
        }
    }, [contract, isListening]);

    // Clear events
    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    // Filter events
    const filteredEvents = useMemo(() => {
        if (!filters || Object.keys(filters).length === 0) {
            return events;
        }

        return events.filter(event => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                const evVal = (event as any)[key];
                return String(evVal ?? '').toLowerCase() === String(value).toLowerCase();
            });
        });
    }, [events, filters]);

    return {
        events: filteredEvents,
        isListening,
        startListening,
        stopListening,
        clearEvents
    };
}

/**
 * Hook for flow rate calculations and formatting
 * @returns Flow rate utilities
 */
export function useFlowRateUtils() {
    // Calculate flow rate from amount per time unit
    const calculateRate = useCallback((amount: string | number, timeUnit: number, decimals = 18) => {
        return calculateFlowRate(amount, timeUnit, decimals);
    }, []);

    // Calculate flow rate from total amount and time period
    const calculateRateFromPeriod = useCallback((
        totalAmount: string | number,
        startDate: number,
        endDate: number,
        decimals = 18
    ) => {
        return calculateFlowRateFromPeriod(totalAmount, startDate, endDate, decimals);
    }, []);

    // Format flow rate to human readable
    const formatRate = useCallback((flowRate: string, timeUnit = 86400, decimals = 18) => {
        return formatFlowRate(flowRate, timeUnit, decimals);
    }, []);

    // Common time units
    const timeUnits = useMemo(() => ({
        SECOND: 1,
        MINUTE: 60,
        HOUR: 3600,
        DAY: 86400,
        WEEK: 604800,
        MONTH: 2592000, // 30 days
        YEAR: 31536000 // 365 days
    }), []);

    return {
        calculateRate,
        calculateRateFromPeriod,
        formatRate,
        timeUnits
    };
}

/**
 * Hook for managing flow schedule state
 * @param superToken - SuperToken address
 * @param sender - Sender address
 * @param receiver - Receiver address
 * @returns Schedule state and utilities
 */
export function useFlowScheduleState(superToken: string, sender: string, receiver: string) {
    interface FlowSchedule {
        startDate: number;
        startMaxDelay: number;
        endDate: number;
        flowRate: string;
        startAmount: string;
        userData: string;
    }
    const [schedule, setSchedule] = useState<FlowSchedule | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Generate schedule ID
    const scheduleId = useMemo(() => {
        if (!superToken || !sender || !receiver) return null;
        return generateScheduleId(superToken, sender, receiver);
    }, [superToken, sender, receiver]);

    // Check if schedule exists
    const exists = useMemo(() => {
        return schedule && (
            schedule.startDate > 0 ||
            schedule.endDate > 0 ||
            schedule.flowRate !== '0'
        );
    }, [schedule]);

    // Check if schedule is active
    const isActive = useMemo(() => {
        if (!schedule || !exists) return false;
        const now = Math.floor(Date.now() / 1000);
        return (
            (!schedule.startDate || schedule.startDate <= now) &&
            (!schedule.endDate || schedule.endDate > now)
        );
    }, [schedule, exists]);

    // Check if schedule can be executed (for create flow)
    const canExecuteCreate = useMemo(() => {
        if (!schedule || !exists) return false;
        const now = Math.floor(Date.now() / 1000);
        return (
            schedule.startDate > 0 &&
            schedule.startDate <= now &&
            schedule.startDate + schedule.startMaxDelay >= now
        );
    }, [schedule, exists]);

    // Check if schedule can be executed (for delete flow)
    const canExecuteDelete = useMemo(() => {
        if (!schedule || !exists) return false;
        const now = Math.floor(Date.now() / 1000);
        return (
            schedule.endDate > 0 &&
            schedule.endDate <= now
        );
    }, [schedule, exists]);

    return {
        schedule,
        scheduleId,
        exists,
        isActive,
        canExecuteCreate,
        canExecuteDelete,
        isLoading,
        error,
        setSchedule,
        setIsLoading,
        setError
    };
}

