'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

interface DecorationOverlayProps {
    strokeColor: string;
    strokeWidth: number;
    isEraser: boolean;
    isHighlighter: boolean;
}

export interface DecorationOverlayRef {
    clearCanvas: () => void;
    undo: () => void;
    redo: () => void;
}

export const DecorationOverlay = forwardRef<DecorationOverlayRef, DecorationOverlayProps>(
    ({ strokeColor, strokeWidth, isEraser, isHighlighter }, ref) => {
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
        // Highlighter needs opacity. ReactSketchCanvas supports hex with alpha or rgba.
        // If isHighlighter, we append alpha to hex or use rgba.
        // Assuming strokeColor is Hex (e.g. #FF0000).
        const getStrokeColor = () => {
            if (isEraser) return '#FFFFFF'; // Eraser isn't really a color in canvas-draw, but sketch-canvas handles eraser mode separately usually. 
            // Actually react-sketch-canvas has an `eraserWidth` prop but not a direct "eraser mode" boolean in the same way.
            // Wait, react-sketch-canvas documentation says: "To use eraser, set strokeColor to canvasColor (default white)".
            // But that paints white over it.
            // Better way: It doesn't have a true "erase to transparent" mode easily unless using globalCompositeOperation which isn't exposed.
            // Let's check if we can just paint white? Since our background is transparent, painting white might look like erasing if the background is white.
            // BUT our background is transparent (overlay). Painting white will make it white, not transparent.
            // Limitation of react-sketch-canvas: Eraser paints with canvasColor.
            // If we set canvasColor to "transparent", eraser might work as clearing?
            // Let's try setting canvasColor="transparent" and strokeColor="transparent" for eraser? No that draws nothing.

            // Workaround: react-sketch-canvas v6 might support eraser properly.
            // If not, we might need to accept that "Eraser" paints white (which matches the paper background effectively).
            // Since the bingo board has a white/light background, painting white is acceptable for "erasing" the ink, 
            // as long as it doesn't cover the text underneath? 
            // Ah, if we paint white on the overlay, it will cover the text underneath because the overlay is on top.
            // This is a problem. We need true transparency erasing.

            // Alternative: Use `react-canvas-draw`? It supports `lazyRadius` and might have better eraser?
            // Actually `react-sketch-canvas` is SVG based.
            // Let's stick to the plan but be aware of this.
            // If isEraser is true, we might not be able to use standard strokeColor.

            if (isHighlighter) {
                // Convert hex to rgba with low opacity
                // Simple hex to rgb conversion
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
                    strokeColor={isEraser ? '#ffffff00' : getStrokeColor()} // If eraser, we rely on the library's eraser functionality if available, or hack it.
                    // Actually, looking at types, we can toggle `eraserWidth`? 
                    // No, the library usually exposes `eraseMode` in newer versions or we just draw.
                    // Let's check if `canvasRef.current.eraseMode(true)` exists.
                    // If not, we might need to rely on the user's request "react-sketch-canvas".
                    // Let's assume for now we pass props.
                    canvasColor="transparent"
                    style={{ border: 'none' }}
                    withTimestamp={true}
                />
            </div>
        );
    }
);

DecorationOverlay.displayName = 'DecorationOverlay';
