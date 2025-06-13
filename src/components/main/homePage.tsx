"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  { name: "상의", icon: "/banner/top.png" },
  { name: "하의", icon: "/banner/bottom.png" },
  { name: "한벌 옷", icon: "/banner/onepiece.png" },
  { name: "아우터", icon: "/banner/outer.png" },
];

const LIMIT = 20;

export default function HomePage() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/products?page=${pageParam}&limit=${LIMIT}`);
      if (!res.ok) throw new Error("상품을 불러오지 못했습니다.");
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col gap-10">
      {/* 배너 */}
      <section className="relative w-full h-48 sm:h-64 overflow-hidden flex items-center justify-center bg-gradient-to-r from-pink-200 via-white to-blue-100 shadow-lg">
        <div className="z-10 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 tracking-tight">
            오픈마켓 BOGOFIT SHOP
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-4">
            다양한 브랜드와 상품을 한 곳에서!
          </p>
          <Button size="lg" className="px-8 py-2">
            지금 인기상품 보기
          </Button>
        </div>
      </section>

      {/* 카테고리 */}
      <section className="w-full h-full px-4 sm:px-6 md:px-8 lg:px-10">
        <h2 className="text-lg font-semibold mb-4">카테고리</h2>
        <div className="flex justify-between gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-center w-full gap-2 bg-white rounded-lg shadow p-4 hover:shadow-md transition relative aspect-square max-w-40 max-h-40 cursor-pointer"
            >
              <Image
                src={cat.icon}
                alt={cat.name}
                fill
                sizes="100vw 100vh"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 상품 리스트 */}
      <section className="w-full h-full px-4 sm:px-6 md:px-8 lg:px-10">
        <h2 className="text-lg font-semibold mb-6">전체 상품</h2>
        {status === "pending" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow flex flex-col p-3 sm:p-4 gap-2 sm:gap-3 animate-fadeIn"
              >
                <Skeleton className="relative w-full aspect-[7/8] rounded-lg" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
                <Skeleton className="h-10 w-full mt-1 sm:mt-2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{`${error}`}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {data?.pages.flatMap((page) =>
              page.products.map((p: Product) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow transition flex flex-col p-3 sm:p-4 gap-2 sm:gap-3 animate-fadeIn"
                >
                  <Link
                    href={`/product/${p.id}`}
                    className="relative w-full aspect-[7/8] rounded-lg overflow-hidden"
                  >
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/product/${p.id}`}
                        className="font-semibold text-sm sm:text-base line-clamp-2 hover:text-pink-600 transition"
                      >
                        {p.title}
                      </Link>
                    </div>
                    <span className="text-pink-600 font-bold text-base sm:text-lg">
                      {p.price?.toLocaleString()}원
                    </span>
                  </div>
                  <Link href={`/product/${p.id}`}>
                    <Button
                      variant="default"
                      className="w-full mt-1 sm:mt-2 gap-2 text-sm sm:text-base hover:shadow-md cursor-pointer"
                    >
                      자세히 보기
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
        {/* 무한 스크롤 트리거 */}
        <div ref={ref} className="h-20 flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          )}
        </div>
      </section>
    </div>
  );
}
