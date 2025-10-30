"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react";

// Hooks
import {
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart
} from "@/hooks/useCart";

// Types
import { formatVariantOptions, isLowStock, exceedsStock } from "@/types/cart";
import type { Cart } from "@/types/cart";

// UI Components
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartDrawerProps {
  children: React.ReactNode;
  cart?: Cart | null;
  isLoading?: boolean;
}

export function CartDrawer({ children, cart, isLoading = false }: CartDrawerProps) {
  const [open, setOpen] = useState(false);

  // Hooks - Only mutation hooks, data comes from props
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  // Handlers
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartItem.mutateAsync({ itemId, quantity: newQuantity });
  };

  const handleRemove = async (itemId: string) => {
    await removeFromCart.mutateAsync(itemId);
  };

  const handleClearCart = async () => {
    if (!confirm("Clear all items from cart?")) return;
    await clearCart.mutateAsync();
  };

  const items = cart?.items || [];
  const totalItems = cart?.totalItems || 0;
  const totalPrice = cart?.totalPrice || 0;

  const formatCurrency = (value: number) => new Intl.NumberFormat('ko-KR').format(value) + '원';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        {/* Header */}
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">
              장바구니
            </SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                모두 비우기
              </Button>
            )}
          </div>

          {totalItems > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>총 {totalItems}개</span>
              <span className="text-lg font-semibold text-foreground">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          )}
        </SheetHeader>

        <Separator className="my-4" />

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground">장바구니 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">장바구니가 비어 있습니다</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  마음에 드는 상품을 담아보세요
                </p>
              </div>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/products">쇼핑 계속하기</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Cart Items */}
        {!isLoading && items.length > 0 && (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => {
                  const variantOptions = formatVariantOptions(item.variantOptionsJson);
                  const hasLowStock = isLowStock(item);
                  const hasExceededStock = exceedsStock(item);

                  return (
                    <div key={item.id} className="flex gap-4 p-4 rounded-lg border">
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.productId}`}
                        onClick={() => setOpen(false)}
                        className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100"
                      >
                        {item.productThumbUrl ? (
                          <Image
                            src={item.productThumbUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="h-8 w-8" />
                          </div>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <Link
                            href={`/products/${item.productId}`}
                            onClick={() => setOpen(false)}
                            className="font-medium hover:underline line-clamp-1"
                          >
                            {item.productName}
                          </Link>
                          {variantOptions && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {variantOptions}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {formatCurrency(item.priceSnapshot)}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updateCartItem.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updateCartItem.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemove(item.id)}
                              disabled={removeFromCart.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {hasExceededStock && (
                          <Badge variant="destructive" className="text-xs">
                            재고 {item.variantQuantity}개만 남음
                          </Badge>
                        )}
                        {!hasExceededStock && hasLowStock && (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                            재고 부족 ({item.variantQuantity}개)
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            {/* Footer */}
            <SheetFooter className="flex-col space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-bold">
                <span>합계</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>

              {/* Actions */}
              <div className="grid gap-2">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout" onClick={() => setOpen(false)}>
                    결제하기
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link href="/products" onClick={() => setOpen(false)}>
                    쇼핑 계속하기
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

