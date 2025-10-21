"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { usePublicCategories } from "@/hooks/useCategories";
import { ProductResponseDto } from "@/types/product";
import { useInfiniteQuery } from "@tanstack/react-query";
import CategoryDropdown from "@/components/ui/category-dropdown";
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
    price: firstVariant?.price || product.basePrice,
    originalPrice: firstVariant?.compareAtPrice || product.baseCompareAtPrice,
    image: defaultImage,
    brand: product.brand?.name || "BOGOFIT",
    brandSlug: product.brand?.slug, // Brand slug for SEO-friendly URLs
    discount: firstVariant?.compareAtPrice && firstVariant?.price 
      ? Math.round(((firstVariant.compareAtPrice - firstVariant.price) / firstVariant.compareAtPrice) * 100)
      : undefined,
  };
};


export default function RecommendPage() {
  const [recommendType, setRecommendType] = useState<"ai" | "editor">("ai");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showSoldOut, setShowSoldOut] = useState(false);
  
  // Ref for infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = usePublicCategories();
  const categories = categoriesData?.data || [];
  
  // Handle category selection from dropdown
  const handleCategorySelect = (categoryId: string, categoryPath?: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryPath(categoryPath || "");
  };

  // Fetch products with infinite scroll
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["recommend-products", recommendType, selectedCategoryId, searchQuery, sortBy, showSoldOut],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        pageSize: "24", // Load 24 products per page
        isActive: "true",
      });
      
      // Add category filter if selected
      if (selectedCategoryId) {
        params.append("categoryId", selectedCategoryId);
      }
      
      // Add search if provided
      if (searchQuery) params.append("search", searchQuery);
      if (sortBy) params.append("sortBy", sortBy);
      if (showSoldOut) params.append("showSoldOut", "true");
      
      const res = await fetch(`/api/product?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      // NEW API Format: pagination object
      const currentPage = lastPage?.pagination?.page ?? 1;
      const totalPages = lastPage?.pagination?.totalPages ?? 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialPageParam: 1,
  });

  // Flatten all products from all pages
  // NEW API Format: products (flat) instead of data.data.data (nested)
  const allProducts = data?.pages.flatMap((page) => 
    page?.products || []
  ) || [];
  const displayProducts = allProducts.map(convertToDisplayProduct);
  
  // Get total count from first page (actual total from API)
  // NEW API Format: pagination.totalCount
  const firstPage = data?.pages[0];
  const totalCount = firstPage?.pagination?.totalCount ?? 0;
  
  // Debug: Log API response structure
  useEffect(() => {
    if (firstPage) {
      console.log("📊 Recommend API Response:", {
        productsCount: firstPage?.products?.length,
        totalCount: firstPage?.pagination?.totalCount,
        page: firstPage?.pagination?.page,
        totalPages: firstPage?.pagination?.totalPages,
        hasNextPage: firstPage?.pagination?.hasNextPage,
        displayedTotal: displayProducts.length
      });
    }
  }, [firstPage, displayProducts.length]);

  // Set page title
  useEffect(() => {
    document.title = "추천 상품 - BOGOFIT";
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">추천</h1>
          </div>
          <p className="text-gray-600 mb-6">당신만을 위한 특별한 상품을 추천해드립니다</p>

          {/* Recommendation Type Tabs */}
          <div className="flex gap-6 mb-6">
            <button
              onClick={() => setRecommendType("ai")}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                recommendType === "ai"
                  ? "border-pink-500 text-gray-900"
                  : "border-transparent text-gray-500"
              }`}
            >
              <div className={`w-4 h-4 rounded-full ${
                recommendType === "ai" ? "bg-pink-100" : "bg-gray-100"
              }`} />
              AI 추천
            </button>
            <button
              onClick={() => setRecommendType("editor")}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                recommendType === "editor"
                  ? "border-pink-500 text-gray-900"
                  : "border-transparent text-gray-500"
              }`}
            >
              <Wand2 className="h-4 w-4" />
              에디터 추천
            </button>
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">카테고리 선택</h3>
            
            {/* All Categories Button */}
            <div className="mb-4">
              <button
                onClick={() => {
                  setSelectedCategoryId("");
                  setSelectedCategoryPath("");
                }}
                className={`px-6 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  !selectedCategoryId
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                전체 상품 (랜덤)
              </button>
            </div>

            {/* Category Dropdown */}
            <CategoryDropdown
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={handleCategorySelect}
              isLoading={categoriesLoading}
              error={categoriesError?.message}
              compactMode={true}
            />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="상품명, 브랜드명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="newest">최신순</option>
              <option value="price_asc">낮은 가격순</option>
              <option value="price_desc">높은 가격순</option>
              <option value="popular">인기순</option>
            </select>

            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              필터
            </button>
          </div>

          {/* Active Filter Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedCategoryPath && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                {selectedCategoryPath}
                <button
                  onClick={() => {
                    setSelectedCategoryId("");
                    setSelectedCategoryPath("");
                  }}
                  className="text-pink-500 hover:text-pink-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {searchQuery && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                검색: {searchQuery}
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {showSoldOut && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                품절 상품 표시
                <button
                  onClick={() => setShowSoldOut(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {/* Products Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCategoryPath 
                  ? `${selectedCategoryPath} 상품`
                  : '추천 상품 (랜덤)'
                }
              </h2>
              <p className="text-gray-600">
                총 <span className="font-semibold">{totalCount}</span>개의 상품
                {displayProducts.length > 0 && displayProducts.length < totalCount && (
                  <span className="text-sm text-gray-500 ml-2">
                    (현재 {displayProducts.length}개 로드됨)
                  </span>
                )}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {recommendType === 'ai' ? 'AI 추천' : '에디터 추천'}
            </div>
          </div>
        </div>

        {error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">상품을 불러올 수 없습니다</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="ml-2 text-gray-600">상품을 불러오는 중...</span>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">추천 상품이 없습니다</h3>
            <p className="text-gray-600">다른 카테고리나 검색어를 시도해보세요.</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {displayProducts.map((product: ReturnType<typeof convertToDisplayProduct>) => (
                <Cafe24ProductCard key={product.id} product={product} />
              ))}
            </motion.div>

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-pink-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">더 많은 상품을 불러오는 중...</span>
                </div>
              )}
              {!hasNextPage && displayProducts.length > 0 && (
                <p className="text-sm text-gray-500">모든 상품을 불러왔습니다</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

