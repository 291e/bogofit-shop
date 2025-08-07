"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation"; // ← 추가
import { useAuthStore } from "@/store/auth.store";
import { AuthProvider } from "@/providers/AuthProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // Zustand 하이드레이션 처리
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  const pathname = usePathname();
  // /solution 또는 /business 경로에서는 헤더와 푸터를 숨김
  const isNoLayoutPage =
    pathname.startsWith("/solution") || pathname.startsWith("/business");

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50 to-pink-50">
        {/* /solution 또는 /business 경로가 아니면 Header, Footer 보임 */}
        {!isNoLayoutPage && <Header />}
        <main className="flex-1 w-full mx-auto">
          <div>{children}</div>
        </main>
        {!isNoLayoutPage && <Footer />}
      </div>
    </AuthProvider>
  );
}
