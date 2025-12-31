'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BingoBoard } from '@/components/BingoBoard';
import { ActionButtons } from '@/components/ActionButtons';
import { DecorationOverlay, DecorationOverlayRef } from '@/components/DecorationOverlay';
import { DrawingToolbar } from '@/components/DrawingToolbar';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

type Period = 'Yearly' | 'Monthly';
type GridSize = 3 | 4 | 5;

export default function Home() {
  const [period, setPeriod] = useState<Period>('Yearly');
  const [gridSize, setGridSize] = useState<GridSize>(5);
  const [bingoData, setBingoData] = useState<string[]>(Array(25).fill(''));
  const captureRef = useRef<HTMLDivElement>(null);

  // Decoration Mode State
  const [isDecorationMode, setIsDecorationMode] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [isHighlighter, setIsHighlighter] = useState(false);
  const decorationRef = useRef<DecorationOverlayRef>(null);

  // Handle Grid Size Change
  useEffect(() => {
    const totalCells = gridSize * gridSize;
    setBingoData(prev => {
      const newData = Array(totalCells).fill('');
      // Preserve existing data up to the new size
      for (let i = 0; i < Math.min(prev.length, totalCells); i++) {
        newData[i] = prev[i];
      }
      return newData;
    });
  }, [gridSize]);

  const handleCellChange = (index: number, value: string) => {
    const newData = [...bingoData];
    newData[index] = value;
    setBingoData(newData);
  };

  return (
    <main className="min-h-screen py-12 px-4 flex flex-col items-center md:max-w-2xl lg:max-w-3xl mx-auto transition-all duration-300 font-sans">

      <header className="text-center mb-8">
        <h1
          className="text-3xl md:text-4xl text-[#1A1C20] mb-1 uppercase font-black"
          style={{ fontFamily: 'var(--font-rem)' }}
        >
          Bucket List Bingo
        </h1>
        <p className="text-gray-500 text-sm">
          이루고 싶은 목표를 적고 빙고를 완성해보세요!
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-3 mb-12 w-full max-w-md">
        {/* Row 1: Period Toggle */}
        <div className="flex w-full bg-white border border-gray-200 rounded-full p-1">
          {(['Yearly', 'Monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "flex-1 py-2 rounded-full text-sm font-bold transition-all",
                period === p
                  ? "bg-[#2A3038] text-white"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Row 2: Grid Size Toggle */}
        <div className="flex w-full bg-white border border-gray-200 rounded-full p-1">
          {([3, 4, 5] as GridSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setGridSize(size)}
              className={cn(
                "flex-1 py-2 rounded-full text-sm font-bold transition-all",
                gridSize === size
                  ? "bg-[#2A3038] text-white"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {size}x{size}
            </button>
          ))}
        </div>
        {/* Row 3: Decoration Toggle */}
        <button
          onClick={() => setIsDecorationMode(!isDecorationMode)}
          className={cn(
            "w-full py-2 rounded-full text-sm font-bold border transition-all flex items-center justify-center gap-2",
            isDecorationMode
              ? "bg-[#2A3038] text-white border-[#2A3038] shadow-md"
              : "bg-white text-[#1A1C20] border-gray-200 hover:bg-gray-50"
          )}
        >
          <Palette size={16} />
          {isDecorationMode ? '꾸미기 완료 (Done)' : '꾸미기 (Draw)'}
        </button>
      </div>

      {/* Capture Area */}
      <div
        ref={captureRef}
        className="w-full bg-white p-6 md:p-12 relative overflow-hidden flex flex-col items-center shadow-md md:rounded-3xl"
        style={{ aspectRatio: '9/16' }}
      >
        {/* Grid Area */}
        <div className="flex-1 w-full flex items-center justify-center relative">
          <div className={cn("w-full transition-all", isDecorationMode && "pointer-events-none")}>
            {/* Title Area - Moved inside to match grid width */}
            <div className="w-full flex justify-between items-end mb-2">
              <h2
                className="text-4xl md:text-4xl text-[#1A1C20] font-black"
                style={{ fontFamily: 'var(--font-rem)' }}
              >
                {period === 'Yearly' ? '2026' : '01'}
              </h2>
              <span
                className="text-sm md:text-base text-[#1A1C20] font-bold"
                style={{ fontFamily: 'var(--font-rem)' }}
              >
                Bucket List
              </span>
            </div>

            <BingoBoard
              data={bingoData}
              onChange={handleCellChange}
              gridSize={gridSize}
              className="w-full shadow-none bg-transparent border-none"
            />
          </div>
        </div>

        {/* Footer Area */}
        <div className="mt-2 mb-2 text-center">
          <p
            className="text-[#1A1C20] text-sm font-bold"
            style={{ fontFamily: 'var(--font-rem)' }}
          >
            Bucket List BINGO
          </p>
          <p className="text-gray-400 text-xs mt-0.5">bucket-list-bingo.vercel.app</p>
        </div>

        {/* Decoration Overlay - Covers entire capture area */}
        <div className={cn(
          "absolute top-0 left-0 w-full h-full transition-all",
          isDecorationMode ? "pointer-events-auto z-10" : "pointer-events-none z-10"
        )}>
          <DecorationOverlay
            ref={decorationRef}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            isEraser={isEraser}
            isHighlighter={isHighlighter}
          />
        </div>
      </div>

      {isDecorationMode ? (
        <DrawingToolbar
          strokeColor={strokeColor}
          setStrokeColor={setStrokeColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          isEraser={isEraser}
          setIsEraser={setIsEraser}
          isHighlighter={isHighlighter}
          setIsHighlighter={setIsHighlighter}
          onClear={() => decorationRef.current?.clearCanvas()}
        />
      ) : (
        <ActionButtons targetRef={captureRef} />
      )}

      <footer className="text-center text-gray-400 text-xs pb-8 mt-8">
        © 2025 Bucket List Bingo. All rights reserved.
      </footer>
    </main>
  );
}
