"use client";

import { useQuery } from "@tanstack/react-query";
import MusinsaProductCard from "@/components/product/MusinsaProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types/product";
import { useState } from "react";
import {
  ShoppingBag,
  Flame,
  Clock,
  PartyPopper,
  DollarSign,
} from "lucide-react";

const LIMIT = 30;

export default function SalePage() {
  const [activeTab, setActiveTab] = useState<"hot" | "today" | "weekend">(
    "hot"
  );

  // 핫딜 상품 (베스트 + 랜덤)
  const { data: hotProducts = [], isLoading: hotLoading } = useQuery<Product[]>(
    {
      queryKey: ["sale", "hot"],
      queryFn: async () => {
        const res = await fetch(`/api/products?badge=BEST&random=${LIMIT}`);
        if (!res.ok) throw new Error("핫딜 상품을 불러오지 못했습니다.");
        const data = await res.json();
        return data.products || [];
      },
    }
  );

  // 오늘의 딜 (신상품)
  const { data: todayProducts = [], isLoading: todayLoading } = useQuery<
    Product[]
  >({
    queryKey: ["sale", "today"],
    queryFn: async () => {
      const res = await fetch(`/api/products?badge=NEW&limit=${LIMIT}`);
      if (!res.ok) throw new Error("오늘의 딜 상품을 불러오지 못했습니다.");
      const data = await res.json();
      return data.products || [];
    },
  });

  // 주말 특가 (가격 낮은 순)
  const { data: weekendProducts = [], isLoading: weekendLoading } = useQuery<
    Product[]
  >({
    queryKey: ["sale", "weekend"],
    queryFn: async () => {
      const res = await fetch(`/api/products?sortBy=price_low&limit=${LIMIT}`);
      if (!res.ok) throw new Error("주말 특가 상품을 불러오지 못했습니다.");
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

  const getTabInfo = () => {
    switch (activeTab) {
      case "hot":
        return {
          icon: <Flame className="w-5 h-5" />,
          title: "핫딜 특가",
          description: "지금 가장 인기있는 할인 상품들을 놓치지 마세요!",
          bgColor: "from-red-50 to-orange-50",
          borderColor: "border-red-100",
        };
      case "today":
        return {
          icon: <Clock className="w-5 h-5" />,
          title: "오늘의 딜",
          description:
            "오늘 하루만 특별한 가격으로 만나볼 수 있는 상품들입니다.",
          bgColor: "from-blue-50 to-cyan-50",
          borderColor: "border-blue-100",
        };
      case "weekend":
        return {
          icon: <PartyPopper className="w-5 h-5" />,
          title: "주말 특가",
          description: "주말을 더욱 특별하게! 저렴한 가격의 특가 상품들입니다.",
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
            특가 세일
          </h1>
          <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            HOT
          </div>
        </div>
        <p className="text-gray-600 text-sm md:text-base">
          최대 50% 할인! 놓치면 후회하는 특가 상품들
        </p>
      </div>

      {/* 타이머 (오늘의 딜일 때만 표시) */}
      {activeTab === "today" && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                타임 세일 진행 중!
              </h3>
              <p className="text-sm opacity-90">
                오늘 자정까지 특가로 만나보세요
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold">
                {getTimeLeft()}
              </div>
              <div className="text-xs opacity-90">남은 시간</div>
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
            핫딜 특가
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
            오늘의 딜
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
            주말 특가
          </button>
        </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            세일 상품이 없습니다
          </h3>
          <p className="text-gray-500">
            곧 새로운 특가 상품이 업데이트될 예정입니다.
          </p>
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
            <p className="text-gray-800 font-medium">
              더 많은 할인 혜택을 받으세요
            </p>
          </div>
          <p className="text-sm text-gray-600">
            회원가입 시 추가 10% 할인 쿠폰을 드립니다!
          </p>
        </div>
      )}
    </div>
  );
}
