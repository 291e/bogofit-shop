"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search, X, Loader2 } from "lucide-react";
import { usePublicCategories } from "@/hooks/useCategories";
import { ProductResponseDto } from "@/types/product";
import { useInfiniteQuery } from "@tanstack/react-query";
import CategoryDropdown from "@/components/ui/category-dropdown";
import { Cafe24ProductCard } from "@/components/(Public)/mainPage/sections/Cafe24ProductCard";
import { useLanguage } from "@/providers/languageProvider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Convert ProductResponseDto to display format
const convertToDisplayProduct = (product: ProductResponseDto) => {
  // v2.0: Use first variant instead of default variant
  const firstVariant = product.variants?.[0];
  const defaultImage = product.thumbUrl || product.images?.[0] || "/logo.png";

  return {
    id: product.id,
    name: product.name,
    slug: product.slug, // Product slug for SEO-friendly URLs
    price: product.finalPrice || firstVariant?.price || product.basePrice,
    originalPrice: product.baseCompareAtPrice || firstVariant?.compareAtPrice,
    image: defaultImage,
    brand: product.brand?.name || "BOGOFIT",
    brandSlug: product.brand?.slug, // Brand slug for SEO-friendly URLs
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


export default function RecommendPage() {
  const { t } = useLanguage();
  const [recommendType] = useState<"ai" | "editor">("ai");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showSoldOut] = useState(false);

  // Ref for infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Map frontend sortBy to backend sortBy and sortOrder
  const getBackendSortParams = (frontendSortBy: string) => {
    switch (frontendSortBy) {
      case "priceAsc":
        return { sortBy: "finalPrice", sortOrder: "asc" };
      case "priceDesc":
        return { sortBy: "price", sortOrder: "desc" };
      case "newest":
        // For newest, we can use createdAt or just rely on default backend sorting
        return { sortBy: undefined, sortOrder: undefined };
      case "popular":
        // For popular, backend might have a different field
        return { sortBy: undefined, sortOrder: undefined };
      default:
        return { sortBy: undefined, sortOrder: undefined };
    }
  };

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = usePublicCategories();
  const categories = categoriesData?.data || [];

  // Handle category selection from dropdown
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
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

      // Add backend sorting parameters
      const backendSort = getBackendSortParams(sortBy);
      if (backendSort.sortBy) {
        params.append("sortBy", backendSort.sortBy);
      }
      if (backendSort.sortOrder) {
        params.append("sortOrder", backendSort.sortOrder);
      }

      // Include related data; avoid filtering by promotion
      params.append('include', 'true');
      if (showSoldOut) params.append("showSoldOut", "true");

      const res = await fetch(`/api/product?${params.toString()}`, {
        cache: 'no-store'
      });
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

  // Set page title
  useEffect(() => {
    document.title = `${t("recommend.title")} - BOGOFIT`;
  }, [t]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          {/* Category Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">{t("recommend.categorySelection")}</h3>

            {/* All Categories Button */}
            <div className="mb-4">
              <button
                onClick={() => {
                  setSelectedCategoryId("");
                }}
                className={`px-6 py-3 rounded-lg border text-sm font-medium transition-colors ${!selectedCategoryId
                  ? "bg-pink-500 text-white border-pink-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                {t("recommend.allProducts")}
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
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder={t("recommend.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("recommend.sortOptions.newest")}</SelectItem>
                <SelectItem value="priceAsc">{t("recommend.sortOptions.priceAsc")}</SelectItem>
                <SelectItem value="priceDesc">{t("recommend.sortOptions.priceDesc")}</SelectItem>
                <SelectItem value="popular">{t("recommend.sortOptions.popular")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("recommend.totalProducts").replace("{count}", totalCount.toLocaleString())}
            {displayProducts.length > 0 && displayProducts.length < totalCount && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({t("recommend.currentlyLoaded").replace("{count}", displayProducts.length.toString())})
              </span>
            )}
          </h2>
        </div>

        {error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("recommend.error")}</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              {t("recommend.retry")}
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="ml-2 text-gray-600">{t("recommend.loading")}</span>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("recommend.noProducts")}</h3>
            <p className="text-gray-600">{t("recommend.noProductsDescription")}</p>
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
                  <span className="text-sm">{t("recommend.loadingMore")}</span>
                </div>
              )}
              {!hasNextPage && displayProducts.length > 0 && (
                <p className="text-sm text-gray-500">{t("recommend.allLoaded")}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

