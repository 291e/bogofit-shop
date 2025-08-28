"use client";

import { useQuery } from "@tanstack/react-query";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types/product";
import { useState } from "react";
import { Store, Crown, Sparkles, Gem, Star, Handshake } from "lucide-react";
import BrandInquiryModal from "@/components/auth/BrandInquiryModal";

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
  const [activeTab, setActiveTab] = useState<"popular" | "new" | "premium">(
    "popular"
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [isBrandInquiryModalOpen, setIsBrandInquiryModalOpen] = useState(false);

  // 브랜드 목록 조회
  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await fetch(`/api/brands`);
      if (!res.ok) throw new Error("브랜드 목록을 불러오지 못했습니다.");
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
        // 브랜드명으로 검색 (브랜드명과 스토어명 모두 매칭)
        url = `/api/products?search=${encodeURIComponent(
          selectedBrandInfo.name
        )}&badge=BEST&limit=${LIMIT}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("인기 브랜드 상품을 불러오지 못했습니다.");
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
          // 브랜드명으로 검색 (브랜드명과 스토어명 모두 매칭)
          url = `/api/products?search=${encodeURIComponent(
            selectedBrandInfo.name
          )}&badge=NEW&limit=${LIMIT}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("신생 브랜드 상품을 불러오지 못했습니다.");
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
        // 브랜드명으로 검색 (브랜드명과 스토어명 모두 매칭)
        url = `/api/products?search=${encodeURIComponent(
          selectedBrandInfo.name
        )}&sortBy=price_high&limit=${LIMIT}`;
      }
      const res = await fetch(url);
      if (!res.ok)
        throw new Error("프리미엄 브랜드 상품을 불러오지 못했습니다.");
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
          title: "인기 브랜드",
          description: "고객들이 가장 많이 찾는 인기 브랜드의 상품들입니다.",
        };
      case "new":
        return {
          icon: <Sparkles className="w-5 h-5" />,
          title: "신생 브랜드",
          description:
            "새롭게 입점한 주목할 만한 브랜드들의 상품을 만나보세요.",
        };
      case "premium":
        return {
          icon: <Gem className="w-5 h-5" />,
          title: "프리미엄 브랜드",
          description: "고급스러운 프리미엄 브랜드의 특별한 상품들입니다.",
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
          입점 브랜드
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          엄선된 브랜드들의 다양한 상품을 만나보세요
        </p>
      </div>

      {/* 브랜드 필터 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          브랜드 선택
        </h3>
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
            <p className="text-gray-500 mb-2">등록된 브랜드가 없습니다</p>
            <p className="text-sm text-gray-400">
              첫 번째 브랜드가 되어보세요!
            </p>
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
              전체
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
            추천 브랜드
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
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-8 h-8 rounded-full object-cover"
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
                  {brand.productCount}개 상품
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
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            아직 입점한 브랜드가 없습니다
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            보고핏과 함께 성장할 첫 번째 브랜드가 되어보세요! 우리는 새로운
            브랜드를 환영합니다.
          </p>
          <button
            onClick={() => setIsBrandInquiryModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF84CD] text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            <Handshake className="w-5 h-5" />
            브랜드 입점 신청하기
          </button>
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
                <p className="text-sm text-gray-600">
                  브랜드 상품을 확인해보세요
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBrand(null)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              전체 보기
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
            인기 브랜드
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
            신생 브랜드
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
            프리미엄 브랜드
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
            {selectedBrand
              ? `${selectedBrand} 브랜드의 상품이 없습니다`
              : "브랜드 상품이 없습니다"}
          </h3>
          <p className="text-gray-500">
            다른 브랜드를 선택하거나 잠시 후 다시 시도해주세요.
          </p>
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
            <p className="text-gray-800 font-medium">브랜드 입점 문의</p>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            새로운 브랜드의 입점을 환영합니다. 함께 성장해요!
          </p>
          <button
            onClick={() => setIsBrandInquiryModalOpen(true)}
            className="inline-block px-6 py-2 bg-[#FF84CD] text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
          >
            브랜드 입점 신청
          </button>
        </div>
      )}

      {/* 브랜드 입점 문의 모달 */}
      <BrandInquiryModal
        open={isBrandInquiryModalOpen}
        onOpenChange={setIsBrandInquiryModalOpen}
      />
    </div>
  );
}
