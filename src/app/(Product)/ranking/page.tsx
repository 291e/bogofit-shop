"use client";

import { useQuery } from "@tanstack/react-query";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, ProductFilters as ProductFiltersType } from "@/types/product";
import { useState } from "react";
import { BarChart3, Trophy, Flame, Star } from "lucide-react";
import { subCategoryMap, categoryMap } from "@/contents/Category/subCategories";

const LIMIT = 30;

// 메인 카테고리 4가지
const mainCategories = [
  { key: "top", label: "상의", koLabel: "상의" },
  { key: "bottom", label: "하의", koLabel: "하의" },
  { key: "outer", label: "아우터", koLabel: "아우터" },
  { key: "onepiece", label: "원피스", koLabel: "원피스" },
];

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"best" | "popular" | "review">(
    "best"
  );
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

  // 베스트 상품
  const { data: bestProducts = [], isLoading: bestLoading } = useQuery<
    Product[]
  >({
    queryKey: [
      "ranking",
      "best",
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

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("베스트 상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.products || [];
    },
  });

  // 인기 상품 (가격 높은 순)
  const { data: popularProducts = [], isLoading: popularLoading } = useQuery<
    Product[]
  >({
    queryKey: [
      "ranking",
      "popular",
      selectedMainCategory,
      selectedSubCategory,
      filters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        sortBy: "price_high",
      });

      // 카테고리 필터 적용
      if (categoryKo) params.append("category", categoryKo);
      if (selectedSubCategory) params.append("search", selectedSubCategory);

      // 추가 필터 적용
      if (filters.showSoldOut !== undefined)
        params.append("showSoldOut", filters.showSoldOut.toString());
      if (filters.minPrice)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("인기 상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.products || [];
    },
  });

  // 리뷰 많은 상품 (최신순)
  const { data: reviewProducts = [], isLoading: reviewLoading } = useQuery<
    Product[]
  >({
    queryKey: [
      "ranking",
      "review",
      selectedMainCategory,
      selectedSubCategory,
      filters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        sortBy: "newest",
      });

      // 카테고리 필터 적용
      if (categoryKo) params.append("category", categoryKo);
      if (selectedSubCategory) params.append("search", selectedSubCategory);

      // 추가 필터 적용
      if (filters.showSoldOut !== undefined)
        params.append("showSoldOut", filters.showSoldOut.toString());
      if (filters.minPrice)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("리뷰 상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.products || [];
    },
  });

  const getCurrentData = () => {
    switch (activeTab) {
      case "best":
        return { products: bestProducts, isLoading: bestLoading };
      case "popular":
        return { products: popularProducts, isLoading: popularLoading };
      case "review":
        return { products: reviewProducts, isLoading: reviewLoading };
      default:
        return { products: [], isLoading: false };
    }
  };

  const { products, isLoading } = getCurrentData();

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

  const getTabInfo = () => {
    switch (activeTab) {
      case "best":
        return {
          icon: <Trophy className="w-5 h-5" />,
          title: "베스트 상품",
          description: "가장 많이 판매된 인기 상품들을 확인해보세요.",
        };
      case "popular":
        return {
          icon: <Flame className="w-5 h-5" />,
          title: "프리미엄 상품",
          description: "높은 가격대의 프리미엄 상품들을 만나보세요.",
        };
      case "review":
        return {
          icon: <Star className="w-5 h-5" />,
          title: "최신 상품",
          description: "따끈따끈한 신상품들을 가장 먼저 만나보세요.",
        };
      default:
        return { icon: null, title: "", description: "" };
    }
  };

  const tabInfo = getTabInfo();

  return (
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-[#FF84CD]" />
          상품 랭킹
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          실시간 인기 상품과 베스트셀러를 한눈에 확인하세요
        </p>
      </div>

      {/* 탭 메뉴 */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("best")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "best"
                ? "border-[#FF84CD] text-[#FF84CD]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            베스트 상품
          </button>
          <button
            onClick={() => setActiveTab("popular")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "popular"
                ? "border-[#FF84CD] text-[#FF84CD]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Flame className="w-4 h-4 inline mr-2" />
            프리미엄 상품
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "review"
                ? "border-[#FF84CD] text-[#FF84CD]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            최신 상품
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
          products={products}
        />
      </div>

      {/* 탭 설명 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            {tabInfo.icon}
            {tabInfo.title}
          </h3>
          <p className="text-sm text-gray-600">{tabInfo.description}</p>
        </div>
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
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            랭킹 데이터가 없습니다
          </h3>
          <p className="text-gray-500">잠시 후 다시 시도해주세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {products.map((product: Product, index: number) => (
            <div key={product.id} className="relative">
              {/* 랭킹 번호 */}
              {index < 3 && (
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  {index + 1}
                </div>
              )}
              {index >= 3 && index < 10 && (
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  {index + 1}
                </div>
              )}
              <MusinsaProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* 업데이트 안내 */}
      {!isLoading && products.length > 0 && (
        <div className="mt-12 text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">📈 실시간 랭킹이 업데이트됩니다</p>
          <p className="text-sm text-gray-500">
            매일 새로운 랭킹 데이터로 업데이트되니 자주 확인해보세요!
          </p>
        </div>
      )}
    </div>
  );
}
