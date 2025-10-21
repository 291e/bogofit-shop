"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Package, Loader2, Sparkles } from "lucide-react";
import { ProductResponseDto } from "@/types/product";
import { Cafe24ProductCard } from "./Cafe24ProductCard";

interface Cafe24AllProductsProps {
  initialProducts?: ProductResponseDto[];
}

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
    rating: undefined,
    reviews: undefined
  };
};

export function Cafe24AllProducts({ initialProducts }: Cafe24AllProductsProps) {
  const [products, setProducts] = useState<ProductResponseDto[]>(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(2); // Initial page=1 loaded, start from page 2
  const LOAD_SIZE = 12; // Load 12 products per scroll (2 rows x 6 columns)
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const loadMoreProducts = async () => {
      if (loadingRef.current || !hasMore) return;

      loadingRef.current = true;
      setLoading(true);
      
      try {
        const response = await fetch(
          `/api/product?page=${page}&pageSize=${LOAD_SIZE}&isActive=true`
        );

        if (!response.ok) {
          console.error("Response not OK:", response.status, response.statusText);
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        const newProducts = data.data?.data || data.products || [];


        if (newProducts.length === 0) {
          setHasMore(false);
        } else {
          setProducts((prev) => {
            // Remove duplicates
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewProducts = newProducts.filter((p: ProductResponseDto) => !existingIds.has(p.id));
            return [...prev, ...uniqueNewProducts];
          });
          setPage((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error loading more products:", error);
        setHasMore(false);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore) {
          loadMoreProducts();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px',
      }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [page, hasMore]);

  // 상품이 없는 경우 처리
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">상품이 없습니다</p>
        </div>
      </div>
    );
  }

  const displayProducts = products.map(convertToDisplayProduct);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-12">
      {/* Decorative gradient lights */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-6 left-[10%] h-72 w-72 rounded-full bg-sky-300/20 blur-[90px]" />
        <div className="absolute top-14 right-[10%] h-80 w-80 rounded-full bg-indigo-300/20 blur-[90px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-blue-300/15 blur-[80px]" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* 섹션 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-sky-500 to-indigo-500" />
              <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                <Package className="h-5 w-5 text-sky-600" /> 전체 상품
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </h2>
              <span className="hidden sm:inline-flex items-center text-xs sm:text-sm text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full">
                전체 상품을 둘러보세요
              </span>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-white/70 hover:border-gray-400 transition-colors shadow-sm backdrop-blur"
              aria-label="전체 상품 전체보기"
            >
              전체보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="relative group rounded-xl transition-transform duration-200 hover:scale-[1.01] h-full"
            >
              <Cafe24ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* 무한 스크롤 로딩 영역 */}
        <div ref={observerRef} className="flex justify-center items-center py-8">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">상품을 불러오는 중...</span>
            </div>
          ) : !hasMore ? (
            <div className="text-center text-gray-500">
              <p className="text-sm">모든 상품을 불러왔습니다</p>
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      </div>
    </div>
  );
}

