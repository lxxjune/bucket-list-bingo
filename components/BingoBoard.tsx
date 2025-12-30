'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { event } from '@/lib/analytics';

interface BingoBoardProps {
    data: string[];
    onChange: (index: number, value: string) => void;
    className?: string;
}

export const BingoBoard = React.forwardRef<HTMLDivElement, BingoBoardProps>(
    ({ data, onChange, className }, ref) => {
        const handleChange = (index: number, value: string) => {
            onChange(index, value);
            if (value.length === 1) {
                // Track when user starts typing (length 1) to avoid spamming events
                event({
                    action: 'bingo_cell_input',
                    category: 'interaction',
                    label: `cell_${index}`,
                });
            }
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'grid grid-cols-5 gap-2 p-4 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/60',
                    className
                )}
            >
                {data.map((text, index) => (
                    <div
                        key={index}
                        className="aspect-square relative group flex items-center justify-center cursor-text bg-white/80 rounded-lg border border-indigo-100 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-200 transition-all"
                        onClick={(e) => {
                            const textarea = e.currentTarget.querySelector('textarea');
                            textarea?.focus();
                        }}
                    >
                        <textarea
                            value={text}
                            onChange={(e) => handleChange(index, e.target.value)}
                            rows={1}
                            className="w-full bg-transparent p-1 text-center text-sm md:text-lg lg:text-xl font-medium resize-none outline-none overflow-hidden"
                            placeholder=""
                            maxLength={20}
                            style={{ fieldSizing: 'content' } as React.CSSProperties}
                        />
                    </div>
                ))}
            </div>
        );
    }
);

BingoBoard.displayName = 'BingoBoard';
