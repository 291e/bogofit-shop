"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Package, Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";

interface Cafe24AllProductsProps {
  initialProducts: Product[];
}

export function Cafe24AllProducts({ initialProducts }: Cafe24AllProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);

  // 반응형 열 개수 계산
  const getColumnsCount = () => {
    if (typeof window === "undefined") return 6; // SSR 기본값

    const width = window.innerWidth;
    if (width < 640) return 2; // 모바일: 2열
    if (width < 1024) return 3; // 태블릿: 3열
    return 6; // 데스크톱: 6열
  };

  const [columnsCount, setColumnsCount] = useState(getColumnsCount);

  // 윈도우 리사이즈 이벤트 처리
  useEffect(() => {
    const handleResize = () => {
      setColumnsCount(getColumnsCount());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 다음 페이지 데이터 로드 함수
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/products?page=${page + 1}&limit=${columnsCount}`
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      const newProducts = data.products || [];

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, columnsCount]);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
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
  }, [loadMoreProducts, hasMore, loading]);

  // 상품이 없는 경우 처리
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">표시할 상품이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">모든 상품</h2>
          </div>
          <div className="hidden sm:block h-6 w-px bg-gray-200" />
          <p className="hidden sm:block text-gray-600 text-sm">
            전체 상품을 둘러보세요
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
        >
          전체보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <MusinsaProductCard
            key={`${product.id}-${Math.random()}`} // 중복 키 방지
            product={product}
          />
        ))}
      </div>

      {/* 로딩 인디케이터 및 Observer 타겟 */}
      <div ref={observerRef} className="flex justify-center items-center py-8">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">상품을 불러오는 중...</span>
          </div>
        )}
        {!hasMore && !loading && (
          <div className="text-center text-gray-500">
            <p className="text-sm">모든 상품을 확인했습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
