"use client";

import { useQuery } from "@tanstack/react-query";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types/product";
import { useState } from "react";
import { Target, Bot, Sparkles } from "lucide-react";

const LIMIT = 30;

export default function RecommendPage() {
  const [activeTab, setActiveTab] = useState<"ai" | "editor">("ai");

  // AI 추천 상품 (랜덤)
  const { data: aiProducts = [], isLoading: aiLoading } = useQuery<Product[]>({
    queryKey: ["recommend", "ai"],
    queryFn: async () => {
      const res = await fetch(`/api/products?random=${LIMIT}&badge=BEST`);
      if (!res.ok) throw new Error("AI 추천 상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.products || [];
    },
  });

  // 에디터 추천 상품 (신상품)
  const { data: editorProducts = [], isLoading: editorLoading } = useQuery<
    Product[]
  >({
    queryKey: ["recommend", "editor"],
    queryFn: async () => {
      const res = await fetch(`/api/products?badge=NEW&limit=${LIMIT}`);
      if (!res.ok) throw new Error("에디터 추천 상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.products || [];
    },
  });

  const currentProducts = activeTab === "ai" ? aiProducts : editorProducts;
  const isLoading = activeTab === "ai" ? aiLoading : editorLoading;

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
