'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { useLogEvent } from '@/hooks/useLogEvent';

interface BingoBoardProps {
    data: string[];
    onChange: (index: number, value: string) => void;
    className?: string;
    gridSize: 3 | 4 | 5;
}

export const BingoBoard = React.forwardRef<HTMLDivElement, BingoBoardProps>(
    ({ data, onChange, className, gridSize }, ref) => {
        const { logEvent } = useLogEvent();
        const handleChange = (index: number, value: string) => {
            onChange(index, value);
        };

        const gridCols = {
            3: 'grid-cols-3',
            4: 'grid-cols-4',
            5: 'grid-cols-5',
        };

        const displayData = data.slice(0, gridSize * gridSize);

        const focusStartTimeRef = React.useRef<number>(0);
        const focusValueRef = React.useRef<string>('');

        return (
            <div
                ref={ref}
                className={cn(
                    'w-full aspect-square bg-gray-300 gap-[1px]',
                    className
                )}
            >
                <div className={cn("grid w-full h-full gap-[1px] px-[1px] py-[1px] bg-gray-400", gridCols[gridSize])}>
                    {displayData.map((text, index) => (
                        <div
                            key={index}
                            className="aspect-square relative group flex items-center justify-center cursor-text bg-white hover:bg-gray-50 focus-within:bg-gray-50 transition-all overflow-hidden p-1"
                            onClick={(e) => {
                                const textarea = e.currentTarget.querySelector('textarea');
                                textarea?.focus();
                                logEvent('CLICK_CELL', { index, gridSize });
                            }}
                        >
                            <textarea
                                value={text}
                                onChange={(e) => {
                                    handleChange(index, e.target.value);
                                    // Auto-resize height
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                onFocus={(e) => {
                                    focusStartTimeRef.current = Date.now();
                                    focusValueRef.current = e.target.value;
                                    // Adjust height on focus
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                onBlur={(e) => {
                                    const duration = (Date.now() - focusStartTimeRef.current) / 1000;
                                    const currentValue = e.target.value;
                                    const prevValue = focusValueRef.current;

                                    // 1. Writer's Block: Focus for > 3s with no input
                                    if (duration > 3 && currentValue === prevValue && currentValue.trim().length === 0) {
                                        trackEvent('focus_cell_no_input', {
                                            duration_seconds: Math.round(duration)
                                        });
                                    }

                                    // 2. Writer's Block: Deleting content
                                    if (currentValue.length < prevValue.length) {
                                        trackEvent('delete_cell_content', {
                                            prev_length: prevValue.length,
                                            deleted_chars: prevValue.length - currentValue.length
                                        });
                                    }

                                    const filledCount = data.filter(item => item.trim().length > 0).length;
                                    trackEvent('edit_cell', {
                                        filled_count: filledCount,
                                        grid_size: gridSize,
                                        content_length: currentValue.length,
                                        duration_seconds: Math.round(duration)
                                    });
                                }}
                                rows={1}
                                className={cn(
                                    "w-full bg-transparent text-center font-medium resize-none outline-none text-gray-900 placeholder:text-gray-300 leading-tight overflow-hidden",
                                    text.length > 20 ? "text-[9px]" :
                                        text.length > 12 ? "text-[10px]" :
                                            text.length > 6 ? "text-xs" :
                                                "text-sm"
                                )}
                                placeholder=""
                                maxLength={30}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

BingoBoard.displayName = 'BingoBoard';
