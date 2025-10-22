"use client";

import { useQuery } from "@tanstack/react-query";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types/product";
import { useState } from "react";
import { Store, Crown, Sparkles, Gem, Star, Handshake } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import Image from "next/image";

const LIMIT = 30;

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  productCount: number;
  userCount: number;
  status: string;
  isActive: boolean;
  createdAt: string;
}

export default function BrandsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"popular" | "new" | "premium">(
    "popular"
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  // Standalone brand inquiry page is at /brand; no modal state needed

  // 브랜드 목록 조회
  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await fetch(`/api/brands`);
  if (!res.ok) throw new Error(t("brands.errors.fetchBrands"));
      const data = await res.json();
      return data.data.brands || [];
    },
  });

  // 선택된 브랜드 정보 찾기
  const selectedBrandInfo = selectedBrand
    ? brands.find((brand) => brand.name === selectedBrand)
    : null;

  // 인기 브랜드 상품
  const { data: popularProducts = [], isLoading: popularLoading } = useQuery<
    Product[]
  >({
    queryKey: ["brands", "popular", selectedBrandInfo?.name],
    queryFn: async () => {
      let url = `/api/products?badge=BEST&limit=${LIMIT}`;
      if (selectedBrandInfo) {
        // 브랜드 ID로 정확하게 필터링
        url = `/api/products?brandId=${selectedBrandInfo.id}&badge=BEST&limit=${LIMIT}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(t("product.errors.fetchProducts"));
      const data = await res.json();
      return data.products || [];
    },
    enabled: !brandsLoading, // 브랜드 로딩이 완료된 후에만 실행
  });

  // 신생 브랜드 상품
  const { data: newProducts = [], isLoading: newLoading } = useQuery<Product[]>(
    {
      queryKey: ["brands", "new", selectedBrandInfo?.name],
      queryFn: async () => {
        let url = `/api/products?badge=NEW&limit=${LIMIT}`;
        if (selectedBrandInfo) {
          // 브랜드 ID로 정확하게 필터링
          url = `/api/products?brandId=${selectedBrandInfo.id}&badge=NEW&limit=${LIMIT}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(t("product.errors.fetchProducts"));
        const data = await res.json();
        return data.products || [];
      },
      enabled: !brandsLoading,
    }
  );

  // 프리미엄 브랜드 상품
  const { data: premiumProducts = [], isLoading: premiumLoading } = useQuery<
    Product[]
  >({
    queryKey: ["brands", "premium", selectedBrandInfo?.name],
    queryFn: async () => {
      let url = `/api/products?sortBy=price_high&limit=${LIMIT}`;
      if (selectedBrandInfo) {
        // 브랜드 ID로 정확하게 필터링
        url = `/api/products?brandId=${selectedBrandInfo.id}&sortBy=price_high&limit=${LIMIT}`;
      }
      const res = await fetch(url);
      if (!res.ok)
        throw new Error(t("product.errors.fetchProducts"));
      const data = await res.json();
      return data.products || [];
    },
    enabled: !brandsLoading,
  });

  const getCurrentData = () => {
    switch (activeTab) {
      case "popular":
        return { products: popularProducts, isLoading: popularLoading };
      case "new":
        return { products: newProducts, isLoading: newLoading };
      case "premium":
        return { products: premiumProducts, isLoading: premiumLoading };
      default:
        return { products: [], isLoading: false };
    }
  };

  const { products, isLoading } = getCurrentData();

  const getTabInfo = () => {
    switch (activeTab) {
      case "popular":
        return {
          icon: <Crown className="w-5 h-5" />,
          title: t("brands.tabs.popular"),
          description: t("brands.tabInfo.popular.desc"),
        };
      case "new":
        return {
          icon: <Sparkles className="w-5 h-5" />,
          title: t("brands.tabs.new"),
          description: t("brands.tabInfo.new.desc"),
        };
      case "premium":
        return {
          icon: <Gem className="w-5 h-5" />,
          title: t("brands.tabs.premium"),
          description: t("brands.tabInfo.premium.desc"),
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
          <Store className="w-8 h-8 text-[#FF84CD]" />
          {t("header.brands")}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">{t("brands.subheading")}</p>
      </div>

      {/* 브랜드 필터 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("brands.filter.title")}</h3>
        {brandsLoading ? (
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-8 w-16 rounded-full" />
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg mb-4">
            <Store className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">{t("brands.listEmpty.title")}</p>
            <p className="text-sm text-gray-400">{t("brands.listEmpty.desc")}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedBrand(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedBrand
                  ? "bg-[#FF84CD] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("brands.filter.all")}
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedBrand === brand.name
                    ? "bg-[#FF84CD] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {brand.name} ({brand.productCount})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 브랜드 그리드 (선택된 브랜드가 없을 때만 표시) */}
      {!selectedBrand && !brandsLoading && brands.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {t("brands.recommend")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {brands.slice(0, 6).map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.name)}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#FF84CD] hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center group-hover:from-pink-200 group-hover:to-purple-200 transition-colors">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      className="w-8 h-8 rounded-full object-cover"
                      width={300}
                      height={300}
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-700">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {brand.name}
                </div>
                <div className="text-xs text-gray-500">
                  {brand.productCount}
                  {t("brands.productCountSuffix")}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 브랜드 로딩 상태 */}
      {!selectedBrand && brandsLoading && (
        <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-lg border border-gray-200"
              >
                <Skeleton className="w-12 h-12 mx-auto mb-2 rounded-full" />
                <Skeleton className="h-4 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 브랜드 없음 상태 */}
      {!selectedBrand && !brandsLoading && brands.length === 0 && (
        <div className="mb-8 text-center py-20 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <Store className="w-20 h-20 mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-800 mb-3">{t("brands.none.title")}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{t("brands.none.desc")}</p>
          <Link
            href="/brand"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF84CD] text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            <Handshake className="w-5 h-5" />
            {t("brands.partner.cta")}
          </Link>
        </div>
      )}

      {/* 선택된 브랜드 정보 */}
      {selectedBrand && (
        <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-gray-700">
                  {selectedBrand.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedBrand}
                </h3>
                <p className="text-sm text-gray-600">{t("brands.selected.desc")}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBrand(null)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              {t("brands.selected.clear")}
            </button>
          </div>
        </div>
      )}

      {/* 탭 메뉴 */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("popular")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "popular"
                ? "border-[#FF84CD] text-[#FF84CD]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Crown className="w-4 h-4 inline mr-2" />
            {t("brands.tabs.popular")}
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "new"
                ? "border-[#FF84CD] text-[#FF84CD]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            {t("brands.tabs.new")}
          </button>
          <button
            onClick={() => setActiveTab("premium")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "premium"
                ? "border-[#FF84CD] text-[#FF84CD]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Gem className="w-4 h-4 inline mr-2" />
            {t("brands.tabs.premium")}
          </button>
        </div>
      </div>

      {/* 탭 설명 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
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
            <Store className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedBrand ? (
              <>
                {selectedBrand}
                {t("brands.emptyForBrand.suffix")}
              </>
            ) : (
              t("brands.empty.title")
            )}
          </h3>
          <p className="text-gray-500">{t("brands.empty.desc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {products.map((product: Product) => (
            <MusinsaProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 브랜드 제휴 안내 */}
      {!isLoading && products.length > 0 && (
        <div className="mt-12 text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Handshake className="w-6 h-6 text-green-500" />
            <p className="text-gray-800 font-medium">{t("brands.partner.title")}</p>
          </div>
          <p className="text-sm text-gray-600 mb-3">{t("brands.partner.desc")}</p>
          <Link
            href="/brand"
            className="inline-block px-6 py-2 bg-[#FF84CD] text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
          >
            {t("brands.partner.cta")}
          </Link>
        </div>
      )}

  {/* 브랜드 입점 문의는 /brand 페이지에서 진행합니다. */}
    </div>
  );
}
