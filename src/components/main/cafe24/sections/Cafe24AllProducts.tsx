"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Package, Loader2, Sparkles } from "lucide-react";
import { Product } from "@/types/product";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { useI18n } from "@/providers/I18nProvider";

interface Cafe24AllProductsProps {
  initialProducts: Product[];
}

export function Cafe24AllProducts({ initialProducts }: Cafe24AllProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(2); // 페이지 3부터 무한 스크롤 시작
  const LOAD_SIZE = 12; // 스크롤당 추가 로드 개수 (6열 기준 2행)
  const { t } = useI18n();
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false); // Ref để track loading state

  // Hydration 안전한 반응형 계산 - removed unused code

  // Intersection Observer를 사용한 무한 스크롤
  useEffect(() => {
    const loadMoreProducts = async () => {
      if (loadingRef.current || !hasMore) return;

      loadingRef.current = true;
      setLoading(true);
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/products?page=${page}&limit=${LOAD_SIZE}`
        );

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        const newProducts = data.products || [];

        if (newProducts.length === 0) {
          setHasMore(false);
        } else {
          setProducts((prev) => {
            // 중복 제거 로직
            const existingIds = new Set(prev.map((p: Product) => p.id));
            const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id));
            return [...prev, ...uniqueNewProducts];
          });
          setPage((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error loading more products:", error);
        setHasMore(false);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore) {
          loadMoreProducts();
        }
      },
      {
        threshold: 0.5,
        rootMargin: '800px',
      }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [page, hasMore]); // Chỉ depend vào page và hasMore

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

        {/* 무한 스크롤 로딩 영역 */}
        <div ref={observerRef} className="flex justify-center items-center py-8">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">{t("status.loadingProducts")}</span>
            </div>
          ) : !hasMore ? (
            <div className="text-center text-gray-500">
              <p className="text-sm">{t("status.allLoaded")}</p>
            </div>
          ) : (
            <div className="h-8" /> // 공간 확보용
          )}
        </div>
      </div>
    </div>
  );
}
