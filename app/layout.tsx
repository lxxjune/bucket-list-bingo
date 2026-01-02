import type { Metadata } from "next";
import { Noto_Sans_KR, REM } from "next/font/google";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

const rem = REM({
  subsets: ["latin"],
  variable: "--font-rem",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bucketlist.design'),
  title: {
    template: '%s | 버킷리스트 빙고',
    default: '버킷리스트 빙고 - 2026 목표 달성',
  },
  description: "2026년 목표를 빙고로 만들어보세요. 나만의 버킷리스트를 작성하고 친구와 공유하여 동기부여를 얻을 수 있습니다. 목표 달성 필수 앱.",
  keywords: ['버킷리스트', '빙고', '버킷리스트 빙고', 'Bucket List', '새해 목표', '동기부여', 'Bucket List Bingo'],
  openGraph: {
    title: '버킷리스트 빙고 - 2026 목표 달성',
    description: "2026년 목표를 빙고로 만들어보세요. 나만의 버킷리스트를 작성하고 친구와 공유하여 동기부여를 얻을 수 있습니다. 목표 달성 필수 앱.",
    locale: 'ko_KR',
    type: 'website',
    siteName: 'Bucket List Bingo',
    images: [
      {
        url: 'https://www.bucketlist.design/og-image.png',
        width: 1200,
        height: 630,
        alt: '버킷리스트 빙고',
      },
    ],
  },
  alternates: {
    canonical: '/',
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  verification: {
    google: "X6WxuSMurTga3iLgj1skDYcxOJpXRuMe_6aYEnjeEJI",
    other: {
      "naver-site-verification": "0e9b56689238a8589a6524533ccace085720959e",
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '버킷리스트 빙고',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'All',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} ${rem.variable} antialiased font-sans`}>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
