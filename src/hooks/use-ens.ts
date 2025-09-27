'use client';

import { useState, useEffect, useMemo } from 'react';
import { useEnsAddress } from 'wagmi';
import { normalize } from 'viem/ens';
import { isAddress } from 'ethers/lib/utils';

interface UseEnsProps {
    input: string;
    enabled?: boolean;
}

interface UseEnsReturn {
    resolvedAddress: string | null;
    isValidEns: boolean;
    isValidAddress: boolean;
    isLoading: boolean;
    error: string | null;
    isEnsName: boolean;
    normalizedInput: string;
    ensName: string | null; // The original ENS name for display
}

export const useEns = ({ input, enabled = true }: UseEnsProps): UseEnsReturn => {
    const [normalizedInput, setNormalizedInput] = useState<string>('');
    const [isValidEns, setIsValidEns] = useState<boolean>(false);
    const [ensError, setEnsError] = useState<string | null>(null);

    // Check if input looks like an ENS name
    const isEnsName = useMemo(() => {
        if (!input) return false;
        return input.includes('.') && !isAddress(input);
    }, [input]);

    // Normalize ENS name
    useEffect(() => {
        if (!input || !enabled) {
            setNormalizedInput('');
            setIsValidEns(false);
            setEnsError(null);
            return;
        }

        if (isEnsName) {
            try {
                const normalized = normalize(input);
                setNormalizedInput(normalized);
                setIsValidEns(true);
                setEnsError(null);
            } catch (error) {
                setNormalizedInput('');
                setIsValidEns(false);
                setEnsError('Invalid ENS name format');
            }
        } else {
            setNormalizedInput(input);
            setIsValidEns(false);
            setEnsError(null);
        }
    }, [input, isEnsName, enabled]);

    // Use wagmi hook to resolve ENS to address
    const {
        data: ensAddress,
        isLoading: ensLoading,
        error: wagmiError
    } = useEnsAddress({
        name: normalizedInput,
        chainId: 1, // Ethereum mainnet for ENS
        query: {
            enabled: enabled && isValidEns && !!normalizedInput,
        },
    });

    // Determine final resolved address
    const resolvedAddress = useMemo(() => {
        if (isEnsName && ensAddress) {
            return ensAddress;
        }
        if (!isEnsName && isAddress(input)) {
            return input;
        }
        return null;
    }, [isEnsName, ensAddress, input]);

    // Check if current input is a valid address
    const isValidAddress = useMemo(() => {
        return isAddress(input);
    }, [input]);

    // Determine loading state
    const isLoading = useMemo(() => {
        return enabled && isValidEns && ensLoading;
    }, [enabled, isValidEns, ensLoading]);

    // Determine error state
    const error = useMemo(() => {
        if (ensError) return ensError;
        if (wagmiError) return 'Failed to resolve ENS name';
        if (input && !isEnsName && !isValidAddress) {
            return 'Please enter a valid wallet address or ENS name';
        }
        if (isValidEns && !ensLoading && !ensAddress) {
            return 'ENS name not found or does not resolve to an address';
        }
        return null;
    }, [ensError, wagmiError, input, isEnsName, isValidAddress, isValidEns, ensLoading, ensAddress]);

    // Get the ENS name for display (use normalized input if it's a valid ENS)
    const ensName = useMemo(() => {
        return isValidEns ? normalizedInput : null;
    }, [isValidEns, normalizedInput]);

    return {
        resolvedAddress,
        isValidEns,
        isValidAddress,
        isLoading,
        error,
        isEnsName,
        normalizedInput,
        ensName,
    };
};
