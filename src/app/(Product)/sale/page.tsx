"use client";

import { useQuery } from "@tanstack/react-query";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, ProductFilters as ProductFiltersType } from "@/types/product";
import { useState } from "react";
import {
  ShoppingBag,
  Flame,
  Clock,
  PartyPopper,
  DollarSign,
} from "lucide-react";
import { subCategoryMap, categoryMap } from "@/contents/Category/subCategories";
import { useI18n } from "@/providers/I18nProvider";

const LIMIT = 30;

// 메인 카테고리 4가지
const mainCategories = [
  { key: "top", label: "category.top", koLabel: "상의" },
  { key: "bottom", label: "category.bottom", koLabel: "하의" },
  { key: "outer", label: "category.outer", koLabel: "아우터" },
  { key: "onepiece", label: "category.onepiece", koLabel: "원피스" },
];

export default function SalePage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"hot" | "today" | "weekend">(
    "hot"
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

  // 핫딜 상품 (베스트 + 랜덤)
  const { data: hotProducts = [], isLoading: hotLoading } = useQuery<Product[]>(
    {
      queryKey: [
        "sale",
        "hot",
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
  if (!res.ok) throw new Error(t("product.errors.fetchProducts"));
        const data = await res.json();
        return data.products || [];
      },
    }
  );

  // 오늘의 딜 (신상품)
  const { data: todayProducts = [], isLoading: todayLoading } = useQuery<
    Product[]
  >({
    queryKey: [
      "sale",
      "today",
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
  if (!res.ok) throw new Error(t("product.errors.fetchProducts"));
      const data = await res.json();
      return data.products || [];
    },
  });

  // 주말 특가 (가격 낮은 순)
  const { data: weekendProducts = [], isLoading: weekendLoading } = useQuery<
    Product[]
  >({
    queryKey: [
      "sale",
      "weekend",
      selectedMainCategory,
      selectedSubCategory,
      filters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        sortBy: "price_low",
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
  if (!res.ok) throw new Error(t("product.errors.fetchProducts"));
      const data = await res.json();
      return data.products || [];
    },
  });

  const getCurrentData = () => {
    switch (activeTab) {
      case "hot":
        return { products: hotProducts, isLoading: hotLoading };
      case "today":
        return { products: todayProducts, isLoading: todayLoading };
      case "weekend":
        return { products: weekendProducts, isLoading: weekendLoading };
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
      case "hot":
        return {
          icon: <Flame className="w-5 h-5" />,
          title: t("sale.tabs.hot"),
          description: t("sale.tabInfo.hot.desc"),
          bgColor: "from-red-50 to-orange-50",
          borderColor: "border-red-100",
        };
      case "today":
        return {
          icon: <Clock className="w-5 h-5" />,
          title: t("sale.tabs.today"),
          description: t("sale.tabInfo.today.desc"),
          bgColor: "from-blue-50 to-cyan-50",
          borderColor: "border-blue-100",
        };
      case "weekend":
        return {
          icon: <PartyPopper className="w-5 h-5" />,
          title: t("sale.tabs.weekend"),
          description: t("sale.tabInfo.weekend.desc"),
          bgColor: "from-purple-50 to-pink-50",
          borderColor: "border-purple-100",
        };
      default:
        return {
          icon: null,
          title: "",
          description: "",
          bgColor: "",
          borderColor: "",
        };
    }
  };

  const tabInfo = getTabInfo();

  // 할인율 계산 (랜덤 시뮬레이션)
  const getDiscountRate = (productId: number) => {
    const rates = [10, 15, 20, 25, 30, 35, 40, 45, 50];
    return rates[productId % rates.length];
  };

  // 남은 시간 계산 (시뮬레이션)
  const getTimeLeft = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-red-500" />
            {t("nav.specialOffers")}
          </h1>
          <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            {t("badge.hot")}
          </div>
        </div>
  <p className="text-gray-600 text-sm md:text-base">{t("sale.subheading")}</p>
      </div>

      {/* 타이머 (오늘의 딜일 때만 표시) */}
      {activeTab === "today" && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t("sale.timer.title")}
              </h3>
              <p className="text-sm opacity-90">
                {t("sale.timer.desc")}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold">
                {getTimeLeft()}
              </div>
              <div className="text-xs opacity-90">{t("sale.timer.left")}</div>
            </div>
          </div>
        </div>
      )}

      {/* 탭 메뉴 */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("hot")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "hot"
                ? "border-red-500 text-red-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Flame className="w-4 h-4 inline mr-2" />
            {t("sale.tabs.hot")}
          </button>
          <button
            onClick={() => setActiveTab("today")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "today"
                ? "border-red-500 text-red-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            {t("sale.tabs.today")}
          </button>
          <button
            onClick={() => setActiveTab("weekend")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "weekend"
                ? "border-red-500 text-red-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <PartyPopper className="w-4 h-4 inline mr-2" />
            {t("sale.tabs.weekend")}
          </button>
        </div>
      </div>

      {/* 메인 카테고리 선택 */}
      <div className="mb-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("filters.category")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mainCategories.map((category) => (
            <button
              key={category.key}
              onClick={() => handleMainCategoryClick(category.key)}
              className={`h-12 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                selectedMainCategory === category.key
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-red-500 hover:bg-red-50"
              }`}
            >
              {t(category.label)}
            </button>
          ))}
        </div>
      </div>

      {/* 세부 카테고리 선택 */}
      {subCategories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("filters.subCategory")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0">
      {subCategories.map((subCategory) => (
              <button
                key={subCategory.keyword}
                onClick={() => handleSubCategoryClick(subCategory.keyword)}
                className={`h-[50px] border border-[#e5e6e8] text-sm font-normal text-[#000c22] transition-all duration-200 hover:bg-[#f9cfb7] active:scale-95 cursor-pointer line-seed-kr ${
                  selectedSubCategory === subCategory.keyword
                    ? "bg-red-500 text-white"
                    : "bg-white"
                }`}
              >
        {"nameKey" in subCategory ? t((subCategory as any).nameKey) : (subCategory as any).name}
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
      <div
        className={`mb-6 p-4 bg-gradient-to-r ${tabInfo.bgColor} rounded-lg border ${tabInfo.borderColor}`}
      >
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
          <div className="text-6xl mb-4">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t("sale.empty.title")}</h3>
          <p className="text-gray-500">{t("sale.empty.desc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {products.map((product: Product) => (
            <div key={product.id} className="relative">
              {/* 할인 뱃지 */}
              <div className="absolute -top-2 -right-2 z-10 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                -{getDiscountRate(product.id)}%
              </div>
              <MusinsaProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* 세일 안내 */}
      {!isLoading && products.length > 0 && (
        <div className="mt-12 text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-yellow-500" />
            <p className="text-gray-800 font-medium">{t("sale.more.title")}</p>
          </div>
          <p className="text-sm text-gray-600">{t("sale.more.desc")}</p>
        </div>
      )}
    </div>
  );
}
