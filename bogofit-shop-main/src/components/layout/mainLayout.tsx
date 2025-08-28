"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/providers/AuthProvider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  // /solution 또는 /business 경로에서는 헤더와 푸터를 숨김
  const isNoLayoutPage =
    pathname.startsWith("/solution") ||
    pathname.startsWith("/business") ||
    pathname.startsWith("/admin");

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
