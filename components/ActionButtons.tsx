'use client';

import React, { useState } from 'react';
import { Download, Save } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { ActionButton } from './ActionButton';
import { saveAs } from 'file-saver';
import { trackEvent } from '@/lib/analytics';
import { useLogEvent } from '@/hooks/useLogEvent';
import { incrementBingoCount } from '@/app/actions/analytics';

interface ActionButtonsProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    gridSize: number;
    isDecorated: boolean;
    periodValue: string; // [NEW] Needed for increment
    periodType: string;
    filledCount: number;
    onSave?: () => Promise<void>;
}

export const ActionButtons = ({ targetRef, gridSize, isDecorated, periodValue, periodType, filledCount, onSave }: ActionButtonsProps) => {
    const { logEvent } = useLogEvent();
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveImage = async () => {
        if (!targetRef.current) return;

        setIsSaving(true);
        try {
            // Wait for a moment to ensure any pending renders are done
            await new Promise(resolve => setTimeout(resolve, 100));

            // Detect iOS device specifically (iPhone/iPad)
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

            // Calculate dimensions
            const width = targetRef.current.offsetWidth;
            const height = targetRef.current.offsetHeight;

            // Retry logic
            let dataUrl = '';
            for (let i = 0; i < 3; i++) {
                try {
                    dataUrl = await toJpeg(targetRef.current, {
                        quality: 0.95,
                        cacheBust: true,
                        backgroundColor: '#ffffff',
                        width: width,
                        height: height,
                        pixelRatio: 2, // 2x for better quality
                        style: {
                            margin: '0',
                            transform: 'none',
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
            const file = new File([blob], 'bucket_list_bingo.jpg', { type: 'image/jpeg' });

            // Try Web Share API ONLY for iOS (because iOS handles file saving via share sheet best)
            // Android users prefer direct download (saveAs)
            if (isIOS && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Bucket List Bingo',
                    });
                    trackEvent('click_download', {
                        final_grid_size: `${gridSize}x${gridSize}`,
                        is_decorated: isDecorated,
                        method: 'share_sheet_ios'
                    });
                    logEvent('CLICK_DOWNLOAD', {
                        method: 'share_sheet_ios',
                        gridSize,
                        isDecorated,
                        period_type: periodType,
                        filled_count: filledCount
                    });
                    incrementBingoCount(periodValue, `${gridSize}x${gridSize}`, 'download_count');
                    return; // Stop here if shared successfully
                } catch (err) {
                    // If user cancelled, do nothing. If error, fall back to download.
                    if ((err as Error).name === 'AbortError') return;
                    console.warn('Share failed, falling back to download', err);
                }
            }

            // Fallback: Direct Download (file-saver)
            saveAs(blob, 'bucket_list_bingo.jpg');

            trackEvent('click_download', {
                final_grid_size: `${gridSize}x${gridSize}`,
                is_decorated: isDecorated,
                method: 'download_fallback'
            });
            logEvent('CLICK_DOWNLOAD', {
                method: 'download_fallback',
                gridSize,
                isDecorated,
                period_type: periodType,
                filled_count: filledCount
            });
            incrementBingoCount(periodValue, `${gridSize}x${gridSize}`, 'download_count');
        } catch (err) {
            console.error('Failed to save image:', err);
            trackEvent('error_save_image', {
                error_message: err instanceof Error ? err.message : String(err)
            });
            alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full flex gap-3 justify-center mt-4">
            <ActionButton
                onClick={handleSaveImage}
                disabled={isSaving}
                variant="outline"
                size="sm"
                icon={<Download size={16} />}
            >
                {isSaving ? '저장 중...' : '이미지 저장'}
            </ActionButton>

            {/* Save to DB Button (Only visible if onSave is provided) */}
            {onSave && (
                <ActionButton
                    onClick={async () => {
                        try {
                            setIsSaving(true);
                            logEvent('CLICK_SAVE_BINGO', {
                                gridSize,
                                isDecorated,
                                period_type: periodType,
                                filled_count: filledCount
                            });
                            await onSave();
                        } catch (e) {
                            if (e instanceof Error) {
                                alert(e.message);
                            } else {
                                alert('저장에 실패했습니다.');
                            }
                            console.error(e);
                        } finally {
                            setIsSaving(false);
                        }
                    }}
                    disabled={isSaving}
                    variant="fill"
                    size="sm"
                    icon={<Save size={16} />}
                >
                    {isSaving ? '저장 중...' : '내 빙고 저장'}
                </ActionButton>
            )}
        </div>
    );
};
