'use client';

import React, { useState } from 'react';
import { Download, Share2, Check } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { trackEvent } from '@/lib/analytics';

interface ActionButtonsProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    gridSize: number;
    isDecorated: boolean;
}

export const ActionButtons = ({ targetRef, gridSize, isDecorated }: ActionButtonsProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveImage = async () => {
        if (!targetRef.current) return;

        setIsSaving(true);
        try {
            // Wait for a moment to ensure any pending renders are done
            await new Promise(resolve => setTimeout(resolve, 100));

            // Detect mobile device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            // Calculate pixel ratio to ensure output width is 360px (or close to it)
            // Current width is targetRef.current.offsetWidth
            // Target width is 360
            // We want (currentWidth * pixelRatio) = 360 * 2 (for retina quality) or just 360?
            // Let's aim for high quality, so maybe 720px width (2x)?
            // The user asked for "Fixed Resolution (360x640)".
            // If we output 360x640, it might be blurry on high DPI screens.
            // Usually "Fixed Resolution" in web design means CSS pixels.
            // Let's export at 2x (720x1280) for better quality, or 1x if strictly requested.
            // Let's stick to 2x (720px width) for quality, as 360px is very low for an image.
            // Wait, if the user wants "alignment", 360px is the logical size.
            // Let's try to match the visual expectation.
            // If I export at 360px, text will be unreadable.
            // Let's export at 720px (2x).
            const targetWidth = 720;
            const currentWidth = targetRef.current.offsetWidth;
            const pixelRatio = targetWidth / currentWidth;

            // Retry logic
            let dataUrl = '';
            for (let i = 0; i < 3; i++) {
                try {
                    dataUrl = await toJpeg(targetRef.current, {
                        quality: 0.95,
                        cacheBust: true,
                        backgroundColor: '#ffffff',
                        pixelRatio: pixelRatio,
                        style: {
                            overflow: 'hidden',
                            // We don't need to reset zoom or transform here because we are capturing the responsive container
                            // which has no transform on itself.
                        },
                        filter: (node) => !node.classList?.contains('exclude-from-capture'),
                    });
                    if (dataUrl) break;
                } catch (e) {
                    console.warn(`Attempt ${i + 1} failed`, e);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (!dataUrl) throw new Error('Failed to generate image');

            // Convert DataURL to Blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], '2026_bucket_list_bingo.jpg', { type: 'image/jpeg' });

            // Fallback: Direct Download (file-saver)
            saveAs(blob, '2026_bucket_list_bingo.jpg');

            trackEvent('click_download', {
                final_grid_size: `${gridSize}x${gridSize}`,
                is_decorated: isDecorated,
                method: 'download_fallback'
            });
        } catch (err) {
            console.error('Failed to save image:', err);
            alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: '2026 버킷리스트 빙고',
                    text: '나만의 2026년 버킷리스트를 빙고로 만들어보세요!',
                    url: url,
                });
                trackEvent('click_share');
            } else {
                await navigator.clipboard.writeText(url);
                setIsCopied(true);
                trackEvent('copy_link');
                setTimeout(() => setIsCopied(false), 2000);
            }
        } catch (err) {
            console.error('Failed to share:', err);
        }
    };

    return (
        <div className="w-full flex gap-3 justify-center mt-8 mb-12 px-6">
            <button
                onClick={handleSaveImage}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-2 py-3 bg-[#2A3038] text-white text-sm rounded-xl font-bold shadow-lg hover:bg-black active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <Download size={16} />
                {isSaving ? '저장 중...' : '이미지 저장'}
            </button>

            <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-2 py-3 bg-white text-[#1A1C20] text-sm border border-[#EEEFF1] rounded-xl font-bold shadow-md hover:bg-gray-50 active:scale-95 transition-all"
            >
                {isCopied ? <Check size={16} /> : <Share2 size={16} />}
                {isCopied ? '복사됨!' : '공유하기'}
            </button>
        </div>
    );
};
