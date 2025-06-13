"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import {
  ProductFilters as IProductFilters,
  ProductsResponse,
} from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

const LIMIT = 20;

export default function ProductsPage() {
  const [filters, setFilters] = useState<IProductFilters>({
    sortBy: "newest",
    showSoldOut: false, // 기본적으로 품절 상품 숨김
  });
  const { ref, inView } = useInView();

  // 상품 목록 조회
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["products", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams({
        page: pageParam.toString(),
        limit: LIMIT.toString(),
      });

      // 필터 파라미터 추가
      if (filters.search) searchParams.append("search", filters.search);
      if (filters.category) searchParams.append("category", filters.category);
      if (filters.minPrice)
        searchParams.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice)
        searchParams.append("maxPrice", filters.maxPrice.toString());
      if (filters.sortBy) searchParams.append("sortBy", filters.sortBy);
      if (filters.showSoldOut !== undefined)
        searchParams.append("showSoldOut", filters.showSoldOut.toString());

      const res = await fetch(`/api/products?${searchParams.toString()}`);
      if (!res.ok) throw new Error("상품을 불러오지 못했습니다.");
      return res.json() as Promise<ProductsResponse>;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // 무한 스크롤
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 필터 변경 시 데이터 새로고침
  const handleFiltersChange = (newFilters: IProductFilters) => {
    setFilters(newFilters);
  };

  const allProducts = data?.pages.flatMap((page) => page.products) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

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
    <div className="container mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">전체 상품</h1>
        <p className="text-gray-600">
          총 {totalCount.toLocaleString()}개의 상품
        </p>
      </div>

      {/* 필터 */}
      <div className="mb-8">
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* 상품 그리드 */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 20 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm p-4 space-y-3"
            >
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : allProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">검색 결과가 없습니다.</p>
          <button
            onClick={() => setFilters({ sortBy: "newest", showSoldOut: false })}
            className="text-blue-500 underline"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 무한 스크롤 트리거 */}
          <div ref={ref} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>더 많은 상품을 불러오는 중...</span>
              </div>
            )}
            {!hasNextPage && allProducts.length > 0 && (
              <p className="text-gray-500">모든 상품을 확인했습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
