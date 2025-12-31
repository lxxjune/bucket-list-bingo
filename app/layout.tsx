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
  title: "2026 New Year Bucket List Bingo",
  description: "Make your 2026 bucket list with a bingo game!",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} ${rem.variable} antialiased font-sans`}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
