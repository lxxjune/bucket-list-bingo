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
}

export const DecorationOverlay = forwardRef<DecorationOverlayRef, DecorationOverlayProps>(
    ({ strokeColor, strokeWidth, isEraser, isHighlighter, onStroke }, ref) => {
        const canvasRef = useRef<ReactSketchCanvasRef>(null);

        useImperativeHandle(ref, () => ({
            clearCanvas: () => canvasRef.current?.clearCanvas(),
            undo: () => canvasRef.current?.undo(),
            redo: () => canvasRef.current?.redo(),
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
            <div className="absolute top-0 left-0 w-full h-full z-20 touch-none">
                <ReactSketchCanvas
                    ref={canvasRef}
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
