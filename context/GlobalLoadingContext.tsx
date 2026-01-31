'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalLoadingContextType {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <GlobalLoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
        </GlobalLoadingContext.Provider>
    );
}

export function useGlobalLoading() {
    const context = useContext(GlobalLoadingContext);
    if (context === undefined) {
        throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
    }
    return context;
}
