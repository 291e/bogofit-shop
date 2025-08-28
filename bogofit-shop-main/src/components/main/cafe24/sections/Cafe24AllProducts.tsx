"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Package, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Product } from "@/types/product";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/I18nProvider";

interface Cafe24AllProductsProps {
  initialProducts: Product[];
}

export function Cafe24AllProducts({ initialProducts }: Cafe24AllProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(2); // 페이지 3부터 무한 스크롤 시작
  const LOAD_SIZE = 12; // 클릭당 추가 로드 개수 (6열 기준 2행)
  const { t } = useI18n();

  // Hydration 안전한 반응형 계산
  const [columnsCount, setColumnsCount] = useState(6); // 서버와 클라이언트 동일한 초기값

  useEffect(() => {
    const getColumnsCount = () => {
      const width = window.innerWidth;
      if (width < 640) return 2; // 모바일: 2열
      if (width < 1024) return 3; // 태블릿: 3열
      return 6; // 데스크톱: 6열
    };

    const updateColumnsCount = () => {
      setColumnsCount(getColumnsCount());
    };

    // 초기 설정
    updateColumnsCount();

    // 리사이즈 이벤트 처리
    window.addEventListener("resize", updateColumnsCount);
    return () => window.removeEventListener("resize", updateColumnsCount);
  }, []);

  // 다음 페이지 데이터 로드 함수
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/products?page=${page + 1}&limit=${LOAD_SIZE}`
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      const newProducts = data.products || [];

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        // 임시로 중복 제거 로직 비활성화 (무한 스크롤 테스트용)
        setProducts((prev) => {
          // 모든 새 상품을 추가 (중복 제거 없이)
          return [...prev, ...newProducts];
        });
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, columnsCount]);

  // 자동 무한 스크롤 제거, 버튼 클릭으로 로드하도록 변경

  // 상품이 없는 경우 처리
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">{t("status.noProducts")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-12">
      {/* Decorative gradient lights */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-6 left-[10%] h-72 w-72 rounded-full bg-sky-300/20 blur-[90px]" />
        <div className="absolute top-14 right-[10%] h-80 w-80 rounded-full bg-indigo-300/20 blur-[90px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-blue-300/15 blur-[80px]" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* 섹션 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-sky-500 to-indigo-500" />
              <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                <Package className="h-5 w-5 text-sky-600" /> {t("nav.allProducts")}
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </h2>
              <span className="hidden sm:inline-flex items-center text-xs sm:text-sm text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full">
                전체 상품을 둘러보세요
              </span>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-white/70 hover:border-gray-400 transition-colors shadow-sm backdrop-blur"
              aria-label="전체 상품 전체보기"
            >
              {t("cta.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="relative group rounded-xl transition-transform duration-200 hover:scale-[1.01]"
            >
              <MusinsaProductCard product={product} />
            </div>
          ))}
        </div>

        {/* 로딩/더보기 영역 */}
        <div className="flex justify-center items-center py-8">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">{t("status.loadingProducts")}</span>
            </div>
          ) : hasMore ? (
            <Button
              onClick={loadMoreProducts}
              variant="outline"
              className="flex items-center gap-2 px-8 py-3 text-gray-800 border-gray-300 hover:bg-white/80 hover:border-gray-400 shadow-sm"
            >
              {t("cta.loadMore")}
              <ChevronDown className="h-4 w-4" />
            </Button>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-sm">{t("status.allLoaded")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
