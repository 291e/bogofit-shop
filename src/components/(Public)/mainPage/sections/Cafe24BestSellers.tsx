"use client";

import { ProductResponseDto } from "@/types/product";
import { Cafe24ProductCard } from "./Cafe24ProductCard";
import { Trophy, ArrowRight, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePublicProducts } from "@/hooks/useProducts";
import { useState } from "react";

interface Cafe24BestSellersProps {
  products?: ProductResponseDto[]; // Optional - sẽ dùng hook nếu không có
}

export function Cafe24BestSellers({ products: initialProducts }: Cafe24BestSellersProps) {
  const [showAll, setShowAll] = useState(false);

  // ✅ Only use hook if no initial products provided (standalone usage)
  const { data: hookData } = usePublicProducts({
    pageNumber: 3, // ✅ Changed to page 3 for best sellers
    pageSize: 30,
    isActive: true,
    enabled: !initialProducts // ✅ Disable hook if props provided
  });

  // Use initialProducts from server or hookData from client
  const allProducts = initialProducts || hookData?.data?.data || hookData?.products || [];
  const products = allProducts.slice(0, 30); // Use first 30 for best sellers

  // Convert backend Product to ProductCard format
  const allDisplayProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug, // Product slug for SEO-friendly URLs
    price: product.basePrice,
    originalPrice: product.baseCompareAtPrice || undefined,
    discount: product.baseCompareAtPrice
      ? Math.round(
        ((product.baseCompareAtPrice - product.basePrice) / product.baseCompareAtPrice) * 100
      )
      : undefined,
    image: product.images?.[0] || "/images/placeholder-product.png",
    brand: product.brand?.name || undefined,
    brandSlug: product.brand?.slug, // Brand slug for SEO-friendly URLs
    rating: undefined,
    reviews: undefined,
  }));

  // Show only 6 products initially, or all when expanded
  const displayProducts = showAll ? allDisplayProducts : allDisplayProducts.slice(0, 6);

  if (allDisplayProducts.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white py-12">
      {/* Decorative gradient lights */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-6 left-[10%] h-72 w-72 rounded-full bg-amber-300/20 blur-[90px]" />
        <div className="absolute top-14 right-[10%] h-80 w-80 rounded-full bg-yellow-300/20 blur-[90px]" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* 섹션 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-yellow-500" />
              <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                <Trophy className="h-5 w-5 text-amber-600" /> 베스트 상품
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </h2>
              <span className="hidden sm:inline-flex items-center text-xs sm:text-sm text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">
                가장 인기 있는 상품
              </span>
            </div>
            <Link
              href="/products?badge=BEST"
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-white/70 hover:border-gray-400 transition-colors shadow-sm backdrop-blur"
            >
              전체보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="relative group rounded-xl transition-transform duration-200 hover:scale-[1.01] h-full"
            >
              <Cafe24ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Xem thêm / Thu gọn button */}
        {allDisplayProducts.length > 6 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
            >
              {showAll ? (
                <>
                  닫기
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  더보기
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

