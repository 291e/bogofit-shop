"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit } from "lucide-react";

interface ProductVariant {
  id?: string;
  price?: number;
  compareAtPrice?: number;
  quantity?: number;
  weightGrams?: number;
  status?: string;
  optionsJson?: string;
}

interface VariantEditModalProps {
  variant: ProductVariant | null;
  productName: string;
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (variantId: string, updates: Partial<ProductVariant>) => Promise<void>;
  isSaving?: boolean;
}

export default function VariantEditModal({
  variant,
  productName,
  productId,
  open,
  onOpenChange,
  onSave,
  isSaving = false
}: VariantEditModalProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [compareAtPrice, setCompareAtPrice] = useState<number>(0);

  // Load variant data when modal opens
  useEffect(() => {
    if (variant) {
      setQuantity(variant.quantity || 0);
      setPrice(variant.price || 0);
      setCompareAtPrice(variant.compareAtPrice || 0);
    }
  }, [variant]);

  if (!variant) return null;

  // Parse options for display
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

  const handleSave = async () => {
    if (!variant.id) {
      toast.error('Variant ID가 없습니다');
      return;
    }

    if (quantity < 0) {
      toast.error('재고는 0 이상이어야 합니다');
      return;
    }

    if (price <= 0) {
      toast.error('가격은 0보다 커야 합니다');
      return;
    }

    const updates: Partial<ProductVariant> = {
      quantity,
      price,
      compareAtPrice: compareAtPrice > 0 ? compareAtPrice : undefined
    };

    await onSave(variant.id, updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            변형 재고 수정
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-3 border">
            <p className="text-xs text-gray-500">상품</p>
            <p className="font-semibold text-sm">{productName}</p>
          </div>

          {/* Variant Options */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-600 mb-1">변형 옵션</p>
            <p className="font-medium text-sm text-blue-900">{optionsDisplay}</p>
          </div>

          {/* Edit Fields */}
          <div className="space-y-3">
            {/* Quantity */}
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium">
                재고 수량 *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                현재 재고: {variant.quantity || 0}개
              </p>
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price" className="text-sm font-medium">
                가격 *
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                현재 가격: {variant.price?.toLocaleString()}원
              </p>
            </div>

            {/* Compare At Price */}
            <div>
              <Label htmlFor="compareAtPrice" className="text-sm font-medium">
                비교 가격 (할인 전 가격)
              </Label>
              <Input
                id="compareAtPrice"
                type="number"
                min="0"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {variant.compareAtPrice 
                  ? `현재: ${variant.compareAtPrice.toLocaleString()}원`
                  : '설정되지 않음'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">상태:</span>
            <Badge variant={variant.status === 'active' ? 'default' : 'secondary'}>
              {variant.status === 'active' ? '활성' : variant.status === 'paused' ? '일시정지' : '보관'}
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

