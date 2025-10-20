"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, X, Heart } from "lucide-react";
import Image from "next/image";

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  viewedAt: string;
  brandName: string;
}

export default function RecentProductsSection() {
  const [recentProducts] = useState<RecentProduct[]>([
    // 임시 데이터
  ]);

  if (recentProducts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">최근 본 상품이 없습니다</h3>
          <p className="text-gray-500 mb-6">상품을 둘러보고 쇼핑을 시작해보세요</p>
          <Button>쇼핑 시작하기</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">최근 본 상품</h2>
        <Button variant="outline" size="sm">전체 삭제</Button>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {recentProducts.map((product) => (
          <Card key={product.id} className="group relative overflow-hidden">
            <button
              className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {/* TODO: Remove product */}}
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            
            <CardContent className="p-3">
              <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{product.brandName}</p>
                <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-pink-600">{product.price.toLocaleString()}원</p>
                  {product.compareAtPrice && (
                    <p className="text-xs text-gray-400 line-through">
                      {product.compareAtPrice.toLocaleString()}원
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400">{product.viewedAt}</p>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1" variant="outline">
                  <Heart className="w-4 h-4 mr-1" />
                  찜
                </Button>
                <Button size="sm" className="flex-1">
                  장바구니
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

