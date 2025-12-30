'use client';

import React, { useState, useRef } from 'react';
import { BingoBoard } from '@/components/BingoBoard';
import { RecommendationChips } from '@/components/RecommendationChips';
import { ActionButtons } from '@/components/ActionButtons';

export default function Home() {
  const [bingoData, setBingoData] = useState<string[]>(Array(25).fill(''));
  const captureRef = useRef<HTMLDivElement>(null);

  const handleCellChange = (index: number, value: string) => {
    const newData = [...bingoData];
    newData[index] = value;
    setBingoData(newData);
  };

  const handleRecommendationSelect = (keyword: string) => {
    // Find first empty cell
    const emptyIndex = bingoData.findIndex((cell) => cell.trim() === '');
    if (emptyIndex !== -1) {
      handleCellChange(emptyIndex, keyword);
    } else {
      alert('빈 칸이 없습니다! 내용을 수정하거나 지워주세요.');
    }
  };

  const handleRandomFill = (keywords: string[]) => {
    // Overwrite all cells with random keywords
    setBingoData(keywords.slice(0, 25));
  };

  return (
    <main className="min-h-screen py-8 px-4 flex flex-col items-center max-w-md mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-black text-indigo-900 mb-2 tracking-tight">
          2026<br />
          <span className="text-indigo-600">MY BUCKET LIST</span><br />
          BINGO
        </h1>
        <p className="text-gray-500 text-sm">
          이루고 싶은 목표를 적고 빙고를 완성해보세요!
        </p>
      </header>

      <RecommendationChips
        onSelect={handleRecommendationSelect}
        onRandomFill={handleRandomFill}
      />

      {/* Capture Area */}
      <div
        ref={captureRef}
        className="w-full bg-white/40 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden"
        style={{ aspectRatio: '9/16', maxHeight: '700px', display: 'flex', flexDirection: 'column' }}
      >
        {/* Decorative Background Elements for Capture */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-pink-50 via-white to-blue-50 opacity-80" />

        <div className="text-center mb-6 mt-4">
          <h2 className="text-2xl font-extrabold text-indigo-800 tracking-widest">2026 BUCKET LIST</h2>
          <div className="w-16 h-1 bg-indigo-400 mx-auto mt-2 rounded-full" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <BingoBoard
            data={bingoData}
            onChange={handleCellChange}
            className="w-full shadow-none bg-transparent border-none"
          />
        </div>

        <div className="mt-6 mb-4 text-center">
          <p className="text-indigo-900 font-bold text-sm">@2026_bucket_bingo</p>
          <p className="text-gray-400 text-[10px] mt-1">bucket-list-bingo.vercel.app</p>
        </div>
      </div>

      <ActionButtons targetRef={captureRef} />

      <footer className="text-center text-gray-400 text-xs pb-8">
        © 2025 Bucket List Bingo. All rights reserved.
      </footer>
    </main>
  );
}
