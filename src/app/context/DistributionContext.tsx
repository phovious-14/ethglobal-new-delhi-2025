'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DistributionContextType {
    isInstantDistribution: boolean;
    setIsInstantDistribution: (isInstant: boolean) => void;
    isSenderMode: boolean;
    setIsSenderMode: (isSender: boolean) => void;
}

const DistributionContext = createContext<DistributionContextType | undefined>(undefined);

interface DistributionProviderProps {
    children: ReactNode;
}

export const DistributionProvider = ({ children }: DistributionProviderProps) => {
    const [isInstantDistribution, setIsInstantDistribution] = useState(false);
    const [isSenderMode, setIsSenderMode] = useState(true); // Default to sender mode

    const value = React.useMemo(() => ({
        isInstantDistribution,
        setIsInstantDistribution,
        isSenderMode,
        setIsSenderMode
    }), [isInstantDistribution, isSenderMode]);

    return (
        <DistributionContext.Provider value={value}>
            {children}
        </DistributionContext.Provider>
    );
};

export const useDistribution = () => {
    const context = useContext(DistributionContext);
    if (context === undefined) {
        // Return a default value instead of throwing an error during SSR
        return {
            isInstantDistribution: false,
            setIsInstantDistribution: () => { },
            isSenderMode: true,
            setIsSenderMode: () => { }
        };
    }
    return context;
}; 