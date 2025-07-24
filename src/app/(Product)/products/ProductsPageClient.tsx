"use client";

import { useSearchParams } from "next/navigation";
import MusinsaProductList from "@/components/product/MusinsaProductList";
import { ProductFilters } from "@/types/product";

export default function ProductsPageClient() {
  const searchParams = useSearchParams();

  // URL에서 검색 파라미터 추출
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sortBy =
    (searchParams.get("sortBy") as ProductFilters["sortBy"]) || "newest";
  const showSoldOut = searchParams.get("showSoldOut") === "true";

  // 필터 객체 구성
  const filters: ProductFilters = {
    search,
    category,
    sortBy,
    showSoldOut,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 검색 결과 헤더 */}
        {search && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              &lsquo;<span className="text-pink-600">{search}</span>&rsquo; 검색
              결과
            </h1>
            <p className="text-gray-600">
              찾으시는 상품이 없다면 다른 검색어로 시도해보세요.
            </p>
          </div>
        )}

        {/* 카테고리 헤더 */}
        {category && !search && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {getCategoryName(category)}
            </h1>
          </div>
        )}

        <MusinsaProductList showFilters={true} filters={filters} />
      </div>
    </div>
  );
}

// 카테고리 한글명 변환 함수
function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    top: "상의",
    bottom: "하의",
    outer: "아우터",
    onepiece: "원피스",
  };

  return categoryMap[category] || category;
}
