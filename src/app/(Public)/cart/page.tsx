"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, X, ArrowLeft, Trash2 } from "lucide-react";

// Hooks
import { 
  useCart, 
  useUpdateCartItem, 
  useRemoveFromCart,
  useClearCart 
} from "@/hooks/useCart";
import { useAuth } from "@/providers/authProvider";

// Types
import { formatVariantOptions, isLowStock, exceedsStock } from "@/types/cart";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Hooks
  const { data: cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/cart");
    }
  }, [isAuthenticated, router]);

  // Handlers
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartItem.mutateAsync({ itemId, quantity: newQuantity });
  };

  const handleRemove = async (itemId: string) => {
    await removeFromCart.mutateAsync(itemId);
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear all items from your cart?")) return;
    await clearCart.mutateAsync();
  };

  const items = cart?.items || [];
  const totalItems = cart?.totalItems || 0;
  const totalPrice = cart?.totalPrice || 0;

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto" />
            <p className="text-lg text-muted-foreground">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
          <div className="relative">
            <ShoppingCart className="h-32 w-32 text-muted-foreground/30" />
            <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
              <X className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
          </div>

          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/products">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Start Shopping
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">
                Go to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Cart with Items
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const variantOptions = formatVariantOptions(item.variantOptionsJson);
            const hasLowStock = isLowStock(item);
            const hasExceededStock = exceedsStock(item);

            return (
              <Card key={item.id} className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.productId}`}
                    className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                  >
                    {item.productThumbUrl ? (
                      <Image
                        src={item.productThumbUrl}
                        alt={item.productName}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="h-12 w-12" />
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <Link
                        href={`/products/${item.productId}`}
                        className="text-xl font-semibold hover:underline"
                      >
                        {item.productName}
                      </Link>
                      {variantOptions && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {variantOptions}
                        </p>
                      )}
                    </div>

                    {/* Stock Status */}
                    {hasExceededStock && (
                      <Badge variant="destructive">
                        Only {item.variantQuantity} available - Please reduce quantity
                      </Badge>
                    )}
                    {!hasExceededStock && hasLowStock && (
                      <Badge variant="outline" className="border-orange-500 text-orange-600">
                        Only {item.variantQuantity} left in stock
                      </Badge>
                    )}

                    {/* Price & Quantity */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">
                          ${item.priceSnapshot.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Subtotal: ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updateCartItem.isPending}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <span className="w-12 text-center font-semibold text-lg">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={updateCartItem.isPending}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemove(item.id)}
                          disabled={removeFromCart.isPending}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              {/* Items Breakdown */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-green-600">Calculated at checkout</span>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-2xl">${totalPrice.toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </div>

              {/* Security Badge */}
              <div className="pt-4 border-t text-center text-xs text-muted-foreground">
                <p>🔒 Secure Checkout</p>
                <p className="mt-1">Your payment information is protected</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

