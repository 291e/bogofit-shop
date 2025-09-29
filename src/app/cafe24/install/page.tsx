"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings,
} from "lucide-react";

interface InstallState {
  isInstalling: boolean;
  isInstalled: boolean;
  error: string | null;
  installUrl: string | null;
}

export default function Cafe24InstallPage() {
  const [installState, setInstallState] = useState<InstallState>({
    isInstalling: false,
    isInstalled: false,
    error: null,
    installUrl: null,
  });

  const [mallId, setMallId] = useState("");

  useEffect(() => {
    // URL 파라미터에서 mall_id 및 error 확인
    const params = new URLSearchParams(window.location.search);
    const mallIdParam = params.get("mall_id");
    const errorParam = params.get("error");

    console.log("🔄 mallIdParam: ", mallIdParam);
    console.log("🔄 errorParam: ", errorParam);

    if (mallIdParam) {
      setMallId(mallIdParam);
    }

    if (errorParam) {
      setInstallState((prev) => ({
        ...prev,
        error: decodeURIComponent(errorParam),
      }));
    }
  }, []);

  const startInstallation = async () => {
    if (!mallId.trim()) {
      setInstallState((prev) => ({
        ...prev,
        error: "쇼핑몰 ID를 입력해주세요.",
      }));
      return;
    }

    setInstallState((prev) => ({
      ...prev,
      isInstalling: true,
      error: null,
    }));

    try {
      console.log("🔄 카페24 앱 설치 시작...");

      // OAuth 인증 URL로 리디렉션 (API 라우트 사용)
      const state = Buffer.from(JSON.stringify({ mallId })).toString(
        "base64url"
      );
      const authUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_CAFE24_CLIENT_ID}&state=${state}&redirect_uri=https://www.bogofit.kr/api/cafe24/oauth/callback&scope=mall.read_application,mall.write_application,mall.read_category,mall.write_category,mall.read_product,mall.write_product`;
      // const authUrl = `/api/cafe24/oauth/authorize?mall_id=${encodeURIComponent(
      //   mallId
      // )}`;

      console.log("✅ OAuth 인증 URL 생성 완료:", authUrl);

      // 설치 과정을 시작하기 위해 OAuth 인증으로 리디렉션
      window.location.href = authUrl;
    } catch (error) {
      console.error("❌ 카페24 앱 설치 실패:", error);

      setInstallState((prev) => ({
        ...prev,
        isInstalling: false,
        error:
          error instanceof Error
            ? error.message
            : "설치 중 오류가 발생했습니다.",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* 설치 헤더 */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <ShoppingBag className="h-16 w-16 text-blue-500" />
                <Settings className="h-6 w-6 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              🛍️ BOGOFIT Shop - Cafe24 앱 설치
            </CardTitle>
            <p className="text-gray-600 mt-2">
              AI 가상 피팅과 상품 연동을 위한 Cafe24 앱을 설치합니다.
            </p>
          </CardHeader>
        </Card>

        {/* 설치 진행 상태 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              설치 진행
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 쇼핑몰 ID 입력 */}
            <div>
              <label
                htmlFor="mallId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cafe24 쇼핑몰 ID
              </label>
              <input
                id="mallId"
                type="text"
                value={mallId}
                onChange={(e) => setMallId(e.target.value)}
                placeholder="예: yourmall"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={installState.isInstalling}
              />
              <p className="text-xs text-gray-500 mt-1">
                Cafe24 관리자 페이지 URL에서 확인할 수 있습니다. (예:
                yourmall.cafe24.com의 &apos;yourmall&apos; 부분)
              </p>
            </div>

            {/* 에러 메시지 */}
            {installState.error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">
                  {installState.error}
                </span>
              </div>
            )}

            {/* 설치 버튼 */}
            <Button
              onClick={startInstallation}
              disabled={installState.isInstalling || !mallId.trim()}
              className="w-full"
              size="lg"
            >
              {installState.isInstalling ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  설치 중...
                </>
              ) : (
                <>
                  <ExternalLink className="h-5 w-5 mr-2" />앱 설치 시작
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 설치 과정 안내 */}
        <Card>
          <CardHeader>
            <CardTitle>설치 과정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="text-gray-700">쇼핑몰 ID 확인</span>
                <Badge variant={mallId ? "default" : "secondary"}>
                  {mallId ? "완료" : "대기"}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="text-gray-700">Cafe24 OAuth 인증</span>
                <Badge variant="secondary">대기</Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="text-gray-700">권한 승인</span>
                <Badge variant="secondary">대기</Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <span className="text-gray-700">설치 완료</span>
                <Badge variant="secondary">대기</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 기능 소개 */}
        <Card>
          <CardHeader>
            <CardTitle>주요 기능</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">AI 가상 피팅</h4>
                  <p className="text-sm text-gray-600">
                    고객이 옷을 입어본 모습을 AI로 미리 확인할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    상품 자동 동기화
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cafe24 상품이 BOGOFIT Shop과 자동으로 동기화됩니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">고급 분석 도구</h4>
                  <p className="text-sm text-gray-600">
                    피팅 데이터와 고객 행동을 분석하여 판매를 최적화합니다.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 설정 도움말 */}
        <Card>
          <CardHeader>
            <CardTitle>설정 도움말</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>1. 환경변수 설정:</strong>
            </p>
            <div className="bg-gray-100 p-3 rounded-md font-mono text-xs">
              CAFE24_MALL_ID=&quot;your-mall-id&quot;
              <br />
              CAFE24_CLIENT_ID=&quot;your-client-id&quot;
              <br />
              CAFE24_CLIENT_SECRET=&quot;your-client-secret&quot;
              <br />
              NEXT_PUBLIC_BASE_URL=&quot;https://bogofit.kr&quot;
            </div>
            <p>
              <strong>2. 카페24 개발자센터 설정:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                리디렉션 URI:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  https://bogofit.kr/api/cafe24/oauth/callback
                </code>
              </li>
              <li>
                권한 스코프: mall.read_application, mall.write_application
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
