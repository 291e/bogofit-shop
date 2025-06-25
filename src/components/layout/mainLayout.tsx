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
  // /solution 경로이거나, /solution/하위 경로도 모두 적용하려면 startsWith로 체크
  const isSolutionPage = pathname.startsWith("/solution");

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50 to-pink-50">
        {/* /solution 경로가 아니면 Header, Footer 보임 */}
        {!isSolutionPage && <Header />}
        <main className="flex-1 w-full mx-auto">
          <div>{children}</div>
        </main>
        {!isSolutionPage && <Footer />}
      </div>
    </AuthProvider>
  );
}
