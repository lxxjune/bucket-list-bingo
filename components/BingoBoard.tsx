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
                        className="aspect-square relative group"
                    >
                        <textarea
                            value={text}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="w-full h-full p-2 text-center text-sm sm:text-base resize-none bg-white/80 rounded-lg border border-indigo-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none transition-all flex items-center justify-center placeholder:text-gray-300 overflow-hidden"
                            placeholder=""
                            maxLength={20}
                        />
                        {/* Center the text vertically using flex behavior on textarea is tricky, 
                so we rely on padding or line-height, or use a flex container if not using textarea.
                Actually, for a simple bingo, textarea is fine. Let's add some style to center it.
            */}
                        <style jsx>{`
              textarea {
                display: flex;
                flex-direction: column;
                justify-content: center;
              }
            `}</style>
                    </div>
                ))}
            </div>
        );
    }
);

BingoBoard.displayName = 'BingoBoard';
