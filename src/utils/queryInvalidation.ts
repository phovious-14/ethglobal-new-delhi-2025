import { QueryClient } from '@tanstack/react-query';

/**
 * Utility functions for invalidating queries across the application
 * These ensure that when payroll actions are taken, all related data is refreshed
 */

/**
 * Invalidate all payroll-related queries
 * This includes stream records, instant records, and balances
 */
export const invalidatePayrollQueries = (queryClient: QueryClient) => {
    // Invalidate all stream records queries
    queryClient.invalidateQueries({
        queryKey: ['stream-records']
    });

    // Invalidate all instant records queries
    queryClient.invalidateQueries({
        queryKey: ['instant-records']
    });

    // Invalidate balance queries
    queryClient.invalidateQueries({
        queryKey: ['balances']
    });
};

/**
 * Invalidate stream-specific queries
 */
export const invalidateStreamQueries = (queryClient: QueryClient) => {
    queryClient.invalidateQueries({
        queryKey: ['stream-records']
    });

    queryClient.invalidateQueries({
        queryKey: ['balances']
    });
};

/**
 * Invalidate instant-specific queries
 */
export const invalidateInstantQueries = (queryClient: QueryClient) => {
    queryClient.invalidateQueries({
        queryKey: ['instant-records']
    });

    queryClient.invalidateQueries({
        queryKey: ['balances']
    });
};

/**
 * Invalidate balance queries
 */
export const invalidateBalanceQueries = (queryClient: QueryClient) => {
    queryClient.invalidateQueries({
        queryKey: ['balances']
    });
};

/**
 * Invalidate user-related queries
 */
export const invalidateUserQueries = (queryClient: QueryClient) => {
    queryClient.invalidateQueries({
        queryKey: ['user']
    });

    queryClient.invalidateQueries({
        queryKey: ['recipients']
    });
}; 