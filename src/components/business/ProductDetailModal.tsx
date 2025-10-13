"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Star, Calendar, User, Tag, ShoppingCart } from "lucide-react";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

interface ProductDetail {
  id: number;
  title: string;
  description?: string;
  detailDescription?: string;
  price: number;
  category: string;
  subCategory?: string;
  imageUrl?: string;
  thumbnailImages?: string[];
  badge?: string;
  status: string;
  isActive: boolean;
  storeName?: string;
  createdAt: string;
  updatedAt: string;
  brand: {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
  };
  variants: Array<{
    id: number;
    optionName: string;
    optionValue: string;
    priceDiff: number;
    stock: number;
  }>;
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      userId: string;
      name: string;
    };
  }>;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  productId,
}: ProductDetailModalProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error("상품 정보를 불러올 수 없습니다.");
      }
      const data = await response.json();
      setProduct(data.product);
    } catch (error) {
      console.error("상품 상세 정보 조회 실패:", error);
      setError(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetail();
    }
  }, [isOpen, productId, fetchProductDetail]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: "임시저장", variant: "secondary" as const },
      PENDING: { label: "승인대기", variant: "default" as const },
      APPROVED: { label: "승인완료", variant: "default" as const },
      REJECTED: { label: "승인거부", variant: "destructive" as const },
      INACTIVE: { label: "비활성화", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAverageRating = (reviews: ProductDetail["reviews"]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            상품 상세 정보
          </DialogTitle>
          <DialogDescription>
            상품의 모든 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}

        {error && (
          <div className="text-center p-8 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {product && !loading && (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{product.title}</span>
                  {getStatusBadge(product.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 이미지 */}
                  <div className="space-y-4">
                    {product.imageUrl && (
                      <div>
                        <h4 className="font-medium mb-2">메인 이미지</h4>
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                      </div>
                    )}

                    {product.thumbnailImages &&
                      product.thumbnailImages.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">썸네일 이미지</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {product.thumbnailImages.map((thumbnail, index) => (
                              <img
                                key={index}
                                src={thumbnail}
                                alt={`썸네일 ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">
                        가격
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">
                        카테고리
                      </h4>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span>{product.category}</span>
                        {product.subCategory && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>{product.subCategory}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {product.badge && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">
                          뱃지
                        </h4>
                        <Badge variant="outline">{product.badge}</Badge>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">
                        브랜드
                      </h4>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{product.brand.name}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">
                        등록일
                      </h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(product.createdAt)}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">
                        활성 상태
                      </h4>
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                      >
                        {product.isActive ? "활성화" : "비활성화"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상품 설명 */}
            {product.description && (
              <Card>
                <CardHeader>
                  <CardTitle>상품 설명</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </CardContent>
              </Card>
            )}

            {/* 상품 옵션 */}
            {product.variants && product.variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    상품 옵션
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">
                              {variant.optionName}: {variant.optionValue}
                            </p>
                            <p className="text-sm text-gray-500">
                              재고: {variant.stock}개
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {variant.priceDiff !== 0 && (
                            <p className="text-sm font-medium">
                              {variant.priceDiff > 0 ? "+" : ""}
                              {formatPrice(variant.priceDiff)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 리뷰 */}
            {product.reviews && product.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    고객 리뷰 ({product.reviews.length}개)
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= calculateAverageRating(product.reviews)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      평균 {calculateAverageRating(product.reviews)}점
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.reviews.slice(0, 3).map((review) => (
                      <div
                        key={review.id}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {review.user.name}
                            </span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                    {product.reviews.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{product.reviews.length - 3}개의 리뷰 더 보기
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
