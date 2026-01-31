import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, REM } from "next/font/google";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SiteHeaderServer from "@/components/SiteHeaderServer";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { GlobalLoadingProvider } from "@/context/GlobalLoadingContext";
import { GlobalSpinner } from "@/components/GlobalSpinner";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "900"],
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
    template: '%s | Bucket List Bingo - 버킷리스트 빙고 만들기',
    default: 'Bucket List Bingo - 버킷리스트 빙고 만들기',
  },
  description: "나만의 버킷리스트를 빙고 게임으로 만들어보세요. 친구들과 공유해 빙고게임을 즐겨보세요.",
  keywords: ['버킷리스트', '빙고', '버킷리스트 빙고', '버킷리스트빙고', 'Bucket List', 'BucketListBingo', '새해 목표', '동기부여', '버킷리스트 양식', '버킷리스트 빙고 만들기', '버킷리스트 빙고 게임', 'Bucket List Bingo'],
  openGraph: {
    title: 'Bucket List Bingo - 버킷리스트 빙고 만들기',
    description: "나만의 버킷리스트를 빙고 게임으로 만들어보세요. 친구들과 공유해 빙고게임을 즐겨보세요.",
    locale: 'ko_KR',
    type: 'website',
    siteName: 'Bucket List Bingo - 버킷리스트 빙고 만들기',
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: "X6WxuSMurTga3iLgj1skDYcxOJpXRuMe_6aYEnjeEJI",
    other: {
      "naver-site-verification": "0e9b56689238a8589a6524533ccace085720959e",
    },
  },
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport: Viewport = {
  themeColor: "black",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <AnalyticsProvider>
          <GlobalLoadingProvider>
            <GlobalSpinner />
            <SiteHeaderServer />
            <Script
              id="json-ld"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <GoogleAnalytics />
            {children}
          </GlobalLoadingProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
