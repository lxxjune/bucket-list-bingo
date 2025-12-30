'use client';

import React, { useState, useRef } from 'react';
import { BingoBoard } from '@/components/BingoBoard';
import { CategoryButtons } from '@/components/CategoryButtons';
import { ActionButtons } from '@/components/ActionButtons';
import { CategoryName } from '@/constants/bingoData';

export default function Home() {
  const [bingoData, setBingoData] = useState<string[]>(Array(25).fill(''));
  const captureRef = useRef<HTMLDivElement>(null);

  const handleCellChange = (index: number, value: string) => {
    const newData = [...bingoData];
    newData[index] = value;
    setBingoData(newData);
  };

  const handleCategorySelect = (category: CategoryName, items: string[]) => {
    // Overwrite the entire board with selected category items
    setBingoData(items);
  };

  return (
    <main className="min-h-screen py-8 px-4 flex flex-col items-center md:max-w-2xl lg:max-w-3xl mx-auto transition-all duration-300">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-black text-indigo-900 mb-2 tracking-tight">
          2026<br />
          <span className="text-indigo-600">MY BUCKET LIST</span><br />
          BINGO
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          이루고 싶은 목표를 적고 빙고를 완성해보세요!
        </p>
      </header>

      <CategoryButtons onCategorySelect={handleCategorySelect} />

      {/* Capture Area */}
      <div
        ref={captureRef}
        className="w-full bg-white/40 backdrop-blur-sm p-6 md:p-10 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden transition-all duration-300"
        style={{ aspectRatio: '9/16', display: 'flex', flexDirection: 'column' }}
      >
        {/* Decorative Background Elements for Capture */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-pink-50 via-white to-blue-50 opacity-80" />

        <div className="text-center mb-6 mt-4">
          <h2 className="text-2xl md:text-4xl font-extrabold text-indigo-800 tracking-widest">2026 BUCKET LIST</h2>
          <div className="w-16 md:w-24 h-1 bg-indigo-400 mx-auto mt-2 rounded-full" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <BingoBoard
            data={bingoData}
            onChange={handleCellChange}
            className="w-full shadow-none bg-transparent border-none"
          />
        </div>

        <div className="mt-6 mb-4 text-center">
          <p className="text-indigo-900 font-bold text-sm md:text-lg">@2026_bucket_bingo</p>
          <p className="text-gray-400 text-[10px] md:text-sm mt-1">bucket-list-bingo.vercel.app</p>
        </div>
      </div>

      <ActionButtons targetRef={captureRef} />

      <footer className="text-center text-gray-400 text-xs pb-8">
        © 2025 Bucket List Bingo. All rights reserved.
      </footer>
    </main>
  );
}
