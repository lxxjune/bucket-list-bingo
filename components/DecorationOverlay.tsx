'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

interface DecorationOverlayProps {
    strokeColor: string;
    strokeWidth: number;
    isEraser: boolean;
    isHighlighter: boolean;
    onStroke?: () => void;
}

export interface DecorationOverlayRef {
    clearCanvas: () => void;
    undo: () => void;
    redo: () => void;
    exportPaths: () => Promise<any>;
    loadPaths: (paths: any) => void;
}

export const DecorationOverlay = forwardRef<DecorationOverlayRef, DecorationOverlayProps>(
    ({ strokeColor, strokeWidth, isEraser, isHighlighter, onStroke }, ref) => {
        const canvasRef = useRef<ReactSketchCanvasRef>(null);
        const containerRef = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            clearCanvas: () => canvasRef.current?.clearCanvas(),
            undo: () => canvasRef.current?.undo(),
            redo: () => canvasRef.current?.redo(),
            exportPaths: async () => {
                const paths = await canvasRef.current?.exportPaths();
                if (!paths || !containerRef.current) return [];

                const { width, height } = containerRef.current.getBoundingClientRect();

                // Normalize coordinates (0-1 range)
                return paths.map((path: any) => ({
                    ...path,
                    paths: path.paths.map((point: any) => ({
                        x: point.x / width,
                        y: point.y / height
                    })),
                    strokeWidth: path.strokeWidth / width // Normalize stroke width relative to width
                }));
            },
            loadPaths: (paths: any) => {
                if (!paths || !containerRef.current) return;

                const { width, height } = containerRef.current.getBoundingClientRect();

                // Denormalize coordinates (back to pixels)
                const denormalizedPaths = paths.map((path: any) => ({
                    ...path,
                    paths: path.paths.map((point: any) => ({
                        x: point.x * width,
                        y: point.y * height
                    })),
                    strokeWidth: (path.strokeWidth || 4 / width) * width
                }));

                canvasRef.current?.loadPaths(denormalizedPaths);
            },
        }));

        // Handle Eraser Mode
        React.useEffect(() => {
            if (canvasRef.current) {
                canvasRef.current.eraseMode(isEraser);
            }
        }, [isEraser]);

        // Calculate actual stroke color based on highlighter mode
        const getStrokeColor = () => {
            if (isEraser) return '#FFFFFF';

            if (isHighlighter) {
                const hex = strokeColor.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                return `rgba(${r}, ${g}, ${b}, 0.3)`;
            }
            return strokeColor;
        };

        return (
            <div ref={containerRef} className="absolute top-0 left-0 w-full h-full z-20 touch-none">
                <ReactSketchCanvas
                    ref={canvasRef}
                    width="100%"
                    height="100%"
                    strokeWidth={strokeWidth}
                    strokeColor={isEraser ? '#ffffff00' : getStrokeColor()}
                    canvasColor="transparent"
                    style={{ border: 'none' }}
                    withTimestamp={true}
                    onChange={(paths) => {
                        if (paths.length > 0) {
                            onStroke?.();
                        }
                    }}
                />
            </div>
        );
    }
);

DecorationOverlay.displayName = 'DecorationOverlay';
