import type { Metadata } from "next";
import { Noto_Sans_KR, Rubik_Mono_One } from "next/font/google";
import Script from "next/script";
import { GA_TRACKING_ID } from "@/lib/analytics";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

const rubik = Rubik_Mono_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "2026 New Year Bucket List Bingo",
  description: "Make your 2026 bucket list with a bingo game!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
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
              gtag('config', '${GA_TRACKING_ID}');
            `,
          }}
        />
      </head>
      <body className={`${notoSansKr.variable} ${rubik.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
