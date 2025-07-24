import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface CartButtonProps {
  cart: { totalItems: number } | null | undefined;
}

export function CartButton({ cart }: CartButtonProps) {
  const hasItems = cart && cart.totalItems > 0;

  return (
    <Link href="/cart">
      <Button
        variant="ghost"
        size="icon"
        aria-label="장바구니"
        className="relative"
      >
        <ShoppingCart className="w-5 h-5" />
        {hasItems && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-[#FF84CD] rounded-full"
          >
            {cart.totalItems > 99 ? "99+" : cart.totalItems}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
