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

const TABS = [
  { key: "BEST", label: "BEST" },
  { key: "New", label: "NEW" },
  { key: "RECOMMEND", label: "추천 아이템" },
];

export default function FeaturedSection() {
  const [tab, setTab] = useState("BEST");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const emblaApiRef = useRef<import("embla-carousel").EmblaCarouselType | null>(
    null
  );

  useEffect(() => {
    let url = "/api/products?limit=20";
    if (tab === "BEST") url += "&badge=BEST";
    else if (tab === "NEW") url += "&badge=NEW";
    else if (tab === "RECOMMEND") url += "&random=20";
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, [tab]);

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
    <section className="w-full py-20 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
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
            BEST, NEW, 추천 아이템을 만나보세요
          </p>
        </div>
        <div className="flex justify-center gap-4 mb-8">
          {TABS.map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? "default" : "outline"}
              onClick={() => setTab(t.key)}
              className="text-base font-bold px-6"
            >
              {t.label}
            </Button>
          ))}
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
                        <h3 className="text-md font-bold mb-1 line-clamp-2">
                          {product.title}
                        </h3>
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
    </section>
  );
}
