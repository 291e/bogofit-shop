"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BusinessSidebar from "@/components/business/BusinessSidebar";
import BusinessHeader from "@/components/business/BusinessHeader";

interface BusinessLayoutWrapperProps {
  children: React.ReactNode;
}

export default function BusinessLayoutWrapper({
  children,
}: BusinessLayoutWrapperProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authorized" | "unauthorized"
  >("loading");

  useEffect(() => {
    // 로딩이 완료된 후 권한 체크
    if (!isLoading) {
      const checkAuth = setTimeout(() => {
        if (!isAuthenticated) {
          setAuthStatus("unauthorized");
          router.push("/login?redirect=/business");
          return;
        }

        if (!user?.isBusiness) {
          setAuthStatus("unauthorized");
          router.push("/");
          return;
        }

        setAuthStatus("authorized");
      }, 50);

      return () => clearTimeout(checkAuth);
    }
  }, [user, isLoading, isAuthenticated, router]);

  // 로딩 중
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">비즈니스 대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 권한이 없는 경우
  if (authStatus === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">리다이렉트 중...</h2>
          <p className="mt-2 text-gray-600">권한을 확인하고 있습니다</p>
        </div>
      </div>
    );
  }

  // 권한이 있는 경우 비즈니스 레이아웃 렌더링
  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader />
      <div className="flex">
        <BusinessSidebar />
        <main className="flex-1 lg:ml-64">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
