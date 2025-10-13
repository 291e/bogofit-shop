"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import MusinsaProductCard from "./MusinsaProductCard";
import ProductFilters from "./ProductFilters";
import {
  Product,
  ProductFilters as IProductFilters,
  ProductsResponse,
} from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

const LIMIT = 20;

interface MusinsaProductListProps {
  initialProducts?: Product[];
  filters?: IProductFilters;
  showFilters?: boolean;
}

export default function MusinsaProductList({
  initialProducts = [],
  filters: initialFilters = { sortBy: "newest", showSoldOut: false },
  showFilters = true,
}: MusinsaProductListProps) {
  const [filters, setFilters] = useState<IProductFilters>(initialFilters);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 무한 스크롤 쿼리
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["products-infinite", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: LIMIT.toString(),
      });

      if (filters.search) params.append("search", filters.search);
      if (filters.minPrice)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.showSoldOut !== undefined)
        params.append("showSoldOut", filters.showSoldOut.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("상품을 불러오지 못했습니다.");
      return res.json() as Promise<ProductsResponse>;
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });

  // 모든 상품 데이터 평탄화 및 중복 제거
  const allProducts = React.useMemo(() => {
    const merged = data?.pages.flatMap((page) => page.products) ?? initialProducts;
    
    // ID 기반 중복 제거 (title로 dedup하면 다른 상품이 같은 이름일 수 있음)
    const seenIds = new Set<number>();
    return merged.filter((product) => {
      if (seenIds.has(product.id)) {
        return false;
      }
      seenIds.add(product.id);
      return true;
    });
  }, [data?.pages, initialProducts]);
  
  const totalCount = data?.pages[0]?.total ?? 0;

  // Intersection Observer를 사용한 무한 스크롤
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500 py-20">
          상품을 불러오지 못했습니다.
          <button
            onClick={() => refetch()}
            className="block mx-auto mt-4 text-blue-500 underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-black">전체 상품</h1>
          <p className="text-gray-600">
            총 {totalCount.toLocaleString("ko-KR")}개의 상품
          </p>
        </div>

        {/* 필터 */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              products={allProducts}
            />
          </div>
        )}

        {/* 상품 그리드 */}
        {isLoading && allProducts.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <Skeleton className="aspect-[5/6] w-full" />
                <div className="p-2 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">검색 결과가 없습니다.</p>
            <button
              onClick={() =>
                setFilters({ sortBy: "newest", showSoldOut: false })
              }
              className="text-blue-500 underline"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <>
            {/* MUSINSA 스타일 상품 그리드 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
              {allProducts.map((product, index) => {
                // 마지막 상품에 ref 추가 (무한 스크롤 트리거)
                if (index === allProducts.length - 1) {
                  return (
                    <div key={product.id} ref={lastProductElementRef}>
                      <MusinsaProductCard
                        product={product}
                        className="hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  );
                }
                return (
                  <MusinsaProductCard
                    key={product.id}
                    product={product}
                    className="hover:scale-105 transition-transform duration-200"
                  />
                );
              })}
            </div>

            {/* 로딩 스피너 (다음 페이지 로딩 중) */}
            {isFetchingNextPage && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg overflow-hidden shadow-sm"
                  >
                    <Skeleton className="aspect-[5/6] w-full" />
                    <div className="p-2 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 더보기 버튼 (모바일에서 더 명확한 UX를 위해) */}
            {hasNextPage && !isFetchingNextPage && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => fetchNextPage()}
                  variant="outline"
                  size="lg"
                  className="bg-white hover:bg-gray-50 border-gray-300"
                >
                  상품 더보기
                </Button>
              </div>
            )}

            {/* 모든 상품 로드 완료 메시지 */}
            {!hasNextPage && allProducts.length > 0 && (
              <div className="text-center mt-8 py-8">
                <p className="text-gray-500">모든 상품을 확인했습니다.</p>
                <p className="text-sm text-gray-400 mt-1">
                  총 {allProducts.length}개의 상품
                </p>
              </div>
            )}
          </>
        )}

        {/* 맨 위로 가기 버튼 */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200"
            aria-label="맨 위로 가기"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
