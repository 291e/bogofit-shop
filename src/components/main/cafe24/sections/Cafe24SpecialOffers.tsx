"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { Product } from "@/types/product";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/I18nProvider";

interface Cafe24SpecialOffersProps {
  products: Product[];
}

export function Cafe24SpecialOffers({ products }: Cafe24SpecialOffersProps) {
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
    console.log("⚡ SpecialOffers - Total products:", products.length, "FirstRowCount:", firstRowCount, "IsExpanded:", isExpanded);
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
    <div className="relative overflow-hidden py-10 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50">
      {/* Decorative gradient lights */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-6 left-[10%] h-64 w-64 rounded-full bg-rose-300/20 blur-[90px]" />
        <div className="absolute top-10 right-[10%] h-72 w-72 rounded-full bg-orange-300/20 blur-[90px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-amber-300/15 blur-[80px]" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-600 to-amber-500">
                {t("nav.specialOffers")}
              </h2>
            </div>
            <div className="hidden sm:block">
              <span className="rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-sm text-rose-700">
                {t("hint.dontMissDeal")}
              </span>
            </div>
          </div>
          <Link
            href="/products?sortBy=price_low"
            className="group flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            {t("cta.viewAll")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Accent bar */}
        <div className="mb-5 h-1 w-16 rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400" />

        {/* Product grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {displayedProducts.map((product, idx) => {
            const isHot = idx < 3; // top 3 highlighted
            return (
              <div
                key={product.id}
                className="group relative rounded-lg transition-transform duration-200 ease-out hover:scale-[1.01]"
              >
                {isHot && (
                  <div className="absolute left-2 top-2 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                      <Zap className="h-3.5 w-3.5" /> {t("badge.hot")}
                    </span>
                  </div>
                )}
                <MusinsaProductCard product={product} />
              </div>
            );
          })}
        </div>

        {/* Toggle button */}
        {hasMoreProducts && (
          <div className="flex justify-center">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              className="flex items-center gap-2 border-rose-200 px-8 py-3 text-gray-700 transition-colors hover:bg-rose-50"
            >
        {isExpanded ? (
                <>
          {t("cta.collapse")}
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
          {t("cta.loadMore")}
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
