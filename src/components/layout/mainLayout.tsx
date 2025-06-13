"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { AuthProvider } from "@/providers/AuthProvider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // Zustand 하이드레이션 처리
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-50 to-pink-50">
        <Header />
        <main className="flex-1 w-full mx-auto">
          <div>{children}</div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
