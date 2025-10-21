import React from "react";
import { notFound } from "next/navigation";
import { ShoppingCart, Heart, Share2, Star, Package, Truck, RefreshCcw } from "lucide-react";
import { ProductResponseDto } from "@/types/product";
import Image from "next/image";
import { getStockText, getDisplayPrice } from "@/lib/inventory";

async function fetchProduct(id: string): Promise<ProductResponseDto | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/product?id=${id}&include=true`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.data || data.product || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    notFound();
  }

  // v2.0: Use inventory utility for price and stock
  const mainImage = product.images?.[0] || "/logo.png";
  const priceInfo = getDisplayPrice(product);
  const stockText = getStockText(product);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-12">
            {/* Left: Images */}
            <div>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {priceInfo.hasDiscount && priceInfo.discountPercent && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1.5 rounded">
                    {priceInfo.discountPercent}% OFF
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.slice(0, 5).map((image, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-100 rounded overflow-hidden border-2 border-transparent hover:border-purple-500 cursor-pointer">
                      <Image src={image} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="flex flex-col">
              {/* Brand */}
              {product.brand && (
                <p className="text-sm text-gray-500 mb-2">{product.brand.name}</p>
              )}

              {/* Product Name */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(0 reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b">
                {priceInfo.hasDiscount ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-rose-600">
                        {new Intl.NumberFormat('ko-KR').format(priceInfo.price)}원
                      </span>
                      <span className="text-xl font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                        {priceInfo.discountPercent}%
                      </span>
                    </div>
                    <span className="text-lg text-gray-400 line-through">
                      {new Intl.NumberFormat('ko-KR').format(priceInfo.originalPrice!)}원
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {new Intl.NumberFormat('ko-KR').format(priceInfo.price)}원
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">상품 설명</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto space-y-3">
                <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                  <ShoppingCart className="h-5 w-5" />
                  장바구니 담기
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="h-4 w-4" />
                    찜하기
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="h-4 w-4" />
                    공유하기
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-8 space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3 text-sm">
                  <Truck className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">배송 안내</p>
                    <p className="text-gray-600">무료배송 (3만원 이상 구매시)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <RefreshCcw className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">교환/반품</p>
                    <p className="text-gray-600">7일 이내 무료 반품 가능</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Package className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">재고</p>
                    <p className="text-gray-600">
                      {stockText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6 p-6 lg:p-12">
          <div className="border-b mb-6">
            <div className="flex gap-8">
              <button className="pb-4 border-b-2 border-purple-600 text-purple-600 font-medium">
                상품정보
              </button>
              <button className="pb-4 text-gray-500 hover:text-gray-700">
                리뷰
              </button>
              <button className="pb-4 text-gray-500 hover:text-gray-700">
                Q&A
              </button>
            </div>
          </div>
          
          {/* Product Info Content */}
          <div className="prose max-w-none">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">상품 상세 정보</h3>
              {product.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              ) : (
                <p className="text-gray-500">상품 정보가 준비중입니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(id);
  
  if (!product) {
    return {
      title: "상품을 찾을 수 없습니다 - BOGOFIT",
    };
  }

  return {
    title: `${product.name} - BOGOFIT`,
    description: product.description || product.name,
  };
}

