import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import MainLayout from "@/components/layout/mainLayout";
import { Providers } from "@/providers/ApolloProvider";

const inter = Inter({ subsets: ["latin"] });

const lineSeedKR = localFont({
  src: [
    {
      path: "./fonts/LINESeedKR-Th.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/LINESeedKR-Rg.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/LINESeedKR-Bd.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-line-seed-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "보고핏 샵(BOGOFIT SHOP) - AI 가상피팅 쇼핑몰, 내 몸에 딱 맞는 패션 추천",
  description: "다양한 브랜드와 상품을 한 곳에서!",
  keywords: [
    "쇼핑몰",
    "패션",
    "브랜드",
    "BOGOFIT",
    "온라인쇼핑",
    "보고핏",
    "보고핏쇼핑",
    "보고핏샵",
    "구매대행",
    "구매대행서비스",
    "명품",
    "가상피팅",
    "메타뱅크",
    "metabank",
    "bogofit",
    "bogofitshop",
  ],
  authors: [{ name: "BOGOFIT" }],
  metadataBase: new URL("https://shop.bogofit.kr"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://shop.bogofit.kr",
    siteName: "BOGOFIT SHOP",
    title: "BOGOFIT SHOP",
    description: "다양한 브랜드와 상품을 한 곳에서!",
    images: [
      {
        url: "/og.png",
        width: 600,
        height: 315,
        alt: "BOGOFIT SHOP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bogofit",
    title: "BOGOFIT SHOP",
    description: "다양한 브랜드와 상품을 한 곳에서!",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  verification: {
    other: {
      "naver-site-verification": "b903d57bde1cd284c21172ef3dfedf902e98f185",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        suppressHydrationWarning
        className={`${inter.className} ${lineSeedKR.variable}`}
      >
        <Providers>
          <QueryProvider>
            <MainLayout>{children}</MainLayout>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  );
}
