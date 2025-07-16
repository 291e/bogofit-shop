"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Crown, ChevronDown, ChevronUp } from "lucide-react";
import { Product } from "@/types/product";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Button } from "@/components/ui/button";

interface Cafe24FeaturedProductsProps {
  products: Product[];
}

export function Cafe24FeaturedProducts({
  products,
}: Cafe24FeaturedProductsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 반응형 첫 줄 개수 계산
  const getFirstRowCount = () => {
    if (typeof window === "undefined") return 6; // SSR 기본값

    const width = window.innerWidth;
    if (width < 640) return 2; // 모바일: 2열
    if (width < 1024) return 3; // 태블릿: 3열
    return 6; // 데스크톱: 6열
  };

  const [firstRowCount, setFirstRowCount] = useState(getFirstRowCount);

  // 윈도우 리사이즈 이벤트 처리
  React.useEffect(() => {
    const handleResize = () => {
      setFirstRowCount(getFirstRowCount());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 표시할 상품 계산
  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return isExpanded ? products : products.slice(0, firstRowCount);
  }, [products, isExpanded, firstRowCount]);

  const hasMoreProducts = products && products.length > firstRowCount;

  // 상품이 없는 경우 처리
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <p className="text-gray-500">추천 상품을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 추천 이유 배열 (랜덤으로 표시할 수 있도록)
  const recommendationReasons = [
    "취향저격 아이템",
    "인기 급상승",
    "회원님 맞춤",
    "이번주 PICK",
    "MD 추천",
    "트렌드 아이템",
    "스타일링 추천",
    "신상 추천",
  ];

  return (
    <div className="bg-white py-8">
      <div className="container mx-auto px-4">
        {/* 섹션 헤더 - MUSINSA 스타일 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-900">추천 상품</h2>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm text-gray-600 bg-purple-50 px-3 py-1 rounded-full">
                AI가 엄선한 맞춤 아이템
              </span>
            </div>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            전체보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {displayedProducts.map((product, index) => {
            const reason =
              recommendationReasons[index % recommendationReasons.length];

            return (
              <div key={product.id} className="relative">
                <MusinsaProductCard product={product} />

                {/* 추천 배지 */}
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                    추천
                  </div>
                </div>

                {/* 추천 이유 배지 */}
                <div className="absolute bottom-2 left-2 z-10">
                  <div className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded shadow">
                    {reason}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 더보기/접기 버튼 */}
        {hasMoreProducts && (
          <div className="flex justify-center">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              className="flex items-center gap-2 px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              {isExpanded ? (
                <>
                  접기
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  더보기
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* 개인화 추천 정보 섹션 */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">개인화 추천</h3>
          </div>
          <p className="text-sm text-gray-600">
            회원님의 취향과 최근 트렌드를 분석해 엄선한 상품들입니다. 더 많은
            맞춤 추천을 원하시면 관심 상품을 찜해보세요!
          </p>
        </div>
      </div>
    </div>
  );
}
