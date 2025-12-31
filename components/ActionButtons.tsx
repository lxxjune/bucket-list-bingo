'use client';

import React, { useState } from 'react';
import { Download, Share2, Check } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { event } from '@/lib/analytics';

interface ActionButtonsProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
}

export const ActionButtons = ({ targetRef }: ActionButtonsProps) => {
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
            const pixelRatio = isMobile ? 2 : 3;

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

            // Convert DataURL to Blob for file-saver
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            // Direct Download (Pinterest style) - Save to Gallery/Downloads
            saveAs(blob, '2026_bucket_list_bingo.jpg');

            event({
                action: 'image_download',
                category: 'interaction',
                label: 'save_image',
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
                    title: '2026 신년 버킷리스트 빙고',
                    text: '나만의 2026년 버킷리스트를 빙고로 만들어보세요!',
                    url: url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }

            event({
                action: 'link_share',
                category: 'interaction',
                label: 'share_url',
            });
        } catch (err) {
            console.error('Failed to share:', err);
        }
    };

    return (
        <div className="flex gap-3 justify-center mt-8 mb-12">
            <button
                onClick={handleSaveImage}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-[#2A3038] text-white rounded-xl font-bold shadow-lg hover:bg-black active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <Download size={20} />
                {isSaving ? '저장 중...' : '이미지 저장'}
            </button>

            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#1A1C20] border border-[#1A1C20] rounded-xl font-bold shadow-md hover:bg-gray-50 active:scale-95 transition-all"
            >
                {isCopied ? <Check size={20} /> : <Share2 size={20} />}
                {isCopied ? '복사됨!' : '공유하기'}
            </button>
        </div>
    );
};
