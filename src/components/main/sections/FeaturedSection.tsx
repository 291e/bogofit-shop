"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

interface Product {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  badge?: string;
}

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  loading: boolean;
}

function ProductSection({
  title,
  subtitle,
  products,
  loading,
}: ProductSectionProps) {
  const emblaApiRef = useRef<import("embla-carousel").EmblaCarouselType | null>(
    null
  );

  // 오토플레이 (3초마다 next, loop)
  useEffect(() => {
    if (!emblaApiRef.current) return;
    const interval = setInterval(() => {
      if (emblaApiRef.current) {
        emblaApiRef.current.scrollNext();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [products]);

  return (
    <div className="mb-20">
      <div className="text-center mb-10">
        <h3 className="text-2xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-lg text-gray-400">
          로딩 중...
        </div>
      ) : products.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-lg text-gray-400">
          상품이 없습니다.
        </div>
      ) : (
        <Carousel
          className="relative"
          opts={{ loop: true }}
          setApi={(api) => (emblaApiRef.current = api ?? null)}
        >
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 py-4"
              >
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full group hover:scale-105 transition-transform">
                  <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-xl">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority
                    />
                    {product.badge && product.badge !== "SOLDOUT" && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-md font-bold mb-1 line-clamp-2">
                        {product.title}
                      </h4>
                      <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                        {product.price.toLocaleString()}원
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="outline" className="font-bold">
                          지금 보기
                        </Button>
                      </Link>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
}

export default function FeaturedSection() {
  const [bestProducts, setBestProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [recommendProducts, setRecommendProducts] = useState<Product[]>([]);
  const [bestLoading, setBestLoading] = useState(false);
  const [newLoading, setNewLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);

  // BEST 상품 로드
  useEffect(() => {
    setBestLoading(true);
    fetch("/api/products?limit=20&badge=BEST")
      .then((res) => res.json())
      .then((data) => setBestProducts(data.products || []))
      .finally(() => setBestLoading(false));
  }, []);

  // NEW 상품 로드
  useEffect(() => {
    setNewLoading(true);
    fetch("/api/products?limit=20&badge=New")
      .then((res) => res.json())
      .then((data) => setNewProducts(data.products || []))
      .finally(() => setNewLoading(false));
  }, []);

  // 추천 상품 로드
  useEffect(() => {
    setRecommendLoading(true);
    fetch("/api/products?limit=20&random=20")
      .then((res) => res.json())
      .then((data) => setRecommendProducts(data.products || []))
      .finally(() => setRecommendLoading(false));
  }, []);

  return (
    <section className="w-full py-20 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-2 text-sm font-medium"
          >
            특별 기획전
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            놓칠 수 없는 혜택
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BEST, NEW, 추천 아이템을 모두 만나보세요
          </p>
        </div>

        {/* BEST 상품 섹션 */}
        <ProductSection
          title="BEST 상품"
          subtitle="고객들이 가장 많이 선택한 인기 상품들"
          products={bestProducts}
          loading={bestLoading}
        />

        {/* NEW 상품 섹션 */}
        <ProductSection
          title="NEW 상품"
          subtitle="최신 트렌드를 반영한 신상품들"
          products={newProducts}
          loading={newLoading}
        />

        {/* 추천 상품 섹션 */}
        <ProductSection
          title="추천 아이템"
          subtitle="BOGOFIT이 특별히 추천하는 상품들"
          products={recommendProducts}
          loading={recommendLoading}
        />
      </div>
    </section>
  );
}
