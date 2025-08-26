"use client";

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
import ProductReview from "@/components/product/ProductReview";

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
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12">
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

  // 선택된 옵션들로부터 최종 variant 찾기 (다중 옵션 조합)
  const findMatchingVariant = () => {
    if (!product.variants || Object.keys(selectedOptions).length === 0) {
      return null;
    }

    const optionNames = Object.keys(groupedVariants);
    const selectedOptionNames = Object.keys(selectedOptions);

    // 옵션이 하나인 경우 - 기존 방식대로 처리
    if (optionNames.length === 1) {
      return (
        product.variants.find(
          (variant) =>
            variant.optionName === optionNames[0] &&
            variant.optionValue === selectedOptions[optionNames[0]]
        ) || null
      );
    }

    // 다중 옵션인 경우 - 모든 옵션이 선택되어야 함
    if (optionNames.length !== selectedOptionNames.length) {
      return null;
    }

    // 선택된 옵션 조합을 문자열로 만들어서 비교
    // 예: "사이즈: M, 색상: 블랙" 형태로 조합
    const selectedCombination = optionNames
      .sort()
      .map((name) => `${name}: ${selectedOptions[name]}`)
      .join(", ");

    // variant의 optionValue가 조합된 형태인지 확인
    return (
      product.variants.find((variant) => {
        // variant.optionValue가 "M, 블랙" 같은 형태일 수 있음
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

    // 각 선택된 옵션의 가격 차이를 합산
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

  // 최종 가격 계산 (기본 가격 + 선택된 옵션의 가격 차이)
  const finalPrice = product.price + totalPriceDiff;

  // 품절 확인 (옵션값에 "품절" 단어 포함 여부)
  const isOutOfStock = matchingVariant
    ? matchingVariant.optionValue.includes("품절")
    : selectedVariant
      ? selectedVariant.optionValue.includes("품절")
      : product.variants && product.variants.length > 0
        ? product.variants.every((v) => v.optionValue.includes("품절"))
        : false;

  // 옵션이 없는 상품의 경우 기본 variant ID 설정 (첫 번째 variant 또는 product.id 사용)
  const effectiveVariantId =
    Object.keys(groupedVariants).length === 0
      ? product.variants && product.variants.length > 0
        ? product.variants[0].id
        : product.id // 옵션이 없으면 product.id를 variantId로 사용
      : matchingVariant?.id || selectedVariant?.id;

  console.log("상품 옵션 선택 상태:", {
    hasOptions: Object.keys(groupedVariants).length > 0,
    selectedOptions,
    matchingVariant: matchingVariant?.id,
    selectedVariant: selectedVariant?.id,
    totalPriceDiff,
    finalPrice,
    effectiveVariantId,
    allVariants: product.variants?.map((v) => ({
      id: v.id,
      optionName: v.optionName,
      optionValue: v.optionValue,
      priceDiff: v.priceDiff,
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12">
            {/* 상품 이미지 섹션 */}
            <div className="space-y-6">
              <div className="relative aspect-square">
                <Image
                  src={currentImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />

                {/* 상태 배지들 */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.badge &&
                    product.badge
                      .split(", ")
                      .slice(0, 3) // 최대 3개만 표시
                      .map((badge, index) => {
                        let badgeStyle = "bg-gray-500";
                        let badgeText = badge;

                        // 뱃지별 스타일 설정
                        switch (badge.toUpperCase()) {
                          case "SOLDOUT":
                            badgeStyle = "bg-red-500";
                            badgeText = "품절";
                            break;
                          case "NEW":
                            badgeStyle =
                              "bg-gradient-to-r from-green-500 to-emerald-500";
                            badgeText = "NEW";
                            break;
                          case "BEST":
                            badgeStyle =
                              "bg-gradient-to-r from-pink-500 to-purple-500";
                            badgeText = "BEST";
                            break;
                          case "SALE":
                            badgeStyle =
                              "bg-gradient-to-r from-red-500 to-orange-500";
                            badgeText = "SALE";
                            break;
                          case "PREMIUM":
                            badgeStyle =
                              "bg-gradient-to-r from-yellow-500 to-amber-500";
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
                            className={`aspect-square rounded-lg overflow-hidden bg-white cursor-pointer hover:shadow-lg transition-all duration-200 ${
                              selectedImageIndex === actualIndex
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
              <div className="">
                <div className="space-y-2">
                  <div className="flex flex-col items-baseline gap-3 flex-wrap">
                    {/* 원가 표시 (할인이 있는 경우) */}
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg text-gray-500 line-through">
                            {product.originalPrice.toLocaleString()}원
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
                      {finalPrice.toLocaleString()}원
                    </span>

                    {totalPriceDiff !== 0 && (
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        기본가 {product.price.toLocaleString()}원
                        {totalPriceDiff > 0 ? " +" : " "}
                        {totalPriceDiff.toLocaleString()}원
                        {Object.keys(selectedOptions).length > 1 && (
                          <span className="text-xs text-gray-400 ml-1">
                            (옵션 합계)
                          </span>
                        )}
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
                  {Object.entries(groupedVariants).map(
                    ([optionName, variants]) => (
                      <div key={optionName} className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          {optionName}
                        </label>
                        <Select
                          value={selectedOptions[optionName] || ""}
                          onValueChange={(value) => {
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [optionName]: value,
                            }));

                            // 기존 selectedVariant 로직도 유지 (호환성을 위해)
                            const variant = variants.find(
                              (v) => v.optionValue === value
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
                                value={variant.optionValue}
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

              {/* 선택된 옵션 요약 */}
              {Object.keys(selectedOptions).length > 0 && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    선택된 옵션
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(selectedOptions).map(([name, value]) => {
                      const variant = product.variants?.find(
                        (v) => v.optionName === name && v.optionValue === value
                      );
                      return (
                        <div
                          key={name}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-600">
                            {name}:{" "}
                            <span className="font-medium text-gray-800">
                              {value}
                            </span>
                          </span>
                          {variant && variant.priceDiff !== 0 && (
                            <span className="text-sm font-semibold text-pink-600">
                              {variant.priceDiff > 0 ? "+" : ""}
                              {variant.priceDiff.toLocaleString()}원
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {Object.keys(selectedOptions).length > 1 &&
                      totalPriceDiff !== 0 && (
                        <div className="pt-2 mt-2 border-t border-pink-200 flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">
                            옵션 합계
                          </span>
                          <span className="text-sm font-bold text-pink-600">
                            {totalPriceDiff > 0 ? "+" : ""}
                            {totalPriceDiff.toLocaleString()}원
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* 수량 선택 */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  수량
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 구매 버튼 */}
              <div className="sticky ">
                <PurchaseButton
                  productId={Number(params.id)}
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
                      <p className="font-semibold text-sm">품질보장</p>
                      <p className="text-xs text-gray-500">100% 정품</p>
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

          {/* 리모트 위젯 메뉴바 */}
          <div className="fixed right-6 bottom-0 -translate-y-1/2 z-40 hidden sm:block">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-2">
              <nav className="flex flex-col space-y-2">
                <button
                  onClick={() =>
                    document
                      .getElementById("product-info")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-200 group relative cursor-pointer"
                  title="상품정보"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-white rounded-sm"></div>
                  </div>
                  <div className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    상품정보
                  </div>
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("product-detail")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-200 group relative cursor-pointer"
                  title="상품상세"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </div>
                  <div className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    상품상세
                  </div>
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("reviews")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-200 group relative cursor-pointer"
                  title="리뷰"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 border border-white rounded-full"></div>
                  </div>
                  <div className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    리뷰
                  </div>
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("qna")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-200 group relative cursor-pointer"
                  title="Q&A"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Q&A
                  </div>
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("shipping-info")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-200 group relative cursor-pointer"
                  title="배송/교환/반품"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-2 bg-white rounded-sm"></div>
                  </div>
                  <div className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    배송/교환/반품
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* 상품 상세 (HTML description 또는 이미지) */}
          {(product.description || detailImage) && (
            <div id="product-detail" className="max-w-3xl mx-auto mt-16">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  상품 상세
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
              </div>

              {/* HTML description이 있으면 표시 (Tiptap 에디터에서 생성된 HTML) */}
              {product.description && (
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: product.description,
                  }}
                />
              )}

              {/* HTML description이 없고 detailImage만 있으면 이미지 표시 */}
              {!product.description && detailImage && (
                <Image
                  src={detailImage}
                  alt="상세 이미지"
                  width={1200}
                  height={1600}
                  className="w-full h-auto"
                />
              )}
            </div>
          )}

          {/* 리뷰 섹션 */}
          <div id="reviews" className="max-w-6xl mx-auto mt-16">
            <ProductReview
              productId={product.id}
              onReviewSubmit={(review) => {
                console.log("새 리뷰 제출:", review);
                // 실제로는 API 호출을 통해 리뷰를 저장하고 상품 데이터를 다시 로드
              }}
            />
          </div>

          {/* Q&A 섹션 */}
          <div id="qna" className="max-w-6xl mx-auto mt-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Q&A
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  아직 등록된 문의가 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  상품에 대해 궁금한 점이 있으시면 언제든 문의해주세요.
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200">
                  문의하기
                </button>
              </div>
            </div>
          </div>

          {/* 배송/교환/반품 정보 */}
          <div id="shipping-info" className="max-w-6xl mx-auto mt-16 mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                배송/교환/반품
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-pink-500" />
                    배송 정보
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 배송비: 무료배송</p>
                    <p>• 배송기간: 주문 후 7-10일 (영업일 기준)</p>
                    <p>• 배송지역: 전국</p>
                    <p>• 택배사: CJ대한통운</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-500" />
                    교환/반품
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 교환/반품 기간: 상품 수령 후 7일 이내</p>
                    <p>• 교환/반품 비용: 고객 부담</p>
                    <p>• 단순변심 시 왕복배송비 부담</p>
                    <p>• 불량품/오배송 시 무료 교환</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    주의사항
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 착용 후 교환/반품 불가</p>
                    <p>• 세탁 후 교환/반품 불가</p>
                    <p>• 상품 택 제거 시 교환/반품 불가</p>
                    <p>• 고객 과실로 인한 손상 시 불가</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
