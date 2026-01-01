'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, Suspense } from 'react';
import { pageview, GA_TRACKING_ID, setUserProperties, trackEvent } from '@/lib/analytics';

function GoogleAnalyticsContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            pageview(pathname);
        }

        // Visit Count Tracking
        try {
            const now = Date.now();
            const lastVisitTime = localStorage.getItem('last_visit_time');
            let visitCount = parseInt(localStorage.getItem('visit_count') || '0', 10);

            // Session timeout: 30 minutes (1800000 ms)
            // If no last visit or last visit was > 30 mins ago, increment count
            if (!lastVisitTime || (now - parseInt(lastVisitTime, 10) > 30 * 60 * 1000)) {
                visitCount++;
                localStorage.setItem('visit_count', visitCount.toString());
            }

            localStorage.setItem('last_visit_time', now.toString());

            setUserProperties({
                visit_count: visitCount,
                user_type: visitCount > 1 ? 'returning' : 'new'
            });
        } catch (e) {
            console.error('Failed to track visit count', e);
        }

        // Viral Loop: Landing from share
        const sourceId = searchParams?.get('source_id');
        if (sourceId) {
            trackEvent('landing_from_share', { source_id: sourceId });
        }
    }, [pathname, searchParams]);

    // Device Friction & Interaction Tracking
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 2. Orientation
        const handleOrientationChange = () => {
            const type = window.screen.orientation ? window.screen.orientation.type :
                (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
            trackEvent('screen_orientation', { type });
        };
        window.addEventListener('orientationchange', handleOrientationChange);

        // 3. Screenshot (Desktop PrintScreen)
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen') {
                trackEvent('capture_screenshot', { method: 'key_printscreen' });
            }
        };
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Keyboard & Zoom specific effect
    useEffect(() => {
        if (typeof window === 'undefined' || !window.visualViewport) return;

        let isKeyboardOpen = false;
        const handleResize = () => {
            const vv = window.visualViewport;
            if (!vv) return;

            // Keyboard detection
            const heightDiff = window.innerHeight - vv.height;
            const isOpen = heightDiff > window.innerHeight * 0.25; // 25% threshold

            if (isOpen && !isKeyboardOpen) {
                trackEvent('virtual_keyboard_open', {
                    viewport_height_diff: Math.round(heightDiff)
                });
            }
            isKeyboardOpen = isOpen;

            // Zoom detection
            if (vv.scale > 1.1) {
                trackEvent('zoom_gesture', { scale: vv.scale.toFixed(2) });
            }
        };

        window.visualViewport.addEventListener('resize', handleResize);
        return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
                }}
            />
        </>
    );
}

export default function GoogleAnalytics() {
    return (
        <Suspense fallback={null}>
            <GoogleAnalyticsContent />
        </Suspense>
    );
}
