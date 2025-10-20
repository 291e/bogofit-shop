"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Share2, Plus, Minus, Check } from "lucide-react";
import { useRouter } from "next/navigation";

// Hooks
import { useAddToCart, useIsInCart, useCartItem } from "@/hooks/useCart";
import { useAuth } from "@/providers/authProvider";

// Types
import { ProductVariantResponseDto } from "@/types/product";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ProductActionsProps {
  productId: string;
  productName: string;
  basePrice: number;
  variants?: ProductVariantResponseDto[];
}

export function ProductActions({
  productId,
  productName,
  basePrice,
  variants = [],
}: ProductActionsProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // State
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState(1);

  // Hooks
  const addToCart = useAddToCart();
  const isInCart = useIsInCart(productId, selectedVariantId || undefined);
  const cartItem = useCartItem(productId, selectedVariantId || undefined);

  // Get selected variant
  const selectedVariant = variants.find(v => v.id === selectedVariantId);
  const effectivePrice = selectedVariant?.price || basePrice;
  const stock = selectedVariant?.quantity || 0;
  const maxQuantity = Math.min(stock, 99); // Limit to 99 or stock

  // Parse variant options for display
  const getVariantLabel = (variant: ProductVariantResponseDto) => {
    try {
      const options = variant.optionsJson ? JSON.parse(variant.optionsJson) : [];
      const optionText = Array.isArray(options)
        ? options.map(opt => Object.values(opt)[0]).join(' / ')
        : '';
      const priceText = variant.price 
        ? `${new Intl.NumberFormat('ko-KR').format(variant.price)}원`
        : '';
      return `${optionText} ${priceText}`.trim();
    } catch {
      return `Variant ${variant.id.slice(0, 8)}`;
    }
  };

  // Handlers
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    if (stock < 1) {
      toast.error("Product is out of stock");
      return;
    }

    if (quantity > stock) {
      toast.error(`Only ${stock} items available`);
      return;
    }

    try {
      await addToCart.mutateAsync({
        productId,
        variantId: selectedVariantId || undefined,
        quantity,
      });
    } catch (error) {
      console.error('Add to cart failed:', error);
      // Error toast is handled in useAddToCart
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }
    toast.info("Wishlist feature coming soon!");
  };

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      {variants.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            옵션 선택
          </label>
          <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="옵션을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((variant) => (
                <SelectItem
                  key={variant.id}
                  value={variant.id}
                  disabled={variant.quantity < 1}
                >
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>{getVariantLabel(variant)}</span>
                    {variant.quantity < 1 && (
                      <Badge variant="secondary" className="text-xs">
                        품절
                      </Badge>
                    )}
                    {variant.quantity > 0 && variant.quantity < 10 && (
                      <Badge variant="outline" className="text-xs text-orange-600">
                        {variant.quantity}개 남음
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          수량
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="rounded-r-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-6 py-2 font-semibold min-w-[60px] text-center">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxQuantity}
              className="rounded-l-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {stock > 0 && stock < 20 && (
            <Badge variant="outline" className="text-orange-600">
              재고 {stock}개
            </Badge>
          )}
          {stock === 0 && (
            <Badge variant="destructive">품절</Badge>
          )}
        </div>
      </div>

      {/* Total Price */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">총 금액</span>
        <span className="text-2xl font-bold text-rose-600">
          {new Intl.NumberFormat('ko-KR').format(effectivePrice * quantity)}원
        </span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-lg hover:shadow-xl"
          onClick={handleAddToCart}
          disabled={addToCart.isPending || stock < 1}
        >
          {addToCart.isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              추가 중...
            </>
          ) : isInCart && cartItem ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              장바구니에 {cartItem.quantity}개 담김
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              장바구니 담기
            </>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleWishlist}
            className="flex items-center justify-center gap-2"
          >
            <Heart className="h-4 w-4" />
            찜하기
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            공유하기
          </Button>
        </div>
      </div>

      {/* Cart Link */}
      {isInCart && (
        <Button
          variant="link"
          className="w-full text-pink-600 hover:text-pink-700"
          onClick={() => router.push('/cart')}
        >
          장바구니 보기 →
        </Button>
      )}
    </div>
  );
}

