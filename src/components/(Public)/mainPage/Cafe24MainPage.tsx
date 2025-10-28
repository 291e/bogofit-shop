import React from "react";
import { Cafe24HeroBanner } from "./sections/Cafe24HeroBanner";
// import { Cafe24CategoryGrid } from "./sections/Cafe24CategoryGrid";
import { Cafe24FeaturedProducts } from "./sections/Cafe24FeaturedProducts";
import { Cafe24NewArrivals } from "./sections/Cafe24NewArrivals";
import { Cafe24BestSellers } from "./sections/Cafe24BestSellers";
import { Cafe24SpecialOffers } from "./sections/Cafe24SpecialOffers";
import { Cafe24AllProducts } from "./sections/Cafe24AllProducts";
import { ProductResponseDto } from "@/types/product";

// Fetch products for best sellers (sorted by popularity/views)
async function fetchBestSellers(): Promise<ProductResponseDto[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/product?page=3&pageSize=30&isActive=true&sortBy=updatedAt&sortOrder=desc`, // Sort by recently updated (popular)
      {
        next: { revalidate: 300 } // 5분 캐시
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Best sellers API returned ${response.status}, using empty array`);
      return [];
    }
    const data = await response.json();
    return data.data?.data || data.products || [];
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

async function fetchNewArrivals(): Promise<ProductResponseDto[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/product?page=1&pageSize=60&isActive=true&sortBy=createdAt&sortOrder=desc`, // Sort by newest
      {
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch new arrivals");
    const data = await response.json();
    const products = data.data?.data || data.products || [];
    return products.slice(0, 30); // First 30 newest products
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

// Fetch products for special offers (discounted products)
async function fetchSpecialOffers(): Promise<ProductResponseDto[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/product?page=1&pageSize=30&isActive=true&sortBy=discount&sortOrder=desc`, // Sort by discount
      {
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch special offers");
    const data = await response.json();
    const products = data.data?.data || data.products || [];

    // Filter products with discounts
    return products.filter((product: ProductResponseDto) =>
      product.baseCompareAtPrice &&
      product.baseCompareAtPrice > product.basePrice
    ).slice(0, 30);
  } catch (error) {
    console.error("Error fetching special offers:", error);
    return [];
  }
}

// Fetch products for featured products (high-rated or popular)
async function fetchFeaturedProducts(): Promise<ProductResponseDto[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/product?page=2&pageSize=30&isActive=true&sortBy=basePrice&sortOrder=desc`, // Sort by price (premium)
      {
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch featured products");
    const data = await response.json();
    return data.data?.data || data.products || [];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

async function fetchAllProducts(): Promise<ProductResponseDto[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/product?page=1&pageSize=12&isActive=true`, // 초기 12개 (2행)
      {
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch all products");
    const data = await response.json();
    const products = data.data?.data || data.products || [];
    return products;
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

const Cafe24MainPage: React.FC = async () => {
  // 병렬로 모든 데이터 패칭
  const [bestSellers, newArrivals, specialOffers, featuredProducts, allProducts] =
    await Promise.all([
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

