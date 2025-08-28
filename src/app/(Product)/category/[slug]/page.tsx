"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
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
import { subCategoryMap, categoryMap } from "@/contents/Category/subCategories";
import { useState } from "react";
import { useI18n } from "@/providers/I18nProvider";

const LIMIT = 30;

export default function CategoryProductsPage() {
  const { t } = useI18n();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<ProductFiltersType>({
    sortBy: "newest",
    showSoldOut: false,
  });
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const page = Number(searchParams.get("page")) || 1;
  const categorySlug = params?.slug as string;
  const categoryKo = categoryMap[categorySlug] || "";
  const subCategories = subCategoryMap[categorySlug] || [];

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
  if (!res.ok) throw new Error(t("product.errors.fetchProducts"));
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

  // 세부 카테고리 선택
  const handleSubCategoryClick = (keyword: string) => {
    if (selectedSubCategory === keyword) {
      // 이미 선택된 카테고리를 클릭하면 해제
      setSelectedSubCategory("");
      setFilters((prev) => ({ ...prev, search: "" }));
    } else {
      // 새로운 카테고리 선택
      setSelectedSubCategory(keyword);
      setFilters((prev) => ({ ...prev, search: keyword }));
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500 py-20">
          {t("product.errors.fetchProducts")}
          <button
            onClick={() => refetch()}
            className="block mx-auto mt-4 text-blue-500 underline"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
      {/* MUSINSA 스타일 헤더 */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {categoryKo}
            </h1>
            <div className="hidden sm:block h-4 md:h-6 w-px bg-gray-200" />
            <p className="hidden sm:block text-gray-600 text-xs md:text-sm">
              {t("product.category.totalPrefix")}
              {totalCount.toLocaleString()}
              {t("product.category.totalSuffix")}
            </p>
          </div>
        </div>
        <div className="block sm:hidden">
          <p className="text-gray-600 text-xs">
            {t("product.category.totalPrefix")}
            {totalCount.toLocaleString()}
            {t("product.category.totalSuffix")}
          </p>
        </div>
      </div>

      {/* 세부 카테고리 - Figma 디자인 적용 */}
      {subCategories.length > 0 && (
        <div className="mb-4 md:mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0">
      {subCategories.map((subCategory) => (
              <button
                key={subCategory.keyword}
                onClick={() => handleSubCategoryClick(subCategory.keyword)}
                className={`h-[50px] border border-[#e5e6e8] text-sm font-normal text-[#000c22] transition-all duration-200 hover:bg-[#f9cfb7] active:scale-95 cursor-pointer line-seed-kr ${
                  selectedSubCategory === subCategory.keyword
                    ? "bg-[#ff84cd] text-white"
                    : "bg-white"
                }`}
              >
        {"nameKey" in subCategory ? t((subCategory as any).nameKey) : (subCategory as any).name}
              </button>
            ))}
          </div>

          {/* 선택된 카테고리 정보 (모바일용) */}
          {selectedSubCategory && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 sm:hidden">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {t("product.category.selected")}:{" "}
                  <span className="font-medium text-[#000c22]">
                    {selectedSubCategory}
                  </span>
                </span>
                <button
                  onClick={() => {
                    setSelectedSubCategory("");
                    setFilters((prev) => ({ ...prev, search: "" }));
                  }}
                  className="text-xs text-gray-500 hover:text-red-600 underline"
                >
                  {t("common.reset")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 필터 */}
      <div className="mb-4 md:mb-6">
        <ProductFilters
          filters={filters}
          onFiltersChange={setFilters}
          products={allProducts}
        />
      </div>

      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 30 }).map((_, idx) => (
            <div key={idx} className="space-y-2 md:space-y-3">
              <Skeleton className="aspect-[5/6] w-full rounded-lg" />
              <Skeleton className="h-3 md:h-4 w-3/4" />
              <Skeleton className="h-3 md:h-4 w-1/2" />
              <Skeleton className="h-4 md:h-5 w-2/3" />
            </div>
          ))}
        </div>
      ) : allProducts.length === 0 ? (
        <div className="text-center py-12 md:py-20 px-4">
          <div className="flex flex-col items-center gap-3 md:gap-4 max-w-sm mx-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-lg md:text-2xl">😔</span>
            </div>
            <div className="text-center">
              <p className="text-gray-900 font-medium text-base md:text-lg mb-1 md:mb-2">
                {t("product.empty.noResults")}
              </p>
              <p className="text-gray-500 text-sm mb-3 md:mb-4 leading-relaxed">
                {t("product.empty.tryAnother")}
              </p>
            </div>
            <button
              onClick={() => {
                setFilters({ sortBy: "newest", showSoldOut: false });
                setSelectedSubCategory("");
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium touch-manipulation"
            >
              {t("common.resetFilters")}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* MUSINSA 스타일 상품 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {allProducts.map((product: Product) => (
              <MusinsaProductCard key={product.id} product={product} />
            ))}
          </div>
          {/* MUSINSA 스타일 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-8 md:mt-12 flex justify-center px-4">
              <div className="flex items-center gap-1 md:gap-2">
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        href={`?page=${page - 1}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) handlePageChange(page - 1);
                        }}
                        className={`h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm touch-manipulation ${
                          page === 1
                            ? "text-gray-400 cursor-not-allowed hover:bg-transparent hover:text-gray-400"
                            : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                        }`}
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
                            className="h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {page > 4 && (
                          <PaginationItem>
                            <PaginationEllipsis className="h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm text-gray-400" />
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

                        const isActive = page === pageNum;

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href={`?page=${pageNum}`}
                              isActive={isActive}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(pageNum);
                              }}
                              className={`h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm font-medium touch-manipulation ${
                                isActive
                                  ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                                  : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                              }`}
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
                            <PaginationEllipsis className="h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm text-gray-400" />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href={`?page=${totalPages}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(totalPages);
                            }}
                            className="h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
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
                        className={`h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm touch-manipulation ${
                          page === totalPages
                            ? "text-gray-400 cursor-not-allowed hover:bg-transparent hover:text-gray-400"
                            : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                        }`}
                        aria-disabled={page === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
