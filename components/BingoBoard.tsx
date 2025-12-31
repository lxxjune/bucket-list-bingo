'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { event } from '@/lib/analytics';

interface BingoBoardProps {
    data: string[];
    onChange: (index: number, value: string) => void;
    className?: string;
    gridSize: 3 | 4 | 5;
}

export const BingoBoard = React.forwardRef<HTMLDivElement, BingoBoardProps>(
    ({ data, onChange, className, gridSize }, ref) => {
        const handleChange = (index: number, value: string) => {
            onChange(index, value);
            if (value.length === 1) {
                event({
                    action: 'bingo_cell_input',
                    category: 'interaction',
                    label: `cell_${index}`,
                });
            }
        };

        const gridCols = {
            3: 'grid-cols-3',
            4: 'grid-cols-4',
            5: 'grid-cols-5',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'w-full aspect-square bg-white border border-gray-400',
                    className
                )}
            >
                <div className={cn("grid w-full h-full", gridCols[gridSize])}>
                    {data.map((text, index) => (
                        <div
                            key={index}
                            className="aspect-square relative group flex items-center justify-center cursor-text bg-white border-[0.5px] border-gray-300 hover:border-black focus-within:border-black transition-all overflow-hidden p-1"
                            onClick={(e) => {
                                const textarea = e.currentTarget.querySelector('textarea');
                                textarea?.focus();
                            }}
                        >
                            <textarea
                                value={text}
                                onChange={(e) => handleChange(index, e.target.value)}
                                rows={1}
                                className={cn(
                                    "w-full bg-transparent text-center font-medium resize-none outline-none text-gray-900 placeholder:text-gray-300 leading-tight max-h-full",
                                    text.length > 12 ? "text-[10px] md:text-xs" :
                                        text.length > 8 ? "text-xs md:text-sm" :
                                            "text-sm md:text-base"
                                )}
                                placeholder=""
                                maxLength={20}
                                style={{ fieldSizing: 'content' } as React.CSSProperties}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

BingoBoard.displayName = 'BingoBoard';
