"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ProductFilters as ProductFiltersType,
  ProductsResponse,
  Product,
} from "@/types/product";
import { useState } from "react";

const LIMIT = 20;
const categoryMap: Record<string, string> = {
  top: "상의",
  bottom: "하의",
  outer: "아우터",
  onepiece: "원피스",
};

export default function CategoryProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<ProductFiltersType>({
    sortBy: "newest",
    showSoldOut: false,
  });
  const page = Number(searchParams.get("page")) || 1;
  const categorySlug = params?.slug as string;
  const categoryKo = categoryMap[categorySlug] || "";

  const { data, isLoading, error, refetch } = useQuery<ProductsResponse>({
    queryKey: ["products", filters, page, categoryKo],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
        category: categoryKo,
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
  });

  const allProducts = data?.products ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // 페이지 이동
  const handlePageChange = (newPage: number) => {
    router.push(`/category/${categorySlug}?page=${newPage}`);
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{categoryKo} 상품</h1>
        <p className="text-gray-600">
          총 {totalCount.toLocaleString()}개의 상품
        </p>
      </div>
      <div className="mb-8">
        <ProductFilters
          filters={filters}
          onFiltersChange={setFilters}
          products={allProducts}
        />
      </div>
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
            {allProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={`?page=${page - 1}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) handlePageChange(page - 1);
                      }}
                      aria-disabled={page === 1}
                    />
                  </PaginationItem>

                  {/* 첫 페이지 */}
                  {page > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href="?page=1"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(1);
                          }}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {page > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* 현재 페이지 기준 앞뒤 2개씩 */}
                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, idx) => {
                      const startPage = Math.max(
                        1,
                        Math.min(page - 2, totalPages - 4)
                      );
                      const pageNum = startPage + idx;

                      if (pageNum > totalPages) return null;

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href={`?page=${pageNum}`}
                            isActive={page === pageNum}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pageNum);
                            }}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  {/* 마지막 페이지 */}
                  {page < totalPages - 2 && (
                    <>
                      {page < totalPages - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href={`?page=${totalPages}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(totalPages);
                          }}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href={`?page=${page + 1}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) handlePageChange(page + 1);
                      }}
                      aria-disabled={page === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
