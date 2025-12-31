'use client';

import React from 'react';
import { Eraser, Trash2, Pen, Highlighter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawingToolbarProps {
    strokeColor: string;
    setStrokeColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    isEraser: boolean;
    setIsEraser: (isEraser: boolean) => void;
    isHighlighter: boolean;
    setIsHighlighter: (isHighlighter: boolean) => void;
    onClear: () => void;
}

const COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#A855F7' },
];

export const DrawingToolbar = ({
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    isEraser,
    isHighlighter,
}: Omit<DrawingToolbarProps, 'setIsEraser' | 'setIsHighlighter' | 'onClear'>) => {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
            <div className="flex flex-col gap-6">
                {/* Colors Row */}
                {!isEraser && (
                    <div className="flex items-center justify-between gap-2">
                        {COLORS.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => setStrokeColor(color.value)}
                                className={cn(
                                    "w-8 h-8 rounded-full transition-all flex-shrink-0 relative",
                                    strokeColor === color.value ? "scale-125 ring-2 ring-offset-2 ring-gray-200" : "hover:scale-110"
                                )}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            >
                                {strokeColor === color.value && (
                                    <div className="absolute inset-0 rounded-full border border-black/10" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Width Slider */}
                <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-sm border border-gray-100">
                    <span className="text-xs text-gray-500 font-medium w-8 text-center">두께</span>
                    <input
                        type="range"
                        min="1"
                        max={isHighlighter ? "40" : "20"}
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-xs text-gray-500 w-6 text-center">{strokeWidth}</span>
                </div>
            </div>
        </div>
    );
};
