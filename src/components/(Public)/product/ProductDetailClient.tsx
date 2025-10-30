"use client";

import React, { useState } from "react";
import {
  Star,
  Heart,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PurchaseButton } from "@/components/(Public)/product/PurchaseButton";
import VirtualFitting from "@/components/(Public)/product/VirtualFitting";
import { ProductReviews } from "@/components/(Public)/product/ProductReviews";

interface ProductVariant {
  id: string;
  optionName: string;
  optionValue: string;
  priceDiff: number;
  stock: number;
}

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  imageUrl: string;
  thumbnailImages?: string[];
  detailImage?: string;
  description?: string;
  category: string;
  subCategory?: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  storeName?: string;
  badge?: string;
  avgRating?: number;
  reviewCount?: number;
  variants?: Array<{
    id: string;
    optionName: string;
    optionValue: string;
    priceDiff: number;
    stock: number;
  }>;
  status: string;
  sku?: string;
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [vfImageIndex, setVfImageIndex] = useState(0); // Virtual Fitting용 이미지 인덱스

  // 옵션별로 그룹화
  const groupedVariants =
    product.variants?.reduce(
      (acc, variant) => {
        if (!acc[variant.optionName]) {
          acc[variant.optionName] = [];
        }
        acc[variant.optionName].push(variant);
        return acc;
      },
      {} as Record<string, ProductVariant[]>
    ) || {};

  // 선택된 옵션들로부터 최종 variant 찾기
  const findMatchingVariant = () => {
    if (!product.variants || Object.keys(selectedOptions).length === 0) {
      return null;
    }

    const optionNames = Object.keys(groupedVariants);
    const selectedOptionNames = Object.keys(selectedOptions);

    if (optionNames.length === 1) {
      return (
        product.variants.find(
          (variant) =>
            variant.optionName === optionNames[0] &&
            variant.optionValue === selectedOptions[optionNames[0]]
        ) || null
      );
    }

    if (optionNames.length !== selectedOptionNames.length) {
      return null;
    }

    const selectedCombination = optionNames
      .sort()
      .map((name) => `${name}: ${selectedOptions[name]}`)
      .join(", ");

    return (
      product.variants.find((variant) => {
        const variantOptions = variant.optionValue.split(", ");
        const variantCombination = optionNames
          .sort()
          .map((name) => {
            const matchingOption = variantOptions.find(
              (opt) =>
                opt === selectedOptions[name] ||
                opt.includes(selectedOptions[name])
            );
            return `${name}: ${matchingOption || selectedOptions[name]}`;
          })
          .join(", ");

        return selectedCombination === variantCombination;
      }) || null
    );
  };

  const matchingVariant = findMatchingVariant();

  // 선택된 옵션들의 총 가격 차이 계산
  const calculateTotalPriceDiff = () => {
    if (matchingVariant) {
      return matchingVariant.priceDiff;
    }

    if (Object.keys(selectedOptions).length === 0) {
      return 0;
    }

    let totalDiff = 0;
    Object.entries(selectedOptions).forEach(([optionName, optionValue]) => {
      const variant = product.variants?.find(
        (v) => v.optionName === optionName && v.optionValue === optionValue
      );
      if (variant) {
        totalDiff += variant.priceDiff;
      }
    });

    return totalDiff;
  };

  const totalPriceDiff = calculateTotalPriceDiff();
  const finalPrice = product.price + totalPriceDiff;

  // 품절 확인 - disable toàn bộ khi tất cả variants hết hàng
  const allVariantsOutOfStock = product.variants && product.variants.length > 0
    ? product.variants.every((v) => v.stock === 0)
    : false;

  const isOutOfStock = matchingVariant
    ? matchingVariant.stock === 0
    : selectedVariant
      ? selectedVariant.stock === 0
      : allVariantsOutOfStock;

  // 옵션이 없는 상품의 경우 기본 variant ID 설정
  const effectiveVariantId =
    Object.keys(groupedVariants).length === 0
      ? product.variants && product.variants.length > 0
        ? product.variants[0].id
        : product.id
      : matchingVariant?.id || selectedVariant?.id;

  const totalPrice = finalPrice * quantity;

  // 썸네일 이미지 배열 분리
  const thumbnails = product.thumbnailImages || [];
  const detailImage = product.detailImage;

  const safeAvgRating = product.avgRating ?? 0;

  // 모든 이미지 배열
  const allImages = [product.imageUrl, ...thumbnails];
  const currentImage = allImages[selectedImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12">
            {/* 상품 이미지 섹션 */}
            <div className="space-y-6">
              <div className="relative aspect-square">
                <Image
                  src={currentImage}
                  alt={product.title}
                  fill
                  className="object-cover rounded-2xl"
                  priority
                  quality={100}
                  unoptimized={currentImage.startsWith('http')}
                />

                {/* 상태 배지들 */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.badge &&
                    product.badge
                      .split(", ")
                      .slice(0, 3)
                      .map((badge, index) => {
                        let badgeStyle = "bg-gray-500";
                        let badgeText = badge;

                        switch (badge.toUpperCase()) {
                          case "SOLDOUT":
                            badgeStyle = "bg-red-500";
                            badgeText = "품절";
                            break;
                          case "NEW":
                            badgeStyle = "bg-gradient-to-r from-green-500 to-emerald-500";
                            badgeText = "NEW";
                            break;
                          case "BEST":
                            badgeStyle = "bg-gradient-to-r from-pink-500 to-purple-500";
                            badgeText = "BEST";
                            break;
                          case "SALE":
                            badgeStyle = "bg-gradient-to-r from-red-500 to-orange-500";
                            badgeText = "SALE";
                            break;
                          case "PREMIUM":
                            badgeStyle = "bg-gradient-to-r from-yellow-500 to-amber-500";
                            badgeText = "PREMIUM";
                            break;
                          default:
                            badgeStyle = "bg-gray-500";
                            badgeText = badge;
                        }

                        return (
                          <Badge
                            key={index}
                            className={`${badgeStyle} text-white font-bold`}
                          >
                            {badgeText}
                          </Badge>
                        );
                      })}
                </div>

                {/* 위시리스트 버튼 */}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 group"
                >
                  <Heart
                    className={`w-6 h-6 transition-all duration-200 ${isWishlisted
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
                            className={`aspect-square rounded-lg overflow-hidden bg-white cursor-pointer hover:shadow-lg transition-all duration-200 ${selectedImageIndex === actualIndex
                              ? "ring-2 ring-pink-200 scale-105"
                              : ""
                              }`}
                          >
                            <Image
                              src={image}
                              alt={`${product.title} 이미지 ${actualIndex + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                              quality={100}
                              unoptimized={image.startsWith('http')}
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
                {/* 가상 피팅용 이미지 선택 */}
                {allImages.length > 1 && (
                  <div className="mb-4 p-4 bg-white rounded-xl border-2 border-pink-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      가상 피팅에 사용할 이미지를 선택하세요
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {allImages.map((image, index) => (
                        <div
                          key={index}
                          onClick={() => setVfImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${vfImageIndex === index
                            ? "ring-2 ring-pink-500 scale-105 shadow-lg"
                            : "ring-1 ring-gray-200 hover:ring-pink-300"
                            }`}
                        >
                          <Image
                            src={image}
                            alt={`이미지 ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <VirtualFitting
                  productTitle={product.title}
                  productCategory={product.category}
                  currentImage={allImages[vfImageIndex]}
                />
              </div>
            </div>

            {/* 상품 정보 섹션 */}
            <div id="product-info" className="space-y-8">
              {/* 상품명 및 기본 정보 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  {/* 브랜드명 및 스토어명 */}
                  <div className="flex items-center gap-2 text-gray-600">
                    {product.brand?.name && (
                      <span className="font-medium text-pink-600">
                        {product.brand.name}
                      </span>
                    )}
                    {product.storeName &&
                      product.storeName !== product.brand?.name && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="font-medium">
                            {product.storeName}
                          </span>
                        </>
                      )}
                  </div>

                  {/* 카테고리 및 서브카테고리 */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <span>{product.category}</span>
                    {product.subCategory && (
                      <>
                        <span className="text-gray-300">&gt;</span>
                        <span className="text-gray-600">
                          {product.subCategory}
                        </span>
                      </>
                    )}
                  </div>

                  <h1 className="text-xl text-gray-900 leading-tight">
                    {product.title}
                  </h1>
                </div>

                {/* 평점 */}
                {product.reviewCount !== undefined && (
                  <div className="flex items-center gap-3">
                    {safeAvgRating > 0 && (
                      <>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < Math.floor(safeAvgRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {safeAvgRating}
                        </span>
                      </>
                    )}
                    <span className="text-gray-500">({product.reviewCount}개 리뷰)</span>
                  </div>
                )}
              </div>

              {/* 가격 */}
              <div className="">
                <div className="space-y-2">
                  <div className="flex flex-col items-baseline gap-3 flex-wrap">
                    {/* 원가 표시 (할인이 있는 경우) */}
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg text-gray-500 line-through">
                            {product.originalPrice.toLocaleString('ko-KR')}원
                          </span>
                          {product.discountRate && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {product.discountRate}% 할인
                            </Badge>
                          )}
                        </div>
                      )}

                    {/* 최종 판매가 */}
                    <span className="text-2xl font-bold text-pink-600">
                      {finalPrice.toLocaleString('ko-KR')}원
                    </span>

                    {totalPriceDiff !== 0 && (
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        기본가 {product.price.toLocaleString('ko-KR')}원
                        {totalPriceDiff > 0 ? " +" : " "}
                        {totalPriceDiff.toLocaleString('ko-KR')}원
                        {Object.keys(selectedOptions).length > 1 && (
                          <span className="text-xs text-gray-400 ml-1">
                            (옵션 총합)
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {quantity > 1 && (
                    <p className="text-lg font-semibold text-gray-700">
                      총 {totalPrice.toLocaleString('ko-KR')}원 (수량: {quantity})
                    </p>
                  )}
                </div>
              </div>

              {/* 상품 옵션 */}
              {Object.keys(groupedVariants).length > 0 && (
                <div className="space-y-4">
                  {allVariantsOutOfStock && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm font-medium">
                        ⚠️ 모든 옵션이 품절되었습니다
                      </p>
                    </div>
                  )}
                  {Object.entries(groupedVariants).map(
                    ([optionName, variants]) => (
                      <div key={optionName} className="space-y-2">
                        <label className={`text-sm font-semibold ${allVariantsOutOfStock ? 'text-gray-400' : 'text-gray-700'}`}>
                          {optionName}
                        </label>
                        <Select
                          value={selectedOptions[optionName] || ""}
                          onValueChange={(value) => {
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [optionName]: value,
                            }));

                            const variant = variants.find(
                              (v) => v.optionValue === value
                            );
                            setSelectedVariant(variant || null);
                          }}
                          disabled={allVariantsOutOfStock}
                        >
                          <SelectTrigger className={`w-full border-2 transition-colors rounded-xl h-12 ${allVariantsOutOfStock
                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-200 hover:border-pink-300'
                            }`}>
                            <SelectValue placeholder={`${optionName} 선택`} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {variants.map((variant) => {
                              const isOutOfStock = variant.stock <= 0;
                              return (
                                <SelectItem
                                  key={variant.id}
                                  value={variant.optionValue}
                                  disabled={isOutOfStock}
                                  className="rounded-lg"
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span className={`font-medium ${isOutOfStock ? 'text-gray-400' : ''}`}>
                                      {variant.optionValue}
                                      {isOutOfStock && ' (품절)'}
                                    </span>
                                    <div className="flex items-center gap-2 ml-4">
                                      {!isOutOfStock && variant.priceDiff !== 0 && (
                                        <span className="text-sm text-pink-600 font-semibold">
                                          {variant.priceDiff > 0 ? "+" : ""}
                                          {variant.priceDiff.toLocaleString('ko-KR')}원
                                        </span>
                                      )}
                                      {isOutOfStock ? (
                                        <Badge
                                          variant="destructive"
                                          className="text-xs"
                                        >
                                          품절
                                        </Badge>
                                      ) : variant.stock <= 5 ? (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs bg-yellow-100 text-yellow-800"
                                        >
                                          재고 {variant.stock}개
                                        </Badge>
                                      ) : null}
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* 수량 선택 */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">수량</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1 || allVariantsOutOfStock}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={allVariantsOutOfStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 구매 버튼 */}
              <div className="sticky">
                <PurchaseButton
                  productId={product.id}
                  productTitle={product.title}
                  productPrice={finalPrice}
                  quantity={quantity}
                  selectedOption={
                    Object.keys(selectedOptions).length > 0
                      ? Object.entries(selectedOptions)
                        .map(([name, value]) => `${name}: ${value}`)
                        .join(", ")
                      : selectedVariant
                        ? `${selectedVariant.optionName}: ${selectedVariant.optionValue}`
                        : ""
                  }
                  hasOptions={Object.keys(groupedVariants).length > 0}
                  isOutOfStock={isOutOfStock}
                  variantId={effectiveVariantId}
                />
              </div>

              {/* 배송 및 서비스 정보 */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">무료배송</p>
                      <p className="text-xs text-gray-500">모든 주문</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">품질보증</p>
                      <p className="text-xs text-gray-500">정품보장</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">교환/반품</p>
                      <p className="text-xs text-gray-500">7일 이내</p>
                    </div>
                  </div>
                </div>
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

          {/* 상품 상세 */}
          {(product.description || detailImage) && (
            <div id="product-detail" className="max-w-3xl mx-auto mt-16">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 text-center">상품 상세</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
              </div>

              {product.description && (
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: product.description,
                  }}
                />
              )}

              {!product.description && detailImage && (
                <Image
                  src={detailImage}
                  alt="상품 상세 이미지"
                  width={1200}
                  height={1600}
                  className="w-full h-auto"
                  quality={100}
                  unoptimized={detailImage.startsWith('http')}
                />
              )}
            </div>
          )}

          {/* 리뷰 섹션 */}
          <div id="reviews" className="max-w-6xl mx-auto mt-16">
            <ProductReviews
              productId={product.id}
              statsFromProduct={{
                averageRating: product.avgRating,
                totalReviews: product.reviewCount,
              }}
              fetchList={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

