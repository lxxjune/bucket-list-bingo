'use client';

import React from 'react';
import { Undo2, Pen, Highlighter, Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

interface DrawingTopBarProps {
    onUndo: () => void;
    onDone: () => void;
    isEraser: boolean;
    setIsEraser: (isEraser: boolean) => void;
    isHighlighter: boolean;
    setIsHighlighter: (isHighlighter: boolean) => void;
}

export const DrawingTopBar = ({
    onUndo,
    onDone,
    isEraser,
    setIsEraser,
    isHighlighter,
    setIsHighlighter,
}: DrawingTopBarProps) => {
    return (
        <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            {/* Left: Undo */}
            <button
                onClick={() => {
                    onUndo();
                    trackEvent('click_undo');
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all font-medium text-sm flex items-center gap-1"
            >
                <Undo2 size={20} />
                <span className="hidden md:inline">Undo</span>
            </button>

            {/* Center: Tools */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl">
                <button
                    onClick={() => {
                        setIsEraser(false);
                        setIsHighlighter(false);
                        trackEvent('select_tool', { tool: 'pen' });
                    }}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        !isEraser && !isHighlighter ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Pen size={20} />
                </button>
                <button
                    onClick={() => {
                        setIsEraser(false);
                        setIsHighlighter(true);
                        trackEvent('select_tool', { tool: 'highlighter' });
                    }}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        !isEraser && isHighlighter ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Highlighter size={20} />
                </button>
                <button
                    onClick={() => {
                        setIsEraser(true);
                        trackEvent('select_tool', { tool: 'eraser' });
                    }}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        isEraser ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Eraser size={20} />
                </button>
            </div>

            {/* Right: Done */}
            <button
                onClick={() => {
                    onDone();
                    trackEvent('click_done');
                }}
                className="px-4 py-1.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all"
            >
                Done
            </button>
        </div>
    );
};
