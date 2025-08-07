"use client";
import { useEffect, useState } from "react";
import {
  recentProducts,
  RecentProduct,
} from "@/contents/myPage/recentProducts";
import Image from "next/image";

export default function RecentProducts() {
  const [products, setProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    // 로컬스토리지에서 productId 배열 읽기
    const ids = JSON.parse(
      localStorage.getItem("recentProductIds") || "[]"
    ) as string[];
    // 더미 데이터에서 id 매칭
    const list = ids
      .map((id) => recentProducts.find((p) => p.id === id))
      .filter(Boolean) as RecentProduct[];
    setProducts(list);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">최근 본 상품</h2>
      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          최근 본 상품이 없습니다.
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-64 bg-white rounded-xl shadow p-4 flex flex-col items-center"
            >
              <Image
                src={product.imageUrl}
                alt={product.title}
                width={120}
                height={120}
                className="rounded mb-2"
              />
              <div className="font-semibold text-center mb-1">
                {product.title}
              </div>
              <div className="text-lg font-bold text-[#d74fdf] mb-2">
                {product.price.toLocaleString()}원
              </div>
              <div className="flex gap-2 w-full">
                <button className="flex-1 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm">
                  장바구니
                </button>
                <button className="flex-1 py-1 rounded bg-[#d74fdf] hover:bg-[#b93fc0] text-white text-sm">
                  구매
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
