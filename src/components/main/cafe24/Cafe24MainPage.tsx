"use client";

import React from "react";
import { Cafe24HeroBanner } from "./sections/Cafe24HeroBanner";
// import { Cafe24CategoryGrid } from "./sections/Cafe24CategoryGrid";
import { Cafe24FeaturedProducts } from "./sections/Cafe24FeaturedProducts";
import { Cafe24NewArrivals } from "./sections/Cafe24NewArrivals";
import { Cafe24BestSellers } from "./sections/Cafe24BestSellers";
import { Cafe24SpecialOffers } from "./sections/Cafe24SpecialOffers";
import { Cafe24AllProducts } from "./sections/Cafe24AllProducts";
import { useBestSellers, useNewArrivals, useRandomProducts, useAllProducts } from "@/hooks/useProducts";

const Cafe24MainPage: React.FC = () => {
  // React Query hooks để fetch data
  const { data: bestSellersData, isLoading: bestSellersLoading } = useBestSellers();
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useNewArrivals();
  const { data: randomProductsData, isLoading: randomProductsLoading } = useRandomProducts(60);
  const { data: allProductsData, isLoading: allProductsLoading } = useAllProducts(1, 12);

  // Extract products from API responses
  const bestSellers = bestSellersData?.products || [];
  const newArrivals = newArrivalsData?.products || [];
  const randomProducts = randomProductsData?.products || [];
  const allProducts = allProductsData?.products || [];

  // Split random products into two sections with unique products
  const specialOffers = randomProducts.slice(0, 30);
  const featuredProducts = randomProducts.slice(30, 60);

  // Deduplicate products across sections
  const usedProductIds = new Set([
    ...bestSellers.map(p => p.id),
    ...newArrivals.map(p => p.id),
    ...specialOffers.map(p => p.id),
    ...featuredProducts.map(p => p.id),
  ]);

  // Debug logs
  console.log("📊 MainPage Data Summary:");
  console.log("  - BestSellers:", bestSellers.length);
  console.log("  - NewArrivals:", newArrivals.length);
  console.log("  - SpecialOffers:", specialOffers.length);
  console.log("  - FeaturedProducts:", featuredProducts.length);
  console.log("  - AllProducts:", allProducts.length);
  console.log("  - Unique Products:", usedProductIds.size);

  // Loading state
  if (bestSellersLoading || newArrivalsLoading || randomProductsLoading || allProductsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 메인 히어로 배너 */}
      <Cafe24HeroBanner />

      {/* 빠른 카테고리 */}
      {/* <section>
        <Cafe24CategoryGrid />
      </section> */}

      {/* 베스트 상품 */}
      <section>
        <Cafe24BestSellers products={bestSellers} />
      </section>

      {/* 특가/타임세일 */}
      <section>
        <Cafe24SpecialOffers products={specialOffers} />
      </section>

      {/* 신상품 */}
      <section>
        <Cafe24NewArrivals products={newArrivals} />
      </section>

      {/* 추천 상품 */}
      <section>
        <Cafe24FeaturedProducts products={featuredProducts} />
      </section>

      {/* 모든 상품 (무한 스크롤) */}
      <section>
        <Cafe24AllProducts initialProducts={allProducts} />
      </section>
    </div>
  );
};

export default Cafe24MainPage;
