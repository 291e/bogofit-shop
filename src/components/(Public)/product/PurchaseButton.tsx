"use client";

import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/useCart";
import { useAuth } from "@/providers/authProvider";
import { useLanguage } from "@/providers/languageProvider";
import { toast } from "sonner";

interface PurchaseButtonProps {
  productId: string;
  productTitle: string;
  productPrice: number;
  quantity: number;
  selectedOption?: string;
  hasOptions?: boolean;
  isOutOfStock?: boolean;
  variantId?: string;
}

export function PurchaseButton({
  productId,
  productTitle,
  productPrice,
  quantity,
  selectedOption,
  hasOptions = false,
  isOutOfStock = false,
  variantId,
}: PurchaseButtonProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const addToCart = useAddToCart();

  const handlePurchase = () => {
    // 옵션이 있는 상품인 경우에만 옵션 체크
    if (hasOptions) {
      if (typeof selectedOption === "string" && selectedOption.trim() === "") {
        alert(t("productDetail.purchaseButton.selectOption"));
        return;
      }
    }

    if (isOutOfStock) {
      alert(t("productDetail.purchaseButton.outOfStock"));
      return;
    }

    // 주문 페이지로 이동
    const orderParams = new URLSearchParams({
      productId: productId,
      productTitle,
      productPrice: productPrice.toString(),
      quantity: quantity.toString(),
      ...(selectedOption && { selectedOption }),
    });

    router.push(`/order?${orderParams.toString()}`);
  };

  const handleAddToCart = async () => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error(t("productDetail.purchaseButton.loginRequired"));
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // 옵션이 있는 상품인 경우 variantId 체크
    if (hasOptions && !variantId) {
      toast.error(t("productDetail.purchaseButton.selectOption"));
      return;
    }

    if (isOutOfStock) {
      toast.error(t("productDetail.purchaseButton.outOfStock"));
      return;
    }

    try {
      await addToCart.mutateAsync({
        productId: productId,
        variantId: variantId || undefined,
        quantity: quantity,
      });
      // Success toast is handled by useAddToCart hook
    } catch (error) {
      console.error('Add to cart failed:', error);
      // Error toast is handled by useAddToCart hook
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 버튼 그룹 */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* 장바구니 담기 버튼 */}
        <Button
          onClick={handleAddToCart}
          variant="outline"
          className="w-full sm:flex-1 h-12 sm:h-14 border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 transition-all duration-200 font-semibold text-sm sm:text-base"
          disabled={isOutOfStock || addToCart.isPending}
        >
          {addToCart.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-pink-600 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("productDetail.purchaseButton.adding")}</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t("productDetail.purchaseButton.addToCart")}</span>
              <span className="sm:hidden">{t("productDetail.purchaseButton.add")}</span>
            </>
          )}
        </Button>

        {/* 바로 구매 버튼 */}
        <Button
          onClick={handlePurchase}
          className="w-full sm:flex-1 h-12 sm:h-14 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          disabled={isOutOfStock}
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">
            {isOutOfStock ? t("productDetail.purchaseButton.soldOut") : t("productDetail.purchaseButton.buyNow")}
          </span>
          <span className="sm:hidden">
            {isOutOfStock ? t("productDetail.purchaseButton.soldOut") : t("productDetail.purchaseButton.purchase")}
          </span>
        </Button>
      </div>

      {/* 부가 정보 */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <div className="hidden sm:block space-y-1">
          <p>• {t("productDetail.purchaseButton.safePayment")}</p>
          <p>• {t("productDetail.purchaseButton.fastShipping")}</p>
        </div>
        <div className="sm:hidden">
          <p>{t("productDetail.purchaseButton.safePayment")} • {t("productDetail.purchaseButton.fastShipping")}</p>
        </div>
      </div>
    </div>
  );
}
