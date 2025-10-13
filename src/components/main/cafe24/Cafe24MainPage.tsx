import React from "react";
import { Cafe24HeroBanner } from "./sections/Cafe24HeroBanner";
// import { Cafe24CategoryGrid } from "./sections/Cafe24CategoryGrid";
import { Cafe24FeaturedProducts } from "./sections/Cafe24FeaturedProducts";
import { Cafe24NewArrivals } from "./sections/Cafe24NewArrivals";
import { Cafe24BestSellers } from "./sections/Cafe24BestSellers";
import { Cafe24SpecialOffers } from "./sections/Cafe24SpecialOffers";
import { Cafe24AllProducts } from "./sections/Cafe24AllProducts";
import { Product } from "@/types/product";

// 상품 데이터 패칭 함수들
async function fetchBestSellers(): Promise<Product[]> {
  try {
    // 24시간마다 변경되는 랜덤 시드 생성 (날짜 기반)
    const today = new Date();
    const dateSeed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/products?badge=BEST&random=60&dateSeed=${dateSeed}`,
      {
        next: { revalidate: 86400 }, // 24시간 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch best sellers");
    const data = await response.json();
    console.log("🏆 베스트셀러 데이터:", data.products?.length || 0, "개");
    if (data.products?.length > 0) {
      console.log("첫 번째 베스트셀러:", data.products[0]);
    }
    return data.products || [];
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

async function fetchNewArrivals(): Promise<Product[]> {
  try {
    // 24시간마다 변경되는 랜덤 시드 생성 (날짜 기반)
    const today = new Date();
    const dateSeed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/products?badge=NEW&random=60&dateSeed=${dateSeed}`,
      {
        next: { revalidate: 86400 }, // 24시간 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch new arrivals");
    const data = await response.json();
    console.log("🆕 신상품 데이터:", data.products?.length || 0, "개");
    if (data.products?.length > 0) {
      console.log("첫 번째 신상품:", data.products[0]);
    }
    return data.products || [];
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

// 랜덤 상품을 한 번에 가져와서 두 섹션으로 나누는 함수
async function fetchRandomProducts(): Promise<{
  specialOffers: Product[];
  featuredProducts: Product[];
}> {
  try {
    // 24시간마다 변경되는 랜덤 시드 생성 (날짜 기반)
    const today = new Date();
    const dateSeed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/products?random=60&dateSeed=${dateSeed}`, // 60개 가져와서 30개씩 나누기
      {
        next: { revalidate: 86400 }, // 24시간 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch random products");
    const data = await response.json();
    const products = data.products || [];

    // dateSeed 기반으로 일관된 랜덤 분할
    const seed = dateSeed.split("-").join("");
    const seedNumber = parseInt(seed, 10);

    // seed 기반으로 일관된 분할 (앞의 30개는 Special, 뒤의 30개는 Featured)
    const shuffled = [...products].sort((a, b) => {
      const hashA = (a.id + seedNumber) % 1000;
      const hashB = (b.id + seedNumber) % 1000;
      return hashA - hashB;
    });

    return {
      specialOffers: shuffled.slice(0, 30),
      featuredProducts: shuffled.slice(30, 60),
    };
  } catch (error) {
    console.error("Error fetching random products:", error);
    return {
      specialOffers: [],
      featuredProducts: [],
    };
  }
}

async function fetchAllProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/products?page=1&limit=12&showSoldOut=true`, // 초기 12개 (2행)
      {
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!response.ok) throw new Error("Failed to fetch all products");
    const data = await response.json();
    console.log("📦 전체 상품 초기 데이터:", data.products?.length || 0, "개");
    return data.products || [];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

const Cafe24MainPage: React.FC = async () => {
  // 병렬로 모든 데이터 패칭
  const [bestSellers, newArrivals, randomProducts, allProducts] =
    await Promise.all([
      fetchBestSellers(),
      fetchNewArrivals(),
      fetchRandomProducts(),
      fetchAllProducts(),
    ]);

  // 랜덤 상품을 두 섹션으로 분리
  const { specialOffers, featuredProducts } = randomProducts;

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
