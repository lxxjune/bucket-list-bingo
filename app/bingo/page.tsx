'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BingoBoard } from '@/components/BingoBoard';
import { ActionButtons } from '@/components/ActionButtons';
import { DecorationOverlay, DecorationOverlayRef } from '@/components/DecorationOverlay';
import { DrawingToolbar } from '@/components/DrawingToolbar';
import { VisitCounter } from '@/components/VisitCounter';
import { useLogEvent } from '@/hooks/useLogEvent';

import { DrawingTopBar } from '@/components/DrawingTopBar';
import { Palette, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { saveBoard, fetchBoard, BingoData } from '@/app/actions/bingo';

type Period = 'Yearly' | 'Monthly';
type GridSize = 3 | 4 | 5;

export default function Home() {
  const { logEvent } = useLogEvent();
  const [period, setPeriod] = useState<Period>('Monthly');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [bingoData, setBingoData] = useState<string[]>(Array(25).fill(''));
  const captureRef = useRef<HTMLDivElement>(null);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Restore drawing data
  const loadDrawing = (paths: any) => {
    // 1. Always clear existing drawing first to prevent merging
    decorationRef.current?.clearCanvas();

    // 2. Load new paths if they exist
    if (paths && Array.isArray(paths) && paths.length > 0) {
      setTimeout(() => {
        decorationRef.current?.loadPaths(paths);
        setHasDrawn(true);
      }, 50);
    } else {
      setHasDrawn(false);
    }
  };

  // 1. First, check for local storage pending data
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  const router = useRouter();

  // Restore Pending Data Effect
  useEffect(() => {
    let mounted = true;

    const restorePendingData = async () => {
      try {
        const pendingDataStr = localStorage.getItem('pending_bingo_data');
        if (pendingDataStr) {
          const pendingData = JSON.parse(pendingDataStr);

          setPeriod(pendingData.period_type);

          // Parse period_value string (e.g. "2026" or "2026-02")
          const pValue = String(pendingData.period_value);
          if (pendingData.period_type === 'Yearly') {
            setYear(parseInt(pValue));
          } else {
            const [y, m] = pValue.split('-');
            setYear(parseInt(y));
            setMonth(parseInt(m));
          }

          setBingoData(pendingData.grid_data);
          loadDrawing(pendingData.drawing_data);

          const dataToSave: BingoData = {
            title: pendingData.title,
            grid_data: pendingData.grid_data,
            drawing_data: pendingData.drawing_data,
            period_type: pendingData.period_type,
            period_value: pValue,
            grid_size: pendingData.grid_size || '3x3'
          };

          const { error } = await saveBoard(dataToSave);

          if (mounted) {
            if (error) {
              console.error("Failed to save restored data", error);
              alert("저장에 실패했습니다.");
            } else {
              localStorage.removeItem('pending_bingo_data');
              alert('저장되었습니다!');
            }
          }
        }
      } catch (e) {
        console.error("Failed to restore pending data", e);
        localStorage.removeItem('pending_bingo_data');
      } finally {
        if (mounted) {
          setIsCheckingStorage(false);
          setIsLoading(false); // Initial load done (or moving to fetch phase)
        }
      }
    };

    restorePendingData();
    return () => { mounted = false; };
  }, [router]);

  // 2. Main Data Fetching Effect
  useEffect(() => {
    // Skip if checking storage
    if (isCheckingStorage) return;

    const loadData = async () => {
      setIsLoading(true); // Start loading

      const periodValue = period === 'Yearly'
        ? String(year)
        : `${year}-${String(month).padStart(2, '0')}`;

      const currentGridSizeStr = `${gridSize}x${gridSize}`;
      const { success, data } = await fetchBoard(period, periodValue, currentGridSizeStr);

      if (success && data && data.grid_data) {
        let loadedGrid = data.grid_data as string[];
        if (Array.isArray(loadedGrid)) {
          // Calculate needed length based on current grid size
          const neededLength = gridSize * gridSize;
          const padded = [...loadedGrid, ...Array(neededLength).fill('')].slice(0, neededLength);
          setBingoData(padded);
          loadDrawing(data.drawing_data);

          /* 
             Note: We do NOT setGridSize here anymore based on fetched data,
             because we are now fetching specific data FOR the current grid size.
             The user selected the grid size, and we want to see data for THAT size.
          */
        }
      } else {
        // Fallback: No data found -> Empty board
        const neededLength = gridSize * gridSize;
        setBingoData(Array(neededLength).fill(''));
        loadDrawing(null); // Clear canvas
      }

      setIsLoading(false); // End loading
    };

    loadData();
  }, [period, year, month, gridSize, isCheckingStorage]);


  const handleSaveToDB = async () => {
    const periodValue = period === 'Yearly'
      ? String(year)
      : `${year}-${String(month).padStart(2, '0')}`;

    const drawingPaths = await decorationRef.current?.exportPaths();

    const dataToSave: BingoData = {
      title: `${period === 'Yearly' ? `${year} 버킷리스트` : `${year}년 ${month}월 버킷리스트`}`,
      grid_data: bingoData,
      drawing_data: drawingPaths,
      period_type: period,
      period_value: periodValue,
      grid_size: `${gridSize}x${gridSize}`
    };

    const { error } = await saveBoard(dataToSave);
    if (error === 'Unauthorized') {
      const confirmLogin = confirm('로그인이 필요합니다. \n로그인 페이지로 이동하시겠습니까?');

      if (confirmLogin) {
        localStorage.setItem('pending_bingo_data', JSON.stringify({
          ...dataToSave,
          period_type: period,
          period_value: periodValue
        }));
        router.push('/login');
      }
      return;
    }
    if (error) throw new Error(error);

    alert('저장되었습니다!');
  };

  // Decoration Mode State
  const [isDecorationMode, setIsDecorationMode] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [isHighlighter, setIsHighlighter] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const decorationRef = useRef<DecorationOverlayRef>(null);
  const drawAreaRef = useRef<HTMLDivElement>(null);

  // Tracking Refs
  const drawStartTimeRef = useRef<number>(0);
  const strokeCountRef = useRef<number>(0);

  // Helper for tracking
  const [hasDrawn, setHasDrawn] = useState(false);


  // Native Event Listener for Drawing State
  useEffect(() => {
    const element = drawAreaRef.current;
    if (!element || !isDecorationMode) return;

    const handleStart = () => setIsDrawing(true);
    const handleEnd = () => setIsDrawing(false);

    element.addEventListener('pointerdown', handleStart, { capture: true });
    element.addEventListener('touchstart', handleStart, { capture: true });
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

  // Analytics
  const bingoDataRef = useRef(bingoData);
  const gridSizeRef = useRef(gridSize);

  useEffect(() => {
    bingoDataRef.current = bingoData;
    gridSizeRef.current = gridSize;
  }, [bingoData, gridSize]);

  useEffect(() => {
    const handleUnload = () => {
      const filledCount = bingoDataRef.current.filter(c => c.trim().length > 0).length;
      if (filledCount > 0) {
        trackEvent('session_summary', {
          filled_count: filledCount,
          grid_size: gridSizeRef.current
        });
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return (
    <main className="min-h-screen pt-20 pb-12 px-4 flex flex-col items-center md:max-w-2xl lg:max-w-3xl mx-auto transition-all duration-300">
      <h1 className="sr-only">나만의 버킷리스트 빙고 만들기</h1>

      {/* Controls */}
      <div className="flex flex-col gap-2 mb-4 w-full max-w-[480px]">
        {/* Row 1: Period Toggle */}
        <div className="flex w-full bg-white border border-gray-300 rounded-full p-0">
          {(['Yearly', 'Monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                trackEvent('select_period', { period_type: p.toLowerCase() });
                if (p === 'Yearly') logEvent('CLICK_YEARLY');
                if (p === 'Monthly') logEvent('CLICK_MONTHLY');
              }}
              className={cn(
                "flex-1 py-2 rounded-full text-[12px] font-medium transition-all uppercase",
                period === p
                  ? "bg-black text-white"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Row 2: Grid Size Toggle */}
        <div className="flex w-full bg-white border border-gray-300 rounded-full p-0">
          {([3, 4, 5] as GridSize[]).map((size) => (
            <button
              key={size}
              onClick={() => {
                // Track grid reset
                if (gridSize !== size) {
                  const filledCount = bingoData.filter(c => c.trim().length > 0).length;
                  if (filledCount > 0) {
                    trackEvent('reset_grid', {
                      lost_content_count: filledCount,
                      from_size: `${gridSize}x${gridSize}`,
                      to_size: `${size}x${size}`
                    });
                  }
                }
                setGridSize(size);
                trackEvent('select_grid', { size: `${size}x${size}` });
                logEvent(`CLICK_${size}x${size}`);
              }}
              className={cn(
                "flex-1 py-2 rounded-full text-[12px] font-medium transition-all",
                gridSize === size
                  ? "bg-black text-white"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {size}x{size}
            </button>
          ))}
        </div>
      </div>

      {/* Capture Area (The Card) - In-place, Responsive */}
      <div
        ref={captureRef}
        className={cn(
          "bg-white relative overflow-hidden flex flex-col items-center rounded-xs mx-auto transition-all duration-300",
          "w-full max-w-[480px] aspect-[9/16]", // Responsive width with fixed aspect ratio
          isDecorationMode ? "shadow-2xl ring-2 ring-black/5" : "border border-gray-200"
        )}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin text-[#1A1C20]" />
          </div>
        )}

        {/* Absolute Draw Button (Visible only in normal mode) */}
        {!isDecorationMode && !isLoading && (
          <button
            onClick={() => {
              setIsDecorationMode(true);
              drawStartTimeRef.current = Date.now();
              strokeCountRef.current = 0;
              trackEvent('view_draw_mode');
              logEvent('CLICK_DRAWING_MODE');
            }}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-all z-20 exclude-from-capture"
            data-html2canvas-ignore
          >
            <Palette size={20} />
          </button>
        )}

        {/* ... (Content Container code unchanged) ... */}
        <div className="w-full h-full flex flex-col p-6">
          {/* Grid Area */}
          <div className="flex-1 w-full flex items-center justify-center relative flex-col">
            <div className={cn("w-full transition-all", isDecorationMode && "pointer-events-none")}>
              {/* Title Area */}
              <div className="w-full flex justify-between items-end mb-2">
                <div className="w-full justify-between items-center">
                  {/* Year Select (Visible only in Monthly mode) */}
                  {period === 'Monthly' && (
                    <div className="relative group flex items-center">
                      <h2
                        className="text-4xl text-[#1A1C20] font-black leading-none"
                        style={{ fontFamily: 'var(--font-rem)' }}
                      >
                        {year}
                      </h2>
                      <div className="flex items-end h-full ml-1 mb-1">
                        <ChevronDown size={20} className="text-[#1A1C20]" strokeWidth={2} />
                      </div>

                      <select
                        value={year}
                        onChange={(e) => {
                          setYear(Number(e.target.value));
                          trackEvent('select_year_monthly', { year: Number(e.target.value) });
                          logEvent('CLICK_YEAR_PERIOD', { year: Number(e.target.value) });
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      >
                        {Array.from({ length: 11 }, (_, i) => 2025 + i).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Main Value Select (Year for Yearly, Month for Monthly) */}
                  <div className="relative group flex items-center">
                    <h2
                      className="text-4xl text-[#1A1C20] font-black leading-none"
                      style={{ fontFamily: 'var(--font-rem)' }}
                    >
                      {period === 'Yearly' ? year : String(month).padStart(2, '0')}
                    </h2>
                    <div className="flex items-end h-full ml-1 mb-1">
                      <ChevronDown size={20} className="text-[#1A1C20]" strokeWidth={2} />
                    </div>

                    <select
                      value={period === 'Yearly' ? year : month}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (period === 'Yearly') {
                          setYear(val);
                          trackEvent('select_year', { year: val });
                        } else {
                          setMonth(val);
                          trackEvent('select_month', { month: val });
                          logEvent('CLICK_MONTH_PERIOD', { month: val });
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isLoading}
                    >
                      {period === 'Yearly'
                        ? Array.from({ length: 11 }, (_, i) => 2025 + i).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))
                        : Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>{m}월</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>

              <BingoBoard
                data={bingoData}
                onChange={handleCellChange}
                gridSize={gridSize}
                className="w-full shadow-none bg-transparent border-none"
              />
            </div>

            {/* Footer Area */}
            <div className="mt-6 text-center w-full">
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

        {/* Decoration Overlay - Covers entire capture area */}
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
              }
              strokeCountRef.current += 1;
              trackEvent('interact_draw_tool', {
                action: 'draw',
                tool_type: isEraser ? 'eraser' : isHighlighter ? 'highlighter' : 'pen'
              });
            }}
          />
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
                trackEvent('interact_draw_tool', { action: 'undo', tool_type: 'unknown' });
              }}
              onDone={() => {
                setIsDecorationMode(false);
                setHasDrawn(false);

                const duration = (Date.now() - drawStartTimeRef.current) / 1000;
                trackEvent('complete_drawing', {
                  stroke_count: strokeCountRef.current,
                  duration_seconds: Math.round(duration)
                });
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
            "fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 transition-opacity duration-200",
            isDrawing ? "opacity-0 pointer-events-none" : "opacity-100"
          )}>
            <DrawingToolbar
              strokeColor={strokeColor}
              setStrokeColor={(color) => {
                setStrokeColor(color);
                trackEvent('select_color', { color_hex: color });
              }}
              strokeWidth={strokeWidth}
              setStrokeWidth={(width) => {
                setStrokeWidth(width);
                trackEvent('change_thickness', { width });
              }}
              isEraser={isEraser}
              isHighlighter={isHighlighter}
            />
          </div>
        </>
      )}
      {!isDecorationMode && (
        <div className="w-full max-w-[480px]">
          <ActionButtons
            targetRef={captureRef}
            gridSize={gridSize}
            isDecorated={hasDrawn}
            periodValue={period === 'Yearly' ? String(year) : `${year}-${String(month).padStart(2, '0')}`}
            periodType={period}
            filledCount={bingoData.filter(c => c.trim().length > 0).length}
            onSave={handleSaveToDB}
          />
        </div>
      )}

      {/* Increment Visit Count on Load */}
      <VisitCounter
        periodValue={period === 'Yearly' ? String(year) : `${year}-${String(month).padStart(2, '0')}`}
        gridSize={gridSize}
      />

      <footer className="text-center text-gray-400 text-xs pb-8 mt-8">
        © Bucket List Bingo. All rights reserved.
      </footer>
    </main>
  );
}
