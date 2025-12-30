'use client';

import React, { useState } from 'react';
import { Download, Share2, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
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

            const dataUrl = await toPng(targetRef.current, {
                cacheBust: true,
                backgroundColor: '#fff5f5', // Match the pastel background
                pixelRatio: 3, // Higher quality
            });

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = '2026_bucket_list_bingo.png';
            link.click();

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
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <Download size={20} />
                {isSaving ? '저장 중...' : '이미지로 저장'}
            </button>

            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-xl font-bold shadow-md hover:bg-indigo-50 active:scale-95 transition-all"
            >
                {isCopied ? <Check size={20} /> : <Share2 size={20} />}
                {isCopied ? '복사됨!' : '공유하기'}
            </button>
        </div>
    );
};
