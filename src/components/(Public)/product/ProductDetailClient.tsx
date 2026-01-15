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
import VirtualFitting from "@/components/(Public)/solution/fashion/VirtualFitting";
import { ProductReviews } from "@/components/(Public)/product/ProductReviews";
import { ProductInquiries } from "@/components/(Public)/product/ProductInquiries";
import { useLanguage } from "@/providers/languageProvider";

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
  detailImages?: string[]; // ✅ Changed to array
  productDetails?: any[]; // ✅ Added size chart support
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
  quantity?: number;
  status: string;
  sku?: string;
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { t } = useLanguage();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [vfImageIndex, setVfImageIndex] = useState(0); // Virtual Fitting용 이미지 인덱스

  // Translate option name
  const translateOptionName = (optionName: string): string => {
    const translationKey = `productDetail.optionNames.${optionName.toLowerCase()}`;
    const translated = t(translationKey);
    // If translation exists and is different from the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Fallback to original name with first letter capitalized
    return optionName.charAt(0).toUpperCase() + optionName.slice(1);
  };

  // ✅ Size Chart Parsing Logic
  const sizeChartData = React.useMemo(() => {
    if (!product.productDetails || product.productDetails.length === 0) return null;

    try {
      const parsedRows = product.productDetails.map(row => {
        if (typeof row === 'string') {
          return JSON.parse(row);
        }
        return row;
      });
      if (parsedRows.length === 0) return null;

      // Extract columns from the first row's values
      const firstRow = parsedRows[0];
      const columns = Object.keys(firstRow.values || {});

      return { columns, rows: parsedRows };
    } catch (e) {
      console.error("Failed to parse size chart:", e);
      return null;
    }
  }, [product.productDetails]);

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
      : (product.variants && product.variants.length > 0)
        ? product.variants.every((v) => v.stock === 0)
        : (product.quantity !== undefined && product.quantity === 0);

  // 옵션이 없는 상품의 경우 기본 variant ID 설정
  const effectiveVariantId =
    Object.keys(groupedVariants).length === 0
      ? product.variants && product.variants.length > 0
        ? product.variants[0].id
        : undefined
      : matchingVariant?.id || selectedVariant?.id;

  const totalPrice = finalPrice * quantity;

  // 썸네일 이미지 배열 분리
  const thumbnails = product.thumbnailImages || [];
  const detailImages = product.detailImages || []; // ✅ Use multiple images

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
                            badgeText = t("productDetail.soldOut");
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
                              alt={t("productDetail.image").replace("{index}", (actualIndex + 1).toString())}
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
                      {t("productDetail.selectImageForVirtualFitting")}
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
                            alt={t("productDetail.image").replace("{index}", (index + 1).toString())}
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
            <div id="product-info" className="space-y-6">
              {/* 상품명 및 기본 정보 */}
              <div className="space-y-4">
                <div className="space-y-1">
                  {/* 1. 브랜드 (Shop Name) */}
                  <div className="flex items-center gap-2">
                    <span className="text-pink-600 font-bold text-lg uppercase tracking-wide">
                      브랜드: {product.storeName ? product.storeName.toUpperCase() : product.brand?.name?.toUpperCase()}
                    </span>
                  </div>



                  {/* 3. 상품명 */}
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    상품명: {product.title}
                  </h1>
                  {/* 2. 카테고리 */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <span>카테고리: {product.category}</span>
                    {product.subCategory && (
                      <>
                        <span className="text-gray-300">&gt;</span>
                        <span className="text-gray-600">
                          {product.subCategory}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* 평점 (Optional - keeping it for completeness but making it subtle) */}
                {product.reviewCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= Math.floor(safeAvgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">
                      ({t("productDetail.reviews").replace("{count}", product.reviewCount?.toString() || "0")})
                    </span>
                  </div>
                )}
              </div>

              {/* 가격 및 혜택 */}
              <div className="border-b border-gray-100 pb-6 space-y-4">
                <div className="flex flex-col items-baseline gap-2">
                  <div className="flex items-center gap-3">
                    {/* 최종 판매가 */}
                    <span className="text-3xl font-bold text-gray-900">
                      {t("productDetail.won").replace("{amount}", finalPrice.toLocaleString('ko-KR'))}
                    </span>

                    {/* 원가 표시 (할인이 있는 경우) */}
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="text-lg text-gray-400 line-through">
                          {t("productDetail.won").replace("{amount}", product.originalPrice.toLocaleString('ko-KR'))}
                        </span>
                      )}

                    {product.discountRate && (
                      <Badge className="bg-red-500 text-white hover:bg-red-600">
                        {t("productDetail.discount").replace("{percent}", product.discountRate.toString())}
                      </Badge>
                    )}
                  </div>

                  {totalPriceDiff !== 0 && (
                    <span className="text-sm text-gray-500">
                      {t("productDetail.basePrice").replace("{amount}", product.price.toLocaleString('ko-KR'))}
                      {totalPriceDiff > 0 ? " +" : " "}
                      {t("productDetail.won").replace("{amount}", totalPriceDiff.toLocaleString('ko-KR'))}
                    </span>
                  )}
                </div>
              </div>

              {/* 상품 옵션 */}
              {Object.keys(groupedVariants).length > 0 ? (
                <div className="space-y-4">
                  {allVariantsOutOfStock && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm font-medium">
                        {t("productDetail.allOptionsSoldOut")}
                      </p>
                    </div>
                  )}
                  {Object.entries(groupedVariants).map(
                    ([optionName, variants]) => (
                      <div key={optionName} className="space-y-2">
                        <label className={`text-sm font-semibold ${allVariantsOutOfStock ? 'text-gray-400' : 'text-gray-700'}`}>
                          {translateOptionName(optionName)}
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
                            <SelectValue placeholder={t("productDetail.selectOption").replace("{optionName}", translateOptionName(optionName))} />
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
                                      {isOutOfStock && ` ${t("productDetail.soldOut")}`}
                                    </span>
                                    <div className="flex items-center gap-2 ml-4">
                                      {!isOutOfStock && variant.priceDiff !== 0 && (
                                        <span className="text-sm text-pink-600 font-semibold">
                                          {variant.priceDiff > 0 ? "+" : ""}
                                          {t("productDetail.won").replace("{amount}", variant.priceDiff.toLocaleString('ko-KR'))}
                                        </span>
                                      )}
                                      {isOutOfStock ? (
                                        <Badge
                                          variant="destructive"
                                          className="text-xs"
                                        >
                                          {t("productDetail.outOfStock")}
                                        </Badge>
                                      ) : variant.stock <= 5 ? (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs bg-yellow-100 text-yellow-800"
                                        >
                                          {t("productDetail.stock").replace("{count}", variant.stock.toString())}
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
              ) : (
                /* No Options - Show OutOfStock warning if needed */
                isOutOfStock && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">
                      {t("productDetail.outOfStock")}
                    </p>
                  </div>
                )
              )}

              {/* 수량 선택 */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">{t("productDetail.quantity")}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isOutOfStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 구매 버튼 */}
              <div className="sticky bottom-0 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 border-t md:static md:bg-transparent md:p-0 md:border-0 z-10 space-y-4">
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

                {/* 간단한 서비스 정보 - Moved to bottom for better flow */}
                <div className="flex items-center justify-between gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{t("productDetail.freeShipping")}</span>
                  </div>
                  <div className="w-px h-3 bg-gray-300"></div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{t("productDetail.authenticGuarantee")}</span>
                  </div>
                  <div className="w-px h-3 bg-gray-300"></div>
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t("productDetail.exchangeReturn")}</span>
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

          {/* Sticky Navigation Tabs */}
          <div className="sticky z-40 bg-white shadow-sm border-b border-gray-100 mt-16">
            <div className="flex justify-center max-w-8xl mx-auto">
              {[
                { id: "product-detail", label: "상품 상세" },
                { id: "product-size", label: "상품 사이즈" },
                { id: "reviews", label: "리뷰" },
                { id: "inquiries", label: "문의" },
              ].map((tab) => (
                <a
                  key={tab.id}
                  href={`#${tab.id}`}
                  className="flex-1 py-4 text-center text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-colors border-b-2 border-transparent hover:border-pink-600 focus:outline-none"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(tab.id);
                    if (element) {
                      const y = element.getBoundingClientRect().top + window.scrollY - 100; // Offset for sticky header
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                >
                  {tab.label}
                </a>
              ))}
            </div>
          </div>

          {/* 상품 상세 (Description & Images) */}
          <div id="product-detail" className="max-w-6xl mx-auto mt-8 scroll-mt-28">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                상품 상세
              </h3>
            </div>
            {product.description && (
              <div
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            )}

            {detailImages.length > 0 ? (
              <div className="space-y-4">
                {detailImages.map((img, index) => (
                  <div key={index} className="w-full">
                    <Image
                      src={img}
                      alt={`${t("productDetail.productDetailImage")} ${index + 1}`}
                      width={1200}
                      height={1600}
                      className="w-full h-auto"
                      quality={100}
                      unoptimized={img.startsWith('http')}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* 상품 사이즈 (Size Chart) */}
          <div id="product-size" className="max-w-6xl mx-auto mt-12 scroll-mt-28">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                상품 사이즈
              </h3>
            </div>
            {sizeChartData ? (
              <div className="mb-12">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-center text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">사이즈</th>
                        {sizeChartData.columns.map((col, i) => (
                          <th key={i} className="px-6 py-3">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChartData.rows.map((row: any, i: number) => (
                        <tr key={i} className="bg-white border-b">
                          <td className="px-6 py-4 font-medium text-gray-900">{row.size}</td>
                          {sizeChartData.columns.map((col, j) => (
                            <td key={j} className="px-6 py-4">
                              {row.values[col] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>등록된 사이즈 정보가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 리뷰 섹션 */}
          <div id="reviews" className="max-w-6xl mx-auto mt-12 scroll-mt-28">
            <ProductReviews
              productId={product.id}
              statsFromProduct={{
                averageRating: product.avgRating,
                totalReviews: product.reviewCount,
              }}
              fetchList={true}
            />
          </div>

          {/* 상품 문의 섹션 */}
          <div id="inquiries" className="max-w-6xl mx-auto mt-12 mb-12 scroll-mt-28">
            <ProductInquiries
              productId={product.id}
              fetchList={true}
            />
          </div>
        </div>
      </div>
    </div >
  );
}

