"use client";

import { useQuery } from "@tanstack/react-query";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, ProductFilters as ProductFiltersType } from "@/types/product";
import { useState } from "react";
import { Target, Bot, Sparkles } from "lucide-react";
import { subCategoryMap, categoryMap } from "@/contents/Category/subCategories";

const LIMIT = 30;

// 메인 카테고리 4가지
const mainCategories = [
  { key: "top", label: "상의", koLabel: "상의" },
  { key: "bottom", label: "하의", koLabel: "하의" },
  { key: "outer", label: "아우터", koLabel: "아우터" },
  { key: "onepiece", label: "원피스", koLabel: "원피스" },
];

export default function RecommendPage() {
  const [activeTab, setActiveTab] = useState<"ai" | "editor">("ai");
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [filters, setFilters] = useState<ProductFiltersType>({
    sortBy: "newest",
    showSoldOut: false,
  });

  // 선택된 메인 카테고리의 세부 카테고리들
  const subCategories = selectedMainCategory
    ? subCategoryMap[selectedMainCategory] || []
    : [];
  const categoryKo = selectedMainCategory
    ? categoryMap[selectedMainCategory] || ""
    : "";

  // AI 추천 상품 (랜덤)
  const { data: aiProducts = [], isLoading: aiLoading } = useQuery<Product[]>({
    queryKey: [
      "recommend",
      "ai",
      selectedMainCategory,
      selectedSubCategory,
      filters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        badge: "BEST",
      });

      // 카테고리 필터 적용
      if (categoryKo) params.append("category", categoryKo);
      if (selectedSubCategory) params.append("search", selectedSubCategory);

      // 필터 적용
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.showSoldOut !== undefined)
        params.append("showSoldOut", filters.showSoldOut.toString());
      if (filters.minPrice)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());

      // 랜덤 파라미터는 필터가 없을 때만 적용
      if (
        !categoryKo &&
        !selectedSubCategory &&
        !filters.minPrice &&
        !filters.maxPrice
      ) {
        params.append("random", LIMIT.toString());
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("AI 추천 상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.products || [];
    },
  });

  // 에디터 추천 상품 (신상품)
  const { data: editorProducts = [], isLoading: editorLoading } = useQuery<
    Product[]
  >({
    queryKey: [
      "recommend",
      "editor",
      selectedMainCategory,
      selectedSubCategory,
      filters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        badge: "NEW",
      });

      // 카테고리 필터 적용
      if (categoryKo) params.append("category", categoryKo);
      if (selectedSubCategory) params.append("search", selectedSubCategory);

      // 필터 적용
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.showSoldOut !== undefined)
        params.append("showSoldOut", filters.showSoldOut.toString());
      if (filters.minPrice)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("에디터 추천 상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.products || [];
    },
  });

  const currentProducts = activeTab === "ai" ? aiProducts : editorProducts;
  const isLoading = activeTab === "ai" ? aiLoading : editorLoading;

  // 메인 카테고리 선택 핸들러
  const handleMainCategoryClick = (categoryKey: string) => {
    if (selectedMainCategory === categoryKey) {
      // 이미 선택된 카테고리를 클릭하면 해제
      setSelectedMainCategory("");
      setSelectedSubCategory("");
    } else {
      // 새로운 카테고리 선택
      setSelectedMainCategory(categoryKey);
      setSelectedSubCategory(""); // 세부 카테고리 초기화
    }
  };

  // 세부 카테고리 선택 핸들러
  const handleSubCategoryClick = (keyword: string) => {
    if (selectedSubCategory === keyword) {
      // 이미 선택된 카테고리를 클릭하면 해제
      setSelectedSubCategory("");
    } else {
      // 새로운 카테고리 선택
      setSelectedSubCategory(keyword);
    }
  };

  return (
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="w-8 h-8 text-[#FF84CD]" />
          추천 상품
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          당신만을 위한 특별한 상품을 추천해드립니다
        </p>
      </div>

      {/* 탭 메뉴 */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "ai"
                ? "border-[#FF84CD] text-[#FF84CD]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bot className="w-4 h-4 inline mr-2" />
            AI 추천
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "editor"
                ? "border-[#FF84CD] text-[#FF84CD]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            에디터 추천
          </button>
        </div>
      </div>

      {/* 메인 카테고리 선택 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          카테고리 선택
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mainCategories.map((category) => (
            <button
              key={category.key}
              onClick={() => handleMainCategoryClick(category.key)}
              className={`h-12 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                selectedMainCategory === category.key
                  ? "border-[#FF84CD] bg-[#FF84CD] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-[#FF84CD] hover:bg-pink-50"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* 세부 카테고리 선택 */}
      {subCategories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            세부 카테고리
          </h3>
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
                {subCategory.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="mb-6">
        <ProductFilters
          filters={filters}
          onFiltersChange={setFilters}
          products={currentProducts}
        />
      </div>

      {/* 탭 설명 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
        {activeTab === "ai" ? (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI가 선별한 맞춤 상품
            </h3>
            <p className="text-sm text-gray-600">
              머신러닝 알고리즘이 분석한 인기 트렌드와 베스트셀러 상품들을
              추천해드립니다.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              패션 에디터가 엄선한 신상품
            </h3>
            <p className="text-sm text-gray-600">
              패션 전문가들이 직접 선별한 최신 트렌드 아이템들을 만나보세요.
            </p>
          </div>
        )}
      </div>

      {/* 상품 그리드 */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: LIMIT }).map((_, idx) => (
            <div key={idx} className="space-y-2 md:space-y-3">
              <Skeleton className="aspect-[5/6] w-full rounded-lg" />
              <Skeleton className="h-3 md:h-4 w-3/4" />
              <Skeleton className="h-3 md:h-4 w-1/2" />
              <Skeleton className="h-4 md:h-5 w-2/3" />
            </div>
          ))}
        </div>
      ) : currentProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            추천 상품이 없습니다
          </h3>
          <p className="text-gray-500">잠시 후 다시 시도해주세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {currentProducts.map((product: Product) => (
            <MusinsaProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 더보기 안내 */}
      {!isLoading && currentProducts.length > 0 && (
        <div className="mt-12 text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">더 많은 상품을 원하시나요?</p>
          <p className="text-sm text-gray-500">
            카테고리별 상품을 둘러보시거나 검색을 이용해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
