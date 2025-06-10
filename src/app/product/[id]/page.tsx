"use client";

import { Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/useProduct";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutButton } from "@/components/payment/Checkout";

export default function ProductDetail() {
  const params = useParams();
  const {
    data: product,
    isLoading,
    error,
  } = useProduct(params?.id as string | undefined);
  const [selectedOption, setSelectedOption] = useState<string>("");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* 이미지 Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full h-full rounded-lg bg-gray-100" />
          </div>
          {/* 정보 Skeleton */}
          <div className="space-y-6">
            <div className="flex justify-between">
              <Skeleton className="w-24 h-8" />
              <div className="flex gap-4">
                <Skeleton className="w-16 h-8" />
                <Skeleton className="w-16 h-8" />
              </div>
            </div>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-500 py-20">
        상품을 불러오지 못했습니다.
      </div>
    );
  }
  if (!product) {
    return <div className="text-center py-20">상품을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 max-w-sm mx-auto">
        {/* 상품 이미지 */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          <div className="flex justify-between">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src={`/images/WunderStory/WunderStory.jpg`}
                  alt={`로고`}
                  width={100}
                  height={100}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>
            <div className="flex justify-center gap-8 text-gray-500">
              <button className="flex items-center gap-2 hover:text-pink-600 transition">
                <Share2 className="w-5 h-5" />
                <span>공유하기</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-lg md:text-2xl font-bold mb-2">
              {product.title}
            </h1>
            <div className="text-gray-500 text-sm mb-2">
              카테고리: {product.category}
            </div>
          </div>

          <div className="border-t border-b py-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-3xl font-bold text-pink-600">
                {product.price.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 상품 옵션 셀렉트 (shadcn/ui) */}
          {Array.isArray(product.options) && product.options.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">상품 옵션</h2>
              <Select value={selectedOption} onValueChange={setSelectedOption}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="옵션을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {product.options.map((opt, idx) => (
                    <SelectItem key={idx} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {/* 옵션이 string일 경우 */}
          {typeof product.options === "string" && product.options && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">상품 옵션</h2>
              <Select value={selectedOption} onValueChange={setSelectedOption}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="옵션을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={product.options}>
                    {product.options}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-4">
            <CheckoutButton
              productTitle={product.title}
              productPrice={product.price}
              selectedOption={selectedOption}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
