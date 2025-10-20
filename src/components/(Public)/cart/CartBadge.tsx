"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartDrawer } from "./CartDrawer";

export function CartBadge() {
  const { data: cart, isLoading } = useCart();
  const cartCount = cart?.totalItems || 0;

  return (
    <CartDrawer cart={cart} isLoading={isLoading}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
      </Button>
    </CartDrawer>
  );
}

