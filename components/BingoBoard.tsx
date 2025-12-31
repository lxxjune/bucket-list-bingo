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
                            className="aspect-square relative group flex items-center justify-center cursor-text bg-white border-[0.5px] border-gray-300 hover:border-black focus-within:border-black transition-all"
                            onClick={(e) => {
                                const textarea = e.currentTarget.querySelector('textarea');
                                textarea?.focus();
                            }}
                        >
                            <textarea
                                value={text}
                                onChange={(e) => handleChange(index, e.target.value)}
                                rows={1}
                                className="w-full bg-transparent p-1 text-center text-sm md:text-base font-medium resize-none outline-none overflow-hidden text-gray-900 placeholder:text-gray-300"
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
