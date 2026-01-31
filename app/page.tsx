'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { ActionButton } from '@/components/ActionButton';
import { useLogEvent } from '@/hooks/useLogEvent';

export default function IntroPage() {
  const { logEvent } = useLogEvent();
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      if (isMobile && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Bucket List Bingo',
          text: '나만의 버킷리스트를 빙고로 만들어 친구들과 즐겨보세요 !',
          url: url
        });
        trackEvent('click_share');
        logEvent('CLICK_SHARE_INTRO', { method: 'navigator_share' });
      } else {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        trackEvent('copy_link');
        logEvent('CLICK_SHARE_INTRO', { method: 'clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 font-sans">

      <div className="flex flex-col items-center text-center max-w-md w-full">
        {/* Title Group */}
        <div>
          <h1 className="text-[36px] font-[family-name:var(--font-rem)] font-extrabold text-black tracking-[-0.02em] leading-[1.2]">
            BUCKET LIST<br />
            BINGO
          </h1>

          <p className="py-4 text-black text-[16px] font-semibold whitespace-pre-wrap">
            이루고 싶은 목표를 적고
            <br className="md:hidden" /> 빙고를 완성해보세요!
          </p>
        </div>

        {/* Buttons Group */}
        <div className="w-full mt-4 space-y-2">
          {/* CTA Button */}
          <ActionButton
            href="/bingo"
            variant="fill"
            size="md"
            onClick={() => logEvent('CLICK_START_BINGO')}
          >
            내 빙고 만들기
          </ActionButton>

          {/* Share Button */}
          <ActionButton
            onClick={handleShare}
            variant="outline"
            size="md"
            icon={isCopied ? <Check size={20} /> : <Share2 size={20} />}
          >
            {isCopied ? '복사됨!' : '친구들과 함께하기'}
          </ActionButton>
        </div>
      </div>

    </main>
  );
}
