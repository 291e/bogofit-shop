"use client";

import { useQuery } from "@tanstack/react-query";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types/product";
import { useState } from "react";
import { BarChart3, Trophy, Flame, Star } from "lucide-react";

const LIMIT = 30;

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"best" | "popular" | "review">(
    "best"
  );

  // 베스트 상품
  const { data: bestProducts = [], isLoading: bestLoading } = useQuery<
    Product[]
  >({
    queryKey: ["ranking", "best"],
    queryFn: async () => {
      const res = await fetch(`/api/products?badge=BEST&limit=${LIMIT}`);
      if (!res.ok) throw new Error("베스트 상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.products || [];
    },
  });

  // 인기 상품 (가격 높은 순)
  const { data: popularProducts = [], isLoading: popularLoading } = useQuery<
    Product[]
  >({
    queryKey: ["ranking", "popular"],
    queryFn: async () => {
      const res = await fetch(`/api/products?sortBy=price_high&limit=${LIMIT}`);
      if (!res.ok) throw new Error("인기 상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.products || [];
    },
  });

  // 리뷰 많은 상품 (최신순)
  const { data: reviewProducts = [], isLoading: reviewLoading } = useQuery<
    Product[]
  >({
    queryKey: ["ranking", "review"],
    queryFn: async () => {
      const res = await fetch(`/api/products?sortBy=newest&limit=${LIMIT}`);
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
