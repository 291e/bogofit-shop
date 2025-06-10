import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import MainLayout from "@/components/layout/mainLayout";
import { Providers } from "@/providers/ApolloProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BOGOFIT SHOP",
  description: "다양한 브랜드와 상품을 한 곳에서!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          <QueryProvider>
            <MainLayout>{children}</MainLayout>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  );
}
