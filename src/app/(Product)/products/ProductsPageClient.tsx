"use client";

import { useSearchParams } from "next/navigation";
import MusinsaProductList from "@/components/product/MusinsaProductList";
import { ProductFilters } from "@/types/product";
import { useI18n } from "@/providers/I18nProvider";

export default function ProductsPageClient() {
  const { t } = useI18n();
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
              {t("product.search.resultsPrefix")} ‘
              <span className="text-pink-600">{search}</span>’ {t("product.search.resultsSuffix")}
            </h1>
            <p className="text-gray-600">{t("product.empty.tryAnother")}</p>
          </div>
        )}

        {/* 카테고리 헤더 */}
        {category && !search && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {getCategoryName(category, t)}
            </h1>
          </div>
        )}

        <MusinsaProductList showFilters={true} filters={filters} />
      </div>
    </div>
  );
}

// 카테고리 한글명 변환 함수
function getCategoryName(category: string, t: (k: string) => string): string {
  const categoryMap: Record<string, string> = {
    top: t("category.top"),
    bottom: t("category.bottom"),
    outer: t("category.outer"),
    onepiece: t("category.onepiece"),
  };

  return categoryMap[category] || category;
}
