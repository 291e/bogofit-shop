"use client";

import { Share2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/useProduct";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutButton } from "@/components/payment/Checkout";
import { Badge } from "@/components/ui/badge";
import { ProductVariant } from "@/types/product";

export default function ProductDetail() {
  const params = useParams();
  const {
    data: product,
    isLoading,
    error,
  } = useProduct(params?.id as string | undefined);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* 이미지 Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full h-full rounded-lg bg-gray-100" />
          </div>
          {/* 정보 Skeleton */}
          <div className="space-y-6">
            <div className="flex justify-between">
              <Skeleton className="w-24 h-8" />
              <div className="flex gap-4">
                <Skeleton className="w-16 h-8" />
                <Skeleton className="w-16 h-8" />
              </div>
            </div>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-20">
        상품을 불러오지 못했습니다.
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20">상품을 찾을 수 없습니다.</div>;
  }

  // 최종 가격 계산 (기본 가격 + 선택된 옵션의 가격 차이)
  const finalPrice = selectedVariant
    ? product.price + selectedVariant.priceDiff
    : product.price;

  // 품절 확인 (옵션값에 "품절" 단어 포함 여부)
  const isOutOfStock = selectedVariant
    ? selectedVariant.optionValue.includes("품절")
    : product.variants && product.variants.length > 0
    ? product.variants.every((v) => v.optionValue.includes("품절"))
    : false;

  // 옵션별로 그룹화
  const groupedVariants =
    product.variants?.reduce((acc, variant) => {
      if (!acc[variant.optionName]) {
        acc[variant.optionName] = [];
      }
      acc[variant.optionName].push(variant);
      return acc;
    }, {} as Record<string, ProductVariant[]>) || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 max-w-sm mx-auto">
        {/* 상품 이미지 */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-contain"
              priority
            />

            {/* 품절 배지 */}
            {isOutOfStock && (
              <div className="absolute top-4 left-4">
                <Badge variant="secondary">품절</Badge>
              </div>
            )}
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          <div className="flex justify-between">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src={`/images/WunderStory/WunderStory.jpg`}
                  alt={`로고`}
                  width={100}
                  height={100}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>
            <div className="flex justify-center gap-8 text-gray-500">
              <button className="flex items-center gap-2 hover:text-pink-600 transition">
                <Share2 className="w-5 h-5" />
                <span>공유하기</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-lg md:text-2xl font-bold mb-2">
              {product.title}
            </h1>
            <div className="text-gray-500 text-sm mb-2">
              카테고리: {product.category}
            </div>
            <div className="text-gray-500 text-sm mb-2">
              판매자: {product.storeName}
            </div>
          </div>

          {/* 평점 정보 */}
          {product.avgRating && product.avgRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.avgRating}</span>
              </div>
              <span className="text-gray-500 text-sm">
                ({product.reviewCount}개 리뷰)
              </span>
            </div>
          )}

          {/* 가격 */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl md:text-3xl font-bold text-pink-600">
              {finalPrice.toLocaleString()}원
            </span>
            {selectedVariant && selectedVariant.priceDiff !== 0 && (
              <span className="text-sm text-gray-500">
                (기본가 {product.price.toLocaleString()}원
                {selectedVariant.priceDiff > 0 ? " +" : " "}
                {selectedVariant.priceDiff.toLocaleString()}원)
              </span>
            )}
          </div>

          {/* 상품 옵션 (ProductVariant) */}
          {Object.keys(groupedVariants).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">상품 옵션</h2>
              {Object.entries(groupedVariants).map(([optionName, variants]) => (
                <div key={optionName}>
                  <label className="text-sm font-medium mb-2 block">
                    {optionName}
                  </label>
                  <Select
                    value={selectedVariant?.id.toString() || ""}
                    onValueChange={(value) => {
                      const variant = variants.find(
                        (v) => v.id.toString() === value
                      );
                      setSelectedVariant(variant || null);
                    }}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={`${optionName}을 선택하세요`} />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant) => (
                        <SelectItem
                          key={variant.id}
                          value={variant.id.toString()}
                          disabled={variant.optionValue.includes("품절")}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{variant.optionValue}</span>
                            <div className="flex items-center gap-2 ml-4">
                              {variant.priceDiff !== 0 && (
                                <span className="text-sm text-gray-500">
                                  {variant.priceDiff > 0 ? "+" : ""}
                                  {variant.priceDiff.toLocaleString()}원
                                </span>
                              )}
                              {variant.optionValue.includes("품절") && (
                                <Badge variant="secondary" className="text-xs">
                                  품절
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {/* 설명 */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="font-semibold">상품 설명</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* 구매 버튼 */}
          <CheckoutButton
            productId={Number(params.id)}
            productTitle={product.title}
            productPrice={finalPrice}
            selectedOption={
              selectedVariant
                ? `${selectedVariant.optionName}: ${selectedVariant.optionValue}`
                : ""
            }
            hasOptions={Object.keys(groupedVariants).length > 0}
          />
        </div>
      </div>
    </div>
  );
}
