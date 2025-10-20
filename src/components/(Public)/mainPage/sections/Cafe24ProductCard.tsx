"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { memo } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    brand?: string;
    brandSlug?: string;
    slug?: string;
    rating?: number;
    reviews?: number;
  };
}

const Cafe24ProductCardComponent = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // Generate SEO-friendly URL if brandSlug and slug are available
  const productUrl = product.brandSlug && product.slug 
    ? `/brands/${product.brandSlug}/products/${product.slug}`
    : `/products/${product.id}`;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full">
      {/* 이미지 */}
      <Link href={productUrl} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
            loading="lazy"
          />
          
          {/* 할인 배지 */}
          {product.discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {product.discount}%
            </div>
          )}
          
          {/* 찜하기 버튼 */}
          <button 
            className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to wishlist
            }}
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </Link>

      {/* 상품 정보 */}
      <Link href={productUrl} className="block p-3 flex flex-col flex-grow">
        {/* 브랜드 */}
        <div className="h-5">
          {product.brand && (
            <p className="text-xs text-gray-500">{product.brand}</p>
          )}
        </div>
        
        {/* 상품명 - chiều cao cố định */}
        <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 h-10">
          {product.name}
        </h3>

        {/* 가격 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-gray-900 text-sm">
            {formatPrice(product.price)}원
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(product.originalPrice)}원
            </span>
          )}
        </div>

        {/* 평점 - chiều cao cố định */}
        <div className="h-5">
          {product.rating && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="text-yellow-500">★</span>
              <span>{product.rating}</span>
              {product.reviews && (
                <span>({product.reviews})</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const Cafe24ProductCard = memo(Cafe24ProductCardComponent);
Cafe24ProductCard.displayName = 'Cafe24ProductCard';

