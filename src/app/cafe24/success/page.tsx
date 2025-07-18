"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  TestTube,
} from "lucide-react";

interface ApiTestResult {
  success: boolean;
  message?: string;
  data?: {
    hasAccessToken: boolean;
    productsCount: number;
    products: Array<{
      product_no: number;
      product_name: string;
      product_code: string;
    }>;
    productDetail?: {
      product_no: number;
      product_name: string;
      product_code: string;
      description?: string;
    };
  };
  error?: string;
  authUrl?: string;
}

export default function Cafe24SuccessPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);

  const runApiTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log("🔄 Cafe24 API 테스트 시작...");

      const response = await fetch("/api/cafe24/test");
      const result: ApiTestResult = await response.json();

      console.log("✅ API 테스트 완료:", result);
      setTestResult(result);
    } catch (error) {
      console.error("❌ API 테스트 실패:", error);
      setTestResult({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "API 테스트 중 오류가 발생했습니다",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 자동으로 API 테스트 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      runApiTest();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* 성공 헤더 */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              🎉 Cafe24 OAuth 인증 성공!
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Cafe24 API에 성공적으로 연결되었습니다.
            </p>
          </CardHeader>
        </Card>

        {/* API 테스트 결과 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                API 연결 테스트
              </CardTitle>
              <Button
                onClick={runApiTest}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                다시 테스트
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">API 테스트 중...</span>
              </div>
            )}

            {testResult && !isLoading && (
              <div className="space-y-4">
                {/* 테스트 결과 상태 */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={testResult.success ? "default" : "destructive"}
                  >
                    {testResult.success ? "성공" : "실패"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {testResult.message || testResult.error}
                  </span>
                </div>

                {/* 성공한 경우 데이터 표시 */}
                {testResult.success && testResult.data && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-800">
                          액세스 토큰
                        </h4>
                        <p className="text-sm text-green-600">
                          {testResult.data.hasAccessToken
                            ? "✅ 유효"
                            : "❌ 없음"}
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800">상품 개수</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          {testResult.data.productsCount}
                        </p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-medium text-purple-800">
                          API 상태
                        </h4>
                        <p className="text-sm text-purple-600">✅ 정상 작동</p>
                      </div>
                    </div>

                    {/* 상품 목록 */}
                    {testResult.data.products.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">
                          상품 목록 (최대 5개)
                        </h4>
                        <div className="bg-white border rounded-lg divide-y">
                          {testResult.data.products.map((product) => (
                            <div
                              key={product.product_no}
                              className="p-3 flex justify-between items-center"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {product.product_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  코드: {product.product_code}
                                </p>
                              </div>
                              <Badge variant="outline">
                                #{product.product_no}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 상품 상세 정보 */}
                    {testResult.data.productDetail && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">
                          상품 상세 정보 테스트
                        </h4>
                        <div className="bg-white border rounded-lg p-4">
                          <h5 className="font-medium text-gray-900">
                            {testResult.data.productDetail.product_name}
                          </h5>
                          <p className="text-sm text-gray-500 mt-1">
                            코드: {testResult.data.productDetail.product_code}
                          </p>
                          {testResult.data.productDetail.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                              {testResult.data.productDetail.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 실패한 경우 에러 표시 */}
                {!testResult.success && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">오류 정보</h4>
                    <p className="text-sm text-red-600">{testResult.error}</p>
                    {testResult.authUrl && (
                      <div className="mt-3">
                        <Button
                          onClick={() =>
                            (window.location.href = testResult.authUrl!)
                          }
                          variant="outline"
                          size="sm"
                        >
                          다시 인증하기
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 다음 단계 안내 */}
        <Card>
          <CardHeader>
            <CardTitle>다음 단계</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </span>
              <span className="text-gray-700">Virtual Fitting 기능 테스트</span>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                테스트하기
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </span>
              <span className="text-gray-700">제품 카탈로그 동기화</span>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                동기화
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </span>
              <span className="text-gray-700">메인 사이트로 돌아가기</span>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="default"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
