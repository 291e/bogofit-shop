"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { calculateReviewStats } from "@/contents/Sample/sampleReviews";

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  showAddToCart = true,
  className = "",
}: ProductCardProps) {
  const finalPrice = product.price;
  // 옵션이 있으면 모든 옵션에 "품절"이 포함되어 있을 때만 품절, 옵션이 없으면 품절 아님
  const isOutOfStock = product.badge === "SOLDOUT" ? true : false;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${className} h-full flex flex-col`}
    >
      <div>
        {/* 상품 이미지 */}
        <Link href={`/products/${product.id}`} className="block relative">
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />

            {/* 평점
            {product.avgRating && product.avgRating > 0 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{product.avgRating}</span>
              </div>
            )} */}
          </div>
        </Link>
      </div>
      {/* 상품 정보 */}
      <div className="flex flex-col justify-between p-4 h-full">
        {/* 스토어명 */}
        <div className="text-xs text-gray-500 font-medium flex flex-col gap-1">
          <span>{product.storeName}</span>
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-pink-600 transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* 리뷰 정보 */}
        {(() => {
          const reviewStats = calculateReviewStats([]);
          // 실제로는 product.reviews를 사용하지만, 현재는 샘플 데이터 사용
          const stats = product.reviewCount
            ? {
                avgRating: product.avgRating || 4.5,
                reviewCount: product.reviewCount,
              }
            : reviewStats;

          return (
            stats.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= Math.floor(stats.avgRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : star <= stats.avgRating
                          ? "fill-yellow-200 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">
                  {stats.avgRating.toFixed(1)}
                </span>
                <span>({stats.reviewCount.toLocaleString()})</span>
              </div>
            )
          );
        })()}

        {/* 액션 버튼 */}
        {showAddToCart && (
          <div className="pt-2 flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-lg font-bold text-pink-600">
                {finalPrice.toLocaleString()}원
              </span>
              {/* 배지들 */}
              <div className="flex flex-col gap-1 mt-2">
                {product.badge === "BEST" && (
                  <Badge variant="destructive" className="text-xs">
                    BEST
                  </Badge>
                )}
                {product.badge === "SOLDOUT" && (
                  <Badge variant="secondary" className="text-xs">
                    SOLDOUT
                  </Badge>
                )}
                {product.badge === "New" && (
                  <Badge variant="secondary" className="text-xs">
                    NEW
                  </Badge>
                )}
              </div>
            </div>
            <Link href={`/products/${product.id}`}>
              <Button
                className="w-full disabled:bg-blue-950"
                size="sm"
                disabled={isOutOfStock}
              >
                {isOutOfStock ? (
                  "품절"
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    상품 보기
                  </>
                )}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
