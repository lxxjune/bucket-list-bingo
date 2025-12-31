'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BingoBoard } from '@/components/BingoBoard';
import { ActionButtons } from '@/components/ActionButtons';
import { DecorationOverlay, DecorationOverlayRef } from '@/components/DecorationOverlay';
import { DrawingToolbar } from '@/components/DrawingToolbar';
import { DrawingTopBar } from '@/components/DrawingTopBar';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

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
  const [isDrawing, setIsDrawing] = useState(false);
  const decorationRef = useRef<DecorationOverlayRef>(null);
  const drawAreaRef = useRef<HTMLDivElement>(null);

  // Native Event Listener for Drawing State (Fix for Mobile/Safari)
  useEffect(() => {
    const element = drawAreaRef.current;
    if (!element || !isDecorationMode) return;

    const handleStart = () => setIsDrawing(true);
    const handleEnd = () => setIsDrawing(false);

    // Use capture: true to intercept events before react-sketch-canvas consumes them
    // Start events on the element
    element.addEventListener('pointerdown', handleStart, { capture: true });
    element.addEventListener('touchstart', handleStart, { capture: true });

    // End events on the window to ensure we catch them anywhere
    window.addEventListener('pointerup', handleEnd, { capture: true });
    window.addEventListener('touchend', handleEnd, { capture: true });
    window.addEventListener('touchcancel', handleEnd, { capture: true });

    return () => {
      element.removeEventListener('pointerdown', handleStart, { capture: true });
      element.removeEventListener('touchstart', handleStart, { capture: true });

      window.removeEventListener('pointerup', handleEnd, { capture: true });
      window.removeEventListener('touchend', handleEnd, { capture: true });
      window.removeEventListener('touchcancel', handleEnd, { capture: true });
    };
  }, [isDecorationMode]);

  // Tracking State
  const [hasDrawn, setHasDrawn] = useState(false);

  // Fixed Resolution & Scaling Logic
  const FIXED_WIDTH = 360;
  const FIXED_HEIGHT = 640;
  const [scale, setScale] = useState(1);

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

  // Scroll Lock Effect
  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const PADDING = 32; // 16px * 2

      if (isDecorationMode) {
        // Full Screen Mode: Fit to screen while maintaining aspect ratio
        const availableWidth = viewportWidth - PADDING;
        const availableHeight = viewportHeight - PADDING; // Adjust for toolbars if needed
        const scaleX = availableWidth / FIXED_WIDTH;
        const scaleY = availableHeight / FIXED_HEIGHT;
        setScale(Math.min(scaleX, scaleY));
      } else {
        // Normal Mode: Fit to width, but cap max width for desktop
        // Max width for normal mode is usually constrained by the layout (e.g. max-w-2xl)
        // We want it to be responsive.
        const availableWidth = Math.min(viewportWidth, 600) - PADDING; // Cap width
        const s = availableWidth / FIXED_WIDTH;
        setScale(s);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isDecorationMode]);

  // Scroll Lock Effect
  useEffect(() => {
    if (isDecorationMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDecorationMode]);

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
              onClick={() => {
                setPeriod(p);
                trackEvent('select_period', { period_type: p.toLowerCase() });
              }}
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
              onClick={() => {
                setGridSize(size);
                trackEvent('select_grid', { size: `${size}x${size}` });
              }}
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
      </div>

      {/* Full Screen Wrapper */}
      <div
        className={cn(
          "transition-all duration-300 flex items-center justify-center",
          isDecorationMode
            ? "fixed inset-0 z-40 bg-white/95 p-4 backdrop-blur-sm"
            : "w-full relative flex justify-center"
        )}
        style={
          !isDecorationMode
            ? {
              // When using zoom, the element takes up more space in the layout.
              // We don't need to manually set height if the container is flex.
              // But to be safe, we can let it flow.
            }
            : undefined
        }
      >
        {/* Capture Area (The Card) - Responsive Container */}
        <div
          ref={captureRef}
          className={cn(
            "bg-white relative overflow-hidden flex flex-col items-center shadow-md md:rounded-3xl p-6 md:p-12",
            isDecorationMode ? "shadow-2xl" : "shadow-md"
          )}
          style={{
            width: `${FIXED_WIDTH * scale}px`,
            height: `${FIXED_HEIGHT * scale}px`,
            // No transform or zoom here!
          }}
        >
          {/* Content Wrapper - Fixed Resolution & Scaled */}
          <div
            style={{
              width: `${FIXED_WIDTH}px`,
              height: `${FIXED_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {/* Absolute Draw Button (Visible only in normal mode) */}
            {!isDecorationMode && (
              <button
                onClick={() => {
                  setIsDecorationMode(true);
                  trackEvent('open_draw_mode');
                }}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-all z-20 exclude-from-capture"
                data-html2canvas-ignore
              >
                <Palette size={20} />
              </button>
            )}

            {/* Grid Area */}
            <div className="flex-1 w-full flex items-center justify-center relative h-full flex-col px-6">
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

              {/* Footer Area */}
              <div className="mt-2 mb-2 text-center w-full">
                <p
                  className="text-[#1A1C20] text-[12px] font-bold"
                  style={{ fontFamily: 'var(--font-rem)' }}
                >
                  Bucket List BINGO
                </p>
                <p className="text-gray-400 text-[10px]">www.bucketlist.design</p>
              </div>
            </div>
          </div>

          {/* Decoration Overlay - Covers entire capture area (Unscaled) */}
          <div
            ref={drawAreaRef}
            className={cn(
              "absolute inset-0 w-full h-full z-10",
              isDecorationMode ? "pointer-events-auto" : "pointer-events-none"
            )}
          >
            <DecorationOverlay
              ref={decorationRef}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              isEraser={isEraser}
              isHighlighter={isHighlighter}
              onStroke={() => {
                if (!hasDrawn) {
                  setHasDrawn(true);
                  trackEvent('use_draw_tool');
                }
              }}
            />
          </div>
        </div>
      </div>

      {isDecorationMode && (
        <>
          {/* Top Bar */}
          <div className={cn(
            "fixed top-0 left-0 w-full z-50 transition-opacity duration-200",
            isDrawing ? "opacity-0 pointer-events-none" : "opacity-100"
          )}>
            <DrawingTopBar
              onUndo={() => {
                decorationRef.current?.undo();
                trackEvent('click_undo');
              }}
              onDone={() => {
                setIsDecorationMode(false);
                setHasDrawn(false);
                trackEvent('click_done_drawing');
              }}
              activeTool={isEraser ? 'eraser' : isHighlighter ? 'highlighter' : 'pen'}
              onToolChange={(tool) => {
                if (tool === 'eraser') {
                  setIsEraser(true);
                  setIsHighlighter(false);
                } else if (tool === 'highlighter') {
                  setIsEraser(false);
                  setIsHighlighter(true);
                  setStrokeWidth(15);
                } else {
                  setIsEraser(false);
                  setIsHighlighter(false);
                  setStrokeWidth(4);
                }
              }}
            />
          </div>

          {/* Bottom Toolbar */}
          <div className={cn(
            "fixed bottom-0 left-0 w-full z-50 transition-opacity duration-200",
            isDrawing ? "opacity-0 pointer-events-none" : "opacity-100"
          )}>
            <DrawingToolbar
              color={strokeColor}
              setColor={(color) => {
                setStrokeColor(color);
                trackEvent('select_color', { color_hex: color });
              }}
              strokeWidth={strokeWidth}
              setStrokeWidth={(width) => {
                setStrokeWidth(width);
                trackEvent('change_thickness', { width });
              }}
              isEraser={isEraser}
              setIsEraser={setIsEraser}
            />
          </div>
        </>
      )}
      {!isDecorationMode && (
        <ActionButtons targetRef={captureRef} gridSize={gridSize} isDecorated={hasDrawn} />
      )}

      <footer className="text-center text-gray-400 text-xs pb-8 mt-8">
        © 2026 Bucket List Bingo. All rights reserved.
      </footer>
    </main>
  );
}
