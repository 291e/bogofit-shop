"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

function Cafe24ErrorContent() {
  const [error, setError] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const errorParam = searchParams.get("error");
    setError(errorParam || "알 수 없는 오류가 발생했습니다");
  }, [searchParams]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "missing_code":
        return "인증 코드가 누락되었습니다. 다시 시도해주세요.";
      case "invalid_request":
        return "잘못된 요청입니다. 클라이언트 설정을 확인해주세요.";
      case "access_denied":
        return "액세스가 거부되었습니다. 관리자 권한으로 로그인해주세요.";
      case "invalid_scope":
        return "요청한 권한이 잘못되었습니다. 앱 설정을 확인해주세요.";
      default:
        return error;
    }
  };

  const handleRetry = () => {
    window.location.href = "/api/cafe24/oauth/authorize";
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Cafe24 인증 실패
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p className="font-medium mb-2">해결 방법:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>
                환경 변수(CAFE24_MALL_ID, CAFE24_CLIENT_ID,
                CAFE24_CLIENT_SECRET)가 올바르게 설정되었는지 확인
              </li>
              <li>Cafe24 Developers Admin에서 앱 설정 확인</li>
              <li>리디렉션 URI가 올바르게 등록되었는지 확인</li>
              <li>관리자 권한이 있는 계정으로 로그인했는지 확인</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              문제가 지속되면 개발자에게 문의하세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Cafe24 인증 실패
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              페이지를 불러오는 중 오류가 발생했습니다.
            </p>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Cafe24ErrorPage() {
  return (
    <Suspense fallback={<ErrorFallback />}>
      <Cafe24ErrorContent />
    </Suspense>
  );
}
