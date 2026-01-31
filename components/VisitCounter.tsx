'use client';

import { useEffect, useRef } from 'react';
import { incrementBingoCount } from '@/app/actions/analytics';

export function VisitCounter({ periodValue, gridSize }: { periodValue: string, gridSize: number }) {
    const hasVisited = useRef<string>('');

    useEffect(() => {
        const key = `${periodValue}-${gridSize}`;
        if (hasVisited.current === key) return;

        // Increase visit count
        incrementBingoCount(periodValue, `${gridSize}x${gridSize}`, 'visit_count');
        hasVisited.current = key;
    }, [periodValue, gridSize]);

    return null;
}
