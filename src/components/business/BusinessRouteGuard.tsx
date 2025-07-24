"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BusinessRouteGuardProps {
  children: React.ReactNode;
}

export default function BusinessRouteGuard({
  children,
}: BusinessRouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // 컴포넌트 마운트 상태 체크
  useEffect(() => {
    setMounted(true);
  }, []);

  // 인증 상태 변화 감지 및 리다이렉트
  useEffect(() => {
    if (!mounted || isLoading) return;

    // 인증 체크가 완료된 후 처리
    const timeoutId = setTimeout(() => {
      setAuthCheckComplete(true);

      // 로그인하지 않은 경우
      if (!isAuthenticated) {
        router.push("/login?redirect=/business");
        return;
      }

      // 비즈니스 계정이 아닌 경우
      if (!user?.isBusiness) {
        router.push("/");
        return;
      }
    }, 100); // 100ms 대기로 비동기 처리 시간 확보

    return () => clearTimeout(timeoutId);
  }, [mounted, user, isLoading, isAuthenticated, router]);

  // 마운트되지 않았거나 로딩 중이거나 인증 체크가 완료되지 않은 경우
  if (!mounted || isLoading || !authCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 최종 권한 체크 (이미 리다이렉트 로직은 useEffect에서 처리됨)
  if (!isAuthenticated || !user?.isBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            접근 권한이 없습니다
          </h2>
          <p className="mt-2 text-gray-600">비즈니스 계정으로 로그인해주세요</p>
          <button
            onClick={() => router.push("/login?redirect=/business")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
