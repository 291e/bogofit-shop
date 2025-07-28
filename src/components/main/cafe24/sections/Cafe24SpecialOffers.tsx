"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Product } from "@/types/product";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Button } from "@/components/ui/button";

interface Cafe24SpecialOffersProps {
  products: Product[];
}

export function Cafe24SpecialOffers({ products }: Cafe24SpecialOffersProps) {
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
          <p className="text-gray-500">특가 상품을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 py-8">
      <div className="container mx-auto px-4">
        {/* 섹션 헤더 - MUSINSA 스타일 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">특가 상품</h2>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm text-gray-600 bg-red-100 px-3 py-1 rounded-full">
                놓치면 후회하는 특가
              </span>
            </div>
          </div>
          <Link
            href="/products?sortBy=price_low"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            전체보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {displayedProducts.map((product) => {
            return (
              <div key={product.id} className="relative">
                <MusinsaProductCard product={product} />
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
      </div>
    </div>
  );
}
