'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface AnalyticsContextType {
    logEvent: (eventName: string, params?: Record<string, any>) => void;
    currentPath: string;
    previousPath: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const supabase = createClient();

    // Use Refs for synchronous updates during render phase
    // This ensures 'previous_screen' is correct even in child useEffects running immediately after mount
    const historyRef = useRef<string[]>([pathname]);
    const startTimeRef = useRef<number>(Date.now());

    // Navigation Detection (Render Phase)
    // In Strict Mode, render runs twice, so we need to guard against duplicate pushes
    // We only push if the NEW path is different from the LAST path
    if (historyRef.current[historyRef.current.length - 1] !== pathname) {
        historyRef.current.push(pathname);
        startTimeRef.current = Date.now();
    }

    const logEvent = async (eventName: string, params: Record<string, any> = {}) => {
        // Fire and Forget
        (async () => {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                // User ID는 있으면 넣고, 없으면 null (익명 로그)
                const userId = user ? user.id : null;

                if (authError) {
                    // console.warn("Auth check failed, proceeding as anonymous");
                }

                const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

                // Get previous path from history (2nd to last item)
                const previousPath = historyRef.current.length > 1
                    ? historyRef.current[historyRef.current.length - 2]
                    : '';

                const finalParams = {
                    ...params,
                    current_screen: pathname, // Always use fresh pathname
                    previous_screen: previousPath,
                    stay_duration: duration
                };

                console.log("[Analytics] Inserting:", eventName, finalParams);

                const { error: insertError } = await supabase.from("app_event_logs").insert({
                    user_id: userId,
                    event_name: eventName,
                    event_params: finalParams,
                });

                if (insertError) {
                    console.error("Failed to insert event log:", insertError.message);
                }
            } catch (err) {
                console.error("Unexpected error in Analytics logEvent:", err);
            }
        })();
    };

    // Derived state for context consumers (optional, if they need it)
    const currentPath = pathname;
    const previousPath = historyRef.current.length > 1
        ? historyRef.current[historyRef.current.length - 2]
        : '';

    return (
        <AnalyticsContext.Provider value={{ logEvent, currentPath, previousPath }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

export function useAnalytics() {
    const context = useContext(AnalyticsContext);
    if (context === undefined) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
}
