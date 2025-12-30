'use client';

import React from 'react';
import { BINGO_CATEGORIES, CategoryName } from '@/constants/bingoData';
import { event } from '@/lib/analytics';

interface CategoryButtonsProps {
    onCategorySelect: (category: CategoryName, items: string[]) => void;
}

export const CategoryButtons = ({ onCategorySelect }: CategoryButtonsProps) => {
    const handleCategoryClick = (category: CategoryName) => {
        const pool = BINGO_CATEGORIES[category];
        fillBoard(category, pool);
    };

    const handleRandomClick = () => {
        // Aggregate all items from all categories
        const allItems = Object.values(BINGO_CATEGORIES).flat();
        fillBoard('랜덤' as CategoryName, allItems);
    };

    const fillBoard = (category: CategoryName, pool: readonly string[]) => {
        let selectedItems: string[] = [];

        if (pool.length >= 25) {
            selectedItems = [...pool].sort(() => 0.5 - Math.random()).slice(0, 25);
        } else {
            let temp = [...pool];
            temp.sort(() => 0.5 - Math.random());
            while (temp.length < 25) {
                const randomItem = pool[Math.floor(Math.random() * pool.length)];
                temp.push(randomItem);
            }
            selectedItems = temp;
        }

        onCategorySelect(category, selectedItems);

        event({
            action: 'recommendation_click',
            category: 'interaction',
            label: `category_${category}`,
        });
    };

    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 px-2 text-center">
                카테고리별 자동 채우기
            </h3>
            <div className="grid grid-cols-3 gap-3 px-2">

                {(Object.keys(BINGO_CATEGORIES) as CategoryName[]).map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className="py-3 px-2 bg-white/80 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 font-medium rounded-xl shadow-sm border border-gray-100 transition-all active:scale-95 text-sm"
                    >
                        {category}
                    </button>
                ))}
                <button
                    onClick={handleRandomClick}
                    className="col-span-3 py-3 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                    🎲 랜덤으로 채우기
                </button>
            </div>
        </div>
    );
};
