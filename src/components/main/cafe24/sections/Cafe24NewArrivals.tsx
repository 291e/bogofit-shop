"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Product } from "@/types/product";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Button } from "@/components/ui/button";

interface Cafe24NewArrivalsProps {
  products: Product[];
}

export function Cafe24NewArrivals({ products }: Cafe24NewArrivalsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Hydration 안전한 반응형 계산
  const [firstRowCount, setFirstRowCount] = useState(6); // 서버와 클라이언트 동일한 초기값

  React.useEffect(() => {
    const getFirstRowCount = () => {
      const width = window.innerWidth;
      if (width < 640) return 2; // 모바일: 2열
      if (width < 1024) return 3; // 태블릿: 3열
      return 6; // 데스크톱: 6열
    };

    const updateFirstRowCount = () => {
      setFirstRowCount(getFirstRowCount());
    };

    // 초기 설정
    updateFirstRowCount();

    // 리사이즈 이벤트 처리
    window.addEventListener("resize", updateFirstRowCount);
    return () => window.removeEventListener("resize", updateFirstRowCount);
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
          <p className="text-gray-500">신상품을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8">
      <div className="container mx-auto px-4">
        {/* 섹션 헤더 - MUSINSA 스타일 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">신상품</h2>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                방금 입고된 따끈따끈한 아이템
              </span>
            </div>
          </div>
          <Link
            href="/products?sortBy=newest"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            전체보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {displayedProducts.map((product) => (
            <div key={product.id} className="relative">
              <MusinsaProductCard product={product} />
            </div>
          ))}
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
      </div>
    </div>
  );
}
