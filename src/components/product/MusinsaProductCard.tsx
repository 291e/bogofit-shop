"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/types/product";
import { useI18n } from "@/providers/I18nProvider";
import { formatNumber } from "@/lib/formatters";

interface MusinsaProductCardProps {
  product: Product;
  className?: string;
}

export default function MusinsaProductCard({
  product,
  className = "",
}: MusinsaProductCardProps) {
  const { t } = useI18n();
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 할인율과 할인가격 계산 (5% 단위, 천원 단위) - 상품 ID 기반으로 일관성 있게 계산
  const discountRates = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60]; // 5% 단위 할인률
  const discountRate = discountRates[product.id % discountRates.length]; // 상품 ID로 일관된 할인율

  const hasDiscount = discountRate > 0;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div className={`group ${className}`}>
      <div className="bg-white">
        {/* 상품 이미지 컨테이너 */}
        <div className="relative">
          <Link
            href={`/products/${product.id}`}
            className="block"
            aria-label={product.title}
          >
            <div className="relative aspect-[5/6] overflow-hidden bg-gray-50">
              <div className="relative z-5 inline-flex items-center justify-center w-full h-full before:absolute before:inset-0 before:size-full before:z-5 before:overflow-hidden before:bg-black/[2%]">
                {!imageError ? (
                  <Image
                    src={product.imageUrl}
                    alt={`${product.brand?.name || "보고핏"} ${product.title} ${t("product.detail.imageAltSuffix")}`}
                    fill
                    className="max-w-full w-full absolute m-auto inset-0 h-auto z-0 visible object-cover"
                    loading="lazy"
                    onError={() => setImageError(true)}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">{t("common.noImage")}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* 좋아요 버튼 */}
          <button
            type="button"
            onClick={handleLikeClick}
            aria-label={t("common.like")}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full transition-all duration-200 group-hover:scale-110"
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-200 ${
                isLiked
                  ? "fill-red-500 stroke-red-500"
                  : "fill-gray-500/30 stroke-gray-400 hover:stroke-red-400"
              }`}
            />
          </button>
        </div>

        {/* 상품 정보 */}
        <div className="pl-2 pr-1 pt-2 pb-3 bg-white">
          {/* 브랜드명 */}
          <div className="block mb-1">
            <p className="text-[11px] font-semibold line-clamp-1 break-all whitespace-break-spaces text-black font-pretendard">
              {product.brand?.name || "보고핏"}
            </p>
          </div>

          {/* 상품명 */}
          <Link href={`/products/${product.id}`} className="block mb-2">
            <p className="text-[13px] font-normal line-clamp-2 break-all whitespace-break-spaces text-black font-pretendard leading-relaxed">
              {product.title}
            </p>
          </Link>

          {/* 가격 정보 */}
          <div className="flex items-center justify-between">
            {/* 배송 타입 */}
            <span
              className={`text-[11px] font-medium px-0 py-0.5 rounded font-pretendard ${
                product.shippingType === "DOMESTIC"
                  ? "text-blue-600 bg-blue-100"
                  : "text-red-600 bg-red-100"
              }`}
            >
              {product.shippingType === "DOMESTIC"
                ? t("product.shipping.domestic")
                : t("product.shipping.overseas")}
            </span>
            <div className="flex items-center space-x-1">
              {hasDiscount && (
                <span className="text-[13px] font-semibold text-red-500 font-pretendard">
                  {discountRate}%
                </span>
              )}
              <span className="text-[13px] font-semibold text-black font-pretendard">
                {formatNumber(product.price)}
                {t("currency.won")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
