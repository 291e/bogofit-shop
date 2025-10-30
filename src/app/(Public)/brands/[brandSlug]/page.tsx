"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Store, Search, X, SlidersHorizontal, Mail, Phone, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ProductResponseDto } from "@/types/product";
import { BrandResponseDto } from "@/types/brand";
import Link from "next/link";
import Image from "next/image";
import { Cafe24ProductCard } from "@/components/(Public)/mainPage/sections/Cafe24ProductCard";

// Convert ProductResponseDto to display format
const convertToDisplayProduct = (product: ProductResponseDto) => {
  // v2.0: Use first variant instead of default variant
  const firstVariant = product.variants?.[0];
  const defaultImage = product.images?.[0] || "/logo.png";

  return {
    id: product.id,
    name: product.name,
    slug: product.slug, // Product slug for SEO-friendly URLs
    price: product.finalPrice || firstVariant?.price || product.basePrice,
    originalPrice: product.baseCompareAtPrice || firstVariant?.compareAtPrice,
    image: defaultImage,
    brand: product.brand?.name || "BOGOFIT",
    discount: (() => {
      if (product.finalPrice && product.basePrice) {
        const diff = product.basePrice - product.finalPrice;
        return diff > 0 ? Math.round((diff / product.basePrice) * 100) : undefined;
      }
      if (product.promotion) {
        return product.promotion.type === 'percentage'
          ? (product.promotion.value || 0)
          : product.promotion.type === 'fixed_amount'
            ? Math.round(((product.promotion.value || 0) / (product.basePrice || 1)) * 100)
            : undefined;
      }
      if (firstVariant?.compareAtPrice && firstVariant?.price) {
        return Math.round(((firstVariant.compareAtPrice - firstVariant.price) / firstVariant.compareAtPrice) * 100);
      }
      if (product.baseCompareAtPrice && product.basePrice) {
        return Math.round(((product.baseCompareAtPrice - product.basePrice) / product.baseCompareAtPrice) * 100);
      }
      return undefined;
    })(),
  };
};

// Product Card Component

export default function BrandDetailPage() {
  const params = useParams();
  const brandSlug = params.brandSlug as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch brand data
  const { data: brandData, isLoading: brandLoading, error: brandError } = useQuery({
    queryKey: ["brand", brandSlug],
    queryFn: async () => {
      const response = await fetch(`/api/brand?slug=${brandSlug}`);
      if (!response.ok) throw new Error("Failed to fetch brand");
      const data = await response.json();

      // API returns { brands: [...] } so we need to find the matching brand
      if (data.brands && data.brands.length > 0) {
        return data.brands[0] as BrandResponseDto;
      }

      throw new Error("Brand not found");
    },
    enabled: !!brandSlug,
  });

  // Fetch products with infinite scroll
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: productsLoading,
    error: productsError,
  } = useInfiniteQuery({
    queryKey: ["products", "brand", brandSlug, searchQuery, sortBy],
    queryFn: async ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams({
        page: pageParam.toString(),
        pageSize: "24",
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy && { sortBy }),
        ...(brandData?.id && { brandId: brandData.id.toString() }),
      });
      searchParams.append('include', 'true');

      const response = await fetch(`/api/product?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;

      const currentPage = lastPage.pagination.page;
      const totalPages = lastPage.pagination.totalPages;

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!brandData?.id,
    initialPageParam: 1,
  });

  // Convert products to display format
  const allProducts = productsData?.pages.flatMap((page) => page?.products || []) || [];
  const displayProducts = allProducts.map(convertToDisplayProduct);
  const firstPage = productsData?.pages[0];
  const totalCount = firstPage?.pagination?.totalCount ?? 0;

  // Infinite scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Loading states
  if (brandLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">브랜드 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (brandError || productsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">브랜드 정보를 불러올 수 없습니다.</p>
          <Link href="/brands" className="text-blue-600 hover:text-blue-700">
            브랜드 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">브랜드를 찾을 수 없습니다.</p>
          <Link href="/brands" className="text-blue-600 hover:text-blue-700">
            브랜드 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {/* Brand Logo */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
              {brandData.logoUrl ? (
                <Image
                  src={brandData.logoUrl}
                  alt={brandData.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Store className="h-8 w-8 text-gray-400" />
              )}
            </div>

            {/* Brand Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{brandData.name}</h1>
              {brandData.description && (
                <p className="text-gray-600 mb-4 max-w-2xl">{brandData.description}</p>
              )}

              {/* Brand Contact Info */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                {brandData.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{brandData.contactEmail}</span>
                  </div>
                )}
                {brandData.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{brandData.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="상품 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">최신순</option>
              <option value="price-low">가격 낮은순</option>
              <option value="price-high">가격 높은순</option>
              <option value="name">이름순</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              필터
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {brandData.name} 상품 ({totalCount.toLocaleString()}개)
          </h2>
        </div>

        {/* Products Grid */}
        {displayProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {displayProducts.map((product: ReturnType<typeof convertToDisplayProduct>) => (
              <Cafe24ProductCard
                key={product.id}
                product={{
                  ...product,
                  brandSlug: brandSlug
                }}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">등록된 상품이 없습니다.</p>
            <p className="text-sm text-gray-400">다른 검색어로 시도해보세요.</p>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>더 많은 상품을 불러오는 중...</span>
            </div>
          )}
          {!hasNextPage && displayProducts.length > 0 && (
            <p className="text-gray-500 text-sm">모든 상품을 불러왔습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
