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
import { useState } from "react";

const LIMIT = 30;
const categoryMap: Record<string, string> = {
  top: "상의",
  bottom: "하의",
  outer: "아우터",
  onepiece: "원피스",
};

// 세부 카테고리 데이터
const subCategoryMap: Record<
  string,
  Array<{ name: string; keyword: string; image: string }>
> = {
  top: [
    { name: "후드", keyword: "후드", image: "/images/categories/hood.jpg" },
    {
      name: "맨투맨",
      keyword: "맨투맨",
      image: "/images/categories/sweatshirt.jpg",
    },
    { name: "니트", keyword: "니트", image: "/images/categories/knit.jpg" },
    { name: "셔츠", keyword: "셔츠", image: "/images/categories/shirt.jpg" },
    {
      name: "긴소매티셔츠",
      keyword: "긴소매",
      image: "/images/categories/longsleeve.jpg",
    },
    {
      name: "블라우스",
      keyword: "블라우스",
      image: "/images/categories/blouse.jpg",
    },
    { name: "조끼", keyword: "조끼", image: "/images/categories/vest.jpg" },
    {
      name: "반소매티셔츠",
      keyword: "반소매",
      image: "/images/categories/shortsleeve.jpg",
    },
    {
      name: "민소매",
      keyword: "민소매",
      image: "/images/categories/sleeveless.jpg",
    },
    {
      name: "티셔츠",
      keyword: "티셔츠",
      image: "/images/categories/tshirt.jpg",
    },
  ],
  bottom: [
    {
      name: "청바지",
      keyword: "청바지",
      image: "/images/categories/jeans.jpg",
    },
    {
      name: "면바지",
      keyword: "면바지",
      image: "/images/categories/cotton-pants.jpg",
    },
    {
      name: "슬랙스",
      keyword: "슬랙스",
      image: "/images/categories/slacks.jpg",
    },
    {
      name: "조거팬츠",
      keyword: "조거",
      image: "/images/categories/jogger.jpg",
    },
    {
      name: "반바지",
      keyword: "반바지",
      image: "/images/categories/shorts.jpg",
    },
    {
      name: "레깅스",
      keyword: "레깅스",
      image: "/images/categories/leggings.jpg",
    },
    {
      name: "스커트",
      keyword: "스커트",
      image: "/images/categories/skirt.jpg",
    },
    {
      name: "트레이닝팬츠",
      keyword: "트레이닝",
      image: "/images/categories/training.jpg",
    },
  ],
  outer: [
    { name: "코트", keyword: "코트", image: "/images/categories/coat.jpg" },
    { name: "자켓", keyword: "자켓", image: "/images/categories/jacket.jpg" },
    { name: "패딩", keyword: "패딩", image: "/images/categories/padding.jpg" },
    { name: "점퍼", keyword: "점퍼", image: "/images/categories/jumper.jpg" },
    {
      name: "가디건",
      keyword: "가디건",
      image: "/images/categories/cardigan.jpg",
    },
    { name: "집업", keyword: "집업", image: "/images/categories/zipup.jpg" },
    {
      name: "블레이저",
      keyword: "블레이저",
      image: "/images/categories/blazer.jpg",
    },
    {
      name: "트렌치코트",
      keyword: "트렌치",
      image: "/images/categories/trench.jpg",
    },
  ],
  onepiece: [
    {
      name: "미니원피스",
      keyword: "미니",
      image: "/images/categories/mini-dress.jpg",
    },
    {
      name: "미디원피스",
      keyword: "미디",
      image: "/images/categories/midi-dress.jpg",
    },
    {
      name: "맥시원피스",
      keyword: "맥시",
      image: "/images/categories/maxi-dress.jpg",
    },
    {
      name: "셔츠원피스",
      keyword: "셔츠원피스",
      image: "/images/categories/shirt-dress.jpg",
    },
    {
      name: "니트원피스",
      keyword: "니트원피스",
      image: "/images/categories/knit-dress.jpg",
    },
    { name: "튜닉", keyword: "튜닉", image: "/images/categories/tunic.jpg" },
  ],
};

export default function CategoryProductsPage() {
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
              총 {totalCount.toLocaleString()}개의 상품
            </p>
          </div>
        </div>
        <div className="block sm:hidden">
          <p className="text-gray-600 text-xs">
            총 {totalCount.toLocaleString()}개의 상품
          </p>
        </div>
      </div>

      {/* 세부 카테고리 */}
      {subCategories.length > 0 && (
        <div className="mb-4 md:mb-6">
          <div className="overflow-x-auto overflow-y-hidden">
            <div
              className="flex justify-between pb-2 px-1"
              style={{ minWidth: "max-content" }}
            >
              {subCategories.map((subCategory) => (
                <button
                  key={subCategory.keyword}
                  onClick={() => handleSubCategoryClick(subCategory.keyword)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 md:gap-2 p-2 md:p-3 rounded-lg transition-all duration-200 touch-manipulation ${
                    selectedSubCategory === subCategory.keyword
                      ? "bg-blue-50 border-2 border-blue-200 scale-95 md:scale-100"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 active:scale-95"
                  }`}
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 lg:w-18 lg:h-18 bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-xs md:text-sm text-gray-500 font-medium">
                        {subCategory.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs md:text-sm font-medium leading-tight text-center max-w-[60px] md:max-w-[80px] truncate ${
                      selectedSubCategory === subCategory.keyword
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {subCategory.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
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
                검색 결과가 없습니다
              </p>
              <p className="text-gray-500 text-sm mb-3 md:mb-4 leading-relaxed">
                다른 검색어나 필터를 시도해보세요
              </p>
            </div>
            <button
              onClick={() => {
                setFilters({ sortBy: "newest", showSoldOut: false });
                setSelectedSubCategory("");
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium touch-manipulation"
            >
              필터 초기화
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
