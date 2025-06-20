"use client";

import {
  Share2,
  Star,
  Heart,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ProductVariant } from "@/types/product";
import { PurchaseButton } from "@/components/product/PurchaseButton";
import VirtualFitting from "@/components/product/VirtualFitting";

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
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* 이미지 Skeleton */}
              <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200" />
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="aspect-square rounded-lg bg-gray-100"
                    />
                  ))}
                </div>
              </div>
              {/* 정보 Skeleton */}
              <div className="space-y-6">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-1/3" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-14 flex-1" />
                  <Skeleton className="h-14 w-14" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            상품을 불러올 수 없습니다
          </h2>
          <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            상품을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600">요청하신 상품이 존재하지 않습니다.</p>
        </div>
      </div>
    );
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

  // 옵션이 없는 상품의 경우 기본 variant ID 설정 (첫 번째 variant 또는 product.id 사용)
  const effectiveVariantId =
    Object.keys(groupedVariants).length === 0
      ? product.variants && product.variants.length > 0
        ? product.variants[0].id
        : product.id // 옵션이 없으면 product.id를 variantId로 사용
      : selectedVariant?.id;

  console.log("effectiveVariantId 계산:", {
    hasOptions: Object.keys(groupedVariants).length > 0,
    selectedVariant: selectedVariant?.id,
    firstVariant: product.variants?.[0]?.id,
    productId: product.id,
    effectiveVariantId,
    allVariants: product.variants?.map((v) => ({
      id: v.id,
      optionName: v.optionName,
      optionValue: v.optionValue,
    })),
  });

  const totalPrice = finalPrice * quantity;

  // 썸네일 이미지 배열 분리
  const thumbnails = product.thumbnailImages || [];
  const detailImage = product.detailImage;

  // 모든 이미지 배열 (메인 + 썸네일)
  const allImages = [product.imageUrl, ...thumbnails];
  const currentImage = allImages[selectedImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 상품 이미지 섹션 */}
            <div className="space-y-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-xl">
                <Image
                  src={currentImage}
                  alt={product.title}
                  fill
                  className="object-contain p-8"
                  priority
                />

                {/* 상태 배지들 */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.badge === "SOLDOUT" && (
                    <Badge
                      variant="destructive"
                      className="bg-red-500 text-white font-bold"
                    >
                      품절
                    </Badge>
                  )}
                  {product.badge === "New" && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold">
                      NEW
                    </Badge>
                  )}
                  {product.badge === "BEST" && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold">
                      BEST
                    </Badge>
                  )}
                </div>

                {/* 위시리스트 버튼 */}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 group"
                >
                  <Heart
                    className={`w-6 h-6 transition-all duration-200 ${
                      isWishlisted
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600 group-hover:text-red-500"
                    }`}
                  />
                </button>
              </div>

              {/* 썸네일 이미지들 */}
              {allImages.length > 1 && (
                <div className="relative">
                  <div className="grid grid-cols-4 gap-3">
                    {allImages
                      .slice(thumbnailStartIndex, thumbnailStartIndex + 4)
                      .map((image, i) => {
                        const actualIndex = thumbnailStartIndex + i;
                        return (
                          <div
                            key={actualIndex}
                            onClick={() => setSelectedImageIndex(actualIndex)}
                            className={`aspect-square rounded-lg overflow-hidden bg-white shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 ${
                              selectedImageIndex === actualIndex
                                ? "ring-2 ring-pink-500 shadow-lg scale-105"
                                : ""
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${product.title} 이미지 ${actualIndex + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                        );
                      })}
                  </div>

                  {/* 이전 버튼 */}
                  {thumbnailStartIndex > 0 && (
                    <button
                      onClick={() =>
                        setThumbnailStartIndex(
                          Math.max(0, thumbnailStartIndex - 1)
                        )
                      }
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 z-10"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                  )}

                  {/* 다음 버튼 */}
                  {thumbnailStartIndex + 4 < allImages.length && (
                    <button
                      onClick={() =>
                        setThumbnailStartIndex(
                          Math.min(
                            allImages.length - 4,
                            thumbnailStartIndex + 1
                          )
                        )
                      }
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 z-10"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              )}

              {/* 가상 피팅 */}
              <div className="mt-8 block md:hidden">
                <VirtualFitting
                  productTitle={product.title}
                  productCategory={product.category}
                  currentImage={currentImage}
                />
              </div>
            </div>

            {/* 상품 정보 섹션 */}
            <div className="space-y-8">
              {/* 브랜드 및 공유 */}
              <div className="flex justify-between items-start">
                <Link href="/" className="flex items-center space-x-2 group">
                  <span
                    className="rounded-full border-2 border-pink-200 
                    group-hover:border-pink-400 transition-colors px-2 font-bold text-pink-500"
                  >
                    BOGOFIT
                  </span>
                </Link>
                <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-gray-600 hover:text-pink-600">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">공유</span>
                </button>
              </div>

              {/* 상품명 및 기본 정보 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 font-medium">
                    {product.category}
                  </p>
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {product.title}
                  </h1>
                </div>

                {/* 평점 */}
                {product.avgRating && product.avgRating > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.avgRating!)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {product.avgRating}
                    </span>
                    <span className="text-gray-500">
                      ({product.reviewCount}개 리뷰)
                    </span>
                  </div>
                )}
              </div>

              {/* 가격 */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                      {finalPrice.toLocaleString()}원
                    </span>
                    {selectedVariant && selectedVariant.priceDiff !== 0 && (
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        기본가 {product.price.toLocaleString()}원
                        {selectedVariant.priceDiff > 0 ? " +" : " "}
                        {selectedVariant.priceDiff.toLocaleString()}원
                      </span>
                    )}
                  </div>
                  {quantity > 1 && (
                    <p className="text-lg font-semibold text-gray-700">
                      총 {totalPrice.toLocaleString()}원 (수량: {quantity}개)
                    </p>
                  )}
                </div>
              </div>

              {/* 상품 옵션 */}
              {Object.keys(groupedVariants).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">상품 옵션</h3>
                  {Object.entries(groupedVariants).map(
                    ([optionName, variants]) => (
                      <div key={optionName} className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
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
                          <SelectTrigger className="w-full bg-white border-2 border-gray-200 hover:border-pink-300 transition-colors rounded-xl h-12">
                            <SelectValue
                              placeholder={`${optionName}을 선택하세요`}
                            />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {variants.map((variant) => (
                              <SelectItem
                                key={variant.id}
                                value={variant.id.toString()}
                                disabled={variant.optionValue.includes("품절")}
                                className="rounded-lg"
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className="font-medium">
                                    {variant.optionValue}
                                  </span>
                                  <div className="flex items-center gap-2 ml-4">
                                    {variant.priceDiff !== 0 && (
                                      <span className="text-sm text-pink-600 font-semibold">
                                        {variant.priceDiff > 0 ? "+" : ""}
                                        {variant.priceDiff.toLocaleString()}원
                                      </span>
                                    )}
                                    {variant.optionValue.includes("품절") && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
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
                    )
                  )}
                </div>
              )}

              {/* 수량 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  수량
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 배송 및 서비스 정보 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-900">배송 & 서비스</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">무료배송</p>
                      <p className="text-xs text-gray-500">3만원 이상</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">품질보장</p>
                      <p className="text-xs text-gray-500">100% 정품</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">교환/환불</p>
                      <p className="text-xs text-gray-500">7일 이내</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 상품 설명 */}
              {product.description && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-3">
                  <h3 className="font-bold text-gray-900">상품 설명</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* 구매 버튼 */}
              <div className="sticky bottom-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-lg">
                <PurchaseButton
                  productId={Number(params.id)}
                  productTitle={product.title}
                  productPrice={finalPrice}
                  quantity={quantity}
                  selectedOption={
                    selectedVariant
                      ? `${selectedVariant.optionName}: ${selectedVariant.optionValue}`
                      : ""
                  }
                  hasOptions={Object.keys(groupedVariants).length > 0}
                  isOutOfStock={isOutOfStock}
                  variantId={effectiveVariantId}
                />
              </div>
            </div>
          </div>

          {/* 가상 피팅 */}
          <div className="mt-8 hidden md:block">
            <VirtualFitting
              productTitle={product.title}
              productCategory={product.category}
              currentImage={currentImage}
            />
          </div>

          {/* 상품 상세 이미지 (하단) */}
          {detailImage && (
            <div className="max-w-3xl mx-auto mt-16">
              <Image
                src={detailImage}
                alt="상세 이미지"
                width={1200}
                height={1600}
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
