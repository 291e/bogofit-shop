"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import Cafe24VirtualFitting from "@/components/product/Cafe24VirtualFitting";

export default function Cafe24SuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [productData, setProductData] = useState<{
    productTitle: string;
    productCategory: string;
    currentImage: string;
  } | null>(null);

  // 테스트용 상품 정보 가져오기
  useEffect(() => {
    const fetchTestProduct = async () => {
      try {
        // 실제 상품 번호로 테스트 (예: 1번 상품)
        const response = await fetch("/api/cafe24/product/1/fitting");

        if (!response.ok) {
          throw new Error("상품 정보를 가져올 수 없습니다");
        }

        const data = await response.json();
        setProductData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
        );
      } finally {
        setIsLoading(false);
      }
    };

    // 2초 후 테스트 실행
    setTimeout(fetchTestProduct, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 성공 메시지 */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-800">
                  카페24 연동 성공!
                </h1>
                <p className="text-green-600 mt-1">
                  카페24 쇼핑몰과 성공적으로 연결되었습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 기능 설명 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">NEW</Badge>
              사용 가능한 기능
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  📦 상품 정보 연동
                </h3>
                <p className="text-sm text-blue-600">
                  카페24 상품 정보를 자동으로 가져와서 가상 피팅에 활용
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">
                  🎯 AI 가상 피팅
                </h3>
                <p className="text-sm text-purple-600">
                  카페24 상품 이미지를 자동으로 적용하여 가상 피팅 실행
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  🔄 자동 카테고리 분류
                </h3>
                <p className="text-sm text-green-600">
                  상품 카테고리를 자동으로 분석하여 적절한 피팅 모드 선택
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">
                  📱 실시간 동기화
                </h3>
                <p className="text-sm text-orange-600">
                  카페24 상품 정보 변경 시 실시간으로 반영
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API 사용 예시 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API 사용 예시</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">단일 상품 정보 가져오기</h4>
                <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                  GET /api/cafe24/product/[productNo]/fitting
                </code>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">다중 상품 정보 가져오기</h4>
                <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                  POST /api/cafe24/product/[productNo]/fitting
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 가상 피팅 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle>가상 피팅 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">
                  카페24 상품 정보를 불러오는 중...
                </span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">오류가 발생했습니다</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => window.location.reload()}
                >
                  다시 시도
                </Button>
              </div>
            ) : productData ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    연동된 상품 정보
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>상품명:</strong> {productData.productTitle}
                    </p>
                    <p>
                      <strong>카테고리:</strong> {productData.productCategory}
                    </p>
                    <p>
                      <strong>이미지:</strong>{" "}
                      {productData.currentImage ? "✅ 사용 가능" : "❌ 없음"}
                    </p>
                  </div>
                </div>

                <Cafe24VirtualFitting
                  productTitle={productData.productTitle}
                  productCategory={productData.productCategory}
                  currentImage={productData.currentImage}
                />
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">테스트할 상품 정보가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 관리자 페이지 링크 */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => window.open("https://admin.cafe24.com", "_blank")}
            className="mr-4"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            카페24 관리자
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
