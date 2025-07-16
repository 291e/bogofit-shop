import React from "react";
import { Cafe24HeroBanner } from "./sections/Cafe24HeroBanner";
import { Cafe24CategoryGrid } from "./sections/Cafe24CategoryGrid";
import { Cafe24FeaturedProducts } from "./sections/Cafe24FeaturedProducts";
import { Cafe24NewArrivals } from "./sections/Cafe24NewArrivals";
import { Cafe24BestSellers } from "./sections/Cafe24BestSellers";
import { Cafe24SpecialOffers } from "./sections/Cafe24SpecialOffers";
import { Cafe24AllProducts } from "./sections/Cafe24AllProducts";
import { Product } from "@/types/product";

// 상품 데이터 패칭 함수들
async function fetchBestSellers(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/products?badge=BEST`,
      {
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch best sellers");
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

async function fetchNewArrivals(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/products?badge=New`,
      {
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch new arrivals");
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

async function fetchSpecialOffers(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/products?random=30`,
      {
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch special offers");
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching special offers:", error);
    return [];
  }
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/products?random=30`,
      {
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch featured products");
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

async function fetchAllProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/products?page=1&limit=12`, // 초기 12개 (2행)
      {
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch all products");
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

const Cafe24MainPage: React.FC = async () => {
  // 병렬로 모든 데이터 패칭
  const [
    bestSellers,
    newArrivals,
    specialOffers,
    featuredProducts,
    allProducts,
  ] = await Promise.all([
    fetchBestSellers(),
    fetchNewArrivals(),
    fetchSpecialOffers(),
    fetchFeaturedProducts(),
    fetchAllProducts(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* 메인 히어로 배너 */}
      <Cafe24HeroBanner />

      {/* 빠른 카테고리 */}
      <section>
        <Cafe24CategoryGrid />
      </section>

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
