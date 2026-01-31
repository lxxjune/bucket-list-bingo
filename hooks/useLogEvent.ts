"use client";

import { useAnalytics } from "@/context/AnalyticsContext";

export function useLogEvent() {
    const { logEvent } = useAnalytics();
    return { logEvent };
}
