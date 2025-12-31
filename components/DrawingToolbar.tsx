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
    setIsEraser,
    isHighlighter,
    setIsHighlighter,
    onClear,
}: DrawingToolbarProps) => {
    return (
        <div className="flex flex-col gap-4 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 w-full max-w-md mx-auto mt-4 animate-in slide-in-from-bottom-5">

            {/* Tools Row */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setIsEraser(false);
                            setIsHighlighter(false);
                        }}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            !isEraser && !isHighlighter ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100 text-gray-500"
                        )}
                        title="기본 펜"
                    >
                        <Pen size={20} />
                    </button>
                    <button
                        onClick={() => {
                            setIsEraser(false);
                            setIsHighlighter(true);
                        }}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            !isEraser && isHighlighter ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100 text-gray-500"
                        )}
                        title="형광펜"
                    >
                        <Highlighter size={20} />
                    </button>
                    <button
                        onClick={() => setIsEraser(true)}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            isEraser ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100 text-gray-500"
                        )}
                        title="지우개"
                    >
                        <Eraser size={20} />
                    </button>
                </div>

                <div className="h-6 w-px bg-gray-200" />

                <button
                    onClick={onClear}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="전체 지우기"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Colors Row */}
            {!isEraser && (
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {COLORS.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => setStrokeColor(color.value)}
                            className={cn(
                                "w-8 h-8 rounded-full border-2 transition-all flex-shrink-0",
                                strokeColor === color.value ? "border-gray-400 scale-110" : "border-transparent hover:scale-105"
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
            )}

            {/* Width Slider */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium w-8">두께</span>
                <input
                    type="range"
                    min="1"
                    max={isHighlighter ? "30" : "20"}
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-xs text-gray-500 w-6 text-right">{strokeWidth}</span>
            </div>
        </div>
    );
};
