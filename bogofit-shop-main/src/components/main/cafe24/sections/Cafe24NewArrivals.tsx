"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Product } from "@/types/product";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/I18nProvider";

interface Cafe24NewArrivalsProps {
  products: Product[];
}

export function Cafe24NewArrivals({ products }: Cafe24NewArrivalsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useI18n();

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
          <p className="text-gray-500">{t("status.loadingProducts")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white py-10">
      {/* Decorative gradient lights */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-6 left-[10%] h-64 w-64 rounded-full bg-sky-300/20 blur-[90px]" />
        <div className="absolute top-12 right-[10%] h-72 w-72 rounded-full bg-teal-300/20 blur-[90px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-cyan-300/15 blur-[80px]" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* 섹션 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-sky-500 to-teal-500" />
              <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                <Sparkles className="h-5 w-5 text-sky-600" /> {t("nav.newArrivals")}
                <Sparkles className="h-4 w-4 text-teal-500" />
              </h2>
              <span className="hidden sm:inline-flex items-center text-xs sm:text-sm text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full">
                {t("hint.justIn")}
              </span>
            </div>
            <Link
              href="/products?sortBy=newest"
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-white/70 hover:border-gray-400 transition-colors shadow-sm backdrop-blur"
              aria-label="신상품 전체보기"
            >
              {t("cta.viewAll")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {displayedProducts.map((product, index) => (
            <div
              key={product.id}
              className="relative group rounded-xl transition-transform duration-200 hover:scale-[1.01]"
            >
              {/* NEW chip for top 3 */}
              {index < 3 && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-sky-700 shadow-sm border border-sky-100">
                    NEW
                  </span>
                </div>
              )}
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
              className="flex items-center gap-2 px-8 py-3 text-gray-800 border-gray-300 hover:bg-white/80 hover:border-gray-400 shadow-sm"
            >
              {isExpanded ? (
                <>
                  {t("cta.collapse")}
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  {t("cta.loadMore")}
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
