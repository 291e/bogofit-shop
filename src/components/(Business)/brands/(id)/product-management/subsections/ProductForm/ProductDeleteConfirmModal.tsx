"use client";

import { ProductResponseDto } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";

interface ProductDeleteConfirmModalProps {
  product: ProductResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function ProductDeleteConfirmModal({
  product,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false
}: ProductDeleteConfirmModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            상품 삭제 확인
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold mb-2">⚠️ 경고: 이 작업은 되돌릴 수 없습니다!</p>
            <p className="text-red-700 text-sm">
              다음 상품과 모든 관련 데이터(변형, 이미지 등)가 영구적으로 삭제됩니다.
            </p>
          </div>

          {/* Product Info */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              {/* Image */}
              <div>
                <Image
                  src={product.thumbUrl || product.images?.[0] || "/logo.png"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="rounded-lg border w-full h-auto object-cover"
                />
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">상품명</p>
                  <p className="font-semibold text-lg">{product.name}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">SKU</p>
                  <p className="font-mono text-sm">{product.sku || '-'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">기본 가격</p>
                  <p className="text-lg font-bold text-gray-900">
                    {product.basePrice?.toLocaleString()}원
                  </p>
                </div>

                {product.baseCompareAtPrice && product.baseCompareAtPrice > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">비교 가격</p>
                    <p className="text-gray-400 line-through">
                      {product.baseCompareAtPrice.toLocaleString()}원
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500">상태</p>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? '활성' : '비활성'}
                  </Badge>
                </div>

                {product.quantity !== null && product.quantity !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500">상품 재고</p>
                    <p className="text-sm">
                      {product.quantity === null ? '무제한' : `${product.quantity}개`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Variants Info */}
          {product.variants && product.variants.length > 0 && (
            <div className="border rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                🔸 삭제될 변형 옵션: {product.variants.length}개
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {product.variants.map((variant, index) => {
                  let optionsDisplay = '-';
                  try {
                    if (variant.optionsJson) {
                      const options = JSON.parse(variant.optionsJson);
                      optionsDisplay = options.map((opt: Record<string, string>) =>
                        Object.entries(opt).map(([key, value]) => `${key}: ${value}`).join(', ')
                      ).join(' / ');
                    }
                  } catch (e) {
                    console.error('Failed to parse options:', e);
                  }

                  return (
                    <div key={variant.id || index} className="flex justify-between items-center text-sm bg-white rounded p-2 border">
                      <span className="text-gray-700">{optionsDisplay}</span>
                      <span className="text-gray-500">재고: {variant.quantity}개</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Images Info */}
          {product.images && product.images.length > 0 && (
            <div className="border rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                🔸 삭제될 이미지: {product.images.length}개
              </p>
              <div className="grid grid-cols-6 gap-2">
                {product.images.slice(0, 6).map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="rounded border w-full h-auto object-cover"
                  />
                ))}
                {product.images.length > 6 && (
                  <div className="flex items-center justify-center bg-gray-100 rounded border text-gray-500 text-xs">
                    +{product.images.length - 6}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Final Confirmation */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm text-center font-medium">
              정말로 &quot;<strong>{product.name}</strong>&quot; 상품을 삭제하시겠습니까?
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                삭제 중...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                삭제하기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

