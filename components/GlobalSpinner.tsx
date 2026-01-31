'use client';

import { Loader2 } from 'lucide-react';
import { useGlobalLoading } from '@/context/GlobalLoadingContext';

export function GlobalSpinner() {
    const { isLoading } = useGlobalLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div>
    );
}
