"use client";

import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart, useGuestCart } from "@/hooks/useCart";
import { useI18n } from "@/providers/I18nProvider";

interface PurchaseButtonProps {
  productId: number;
  productTitle: string;
  productPrice: number;
  quantity: number;
  selectedOption?: string;
  hasOptions?: boolean;
  isOutOfStock?: boolean;
  variantId?: number; // 장바구니에 추가할 때 필요한 variant ID
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
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();

  // 로그인된 사용자와 비회원을 위한 각각의 장바구니 훅
  const userCart = useCart();
  const guestCart = useGuestCart();

  // 현재 사용할 장바구니 결정
  const currentCart = user?.id ? userCart : guestCart;

  const handlePurchase = () => {
    // 옵션이 있는 상품인 경우에만 옵션 체크
    if (hasOptions) {
      if (typeof selectedOption === "string" && selectedOption.trim() === "") {
        alert(t("product.cta.selectOption"));
        return;
      }
    }

    if (isOutOfStock) {
      alert(t("product.cta.soldout"));
      return;
    }

    // 비회원인 경우 게스트 주문 페이지로, 회원인 경우 기존 주문 페이지로
    const orderParams = new URLSearchParams({
      productId: productId.toString(),
      productTitle,
      productPrice: productPrice.toString(),
      quantity: quantity.toString(),
      ...(selectedOption && { selectedOption }),
      ...(user?.id ? {} : { isGuest: "true" }), // 비회원 플래그
    });

    router.push(`/order?${orderParams.toString()}`);
  };

  const handleAddToCart = async () => {
    // 옵션이 있는 상품인 경우 variantId 체크
    if (hasOptions && !variantId) {
  alert(t("product.cta.selectOption"));
      return;
    }

    // variantId가 없는 경우 처리
    if (!variantId) {
      if (hasOptions) {
  alert(t("product.cta.selectOption"));
      } else {
  alert(t("product.cta.productInfoUnavailable"));
      }
      return;
    }

    // 옵션이 있는 상품인 경우 추가 검증
    if (hasOptions) {
      if (typeof selectedOption === "string" && selectedOption.trim() === "") {
        alert(t("product.cta.selectOption"));
        return;
      }
    }

    if (isOutOfStock) {
      alert(t("product.cta.soldout"));
      return;
    }

    try {
      await currentCart.addToCart({ variantId: variantId!, quantity });
    alert(t("product.cta.addedToCart"));
    } catch (error) {
    console.error(t("product.cta.addToCartFailedPrefix"), error);
      alert(
        error instanceof Error
          ? error.message
      : t("product.cta.addToCartFailed")
      );
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 비회원 안내 메시지 */}
      {!user?.id && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
          <p className="text-xs sm:text-sm text-blue-700 text-center">
            💡{" "}
            <span className="hidden sm:inline">{t("product.cta.guestTip.desktop")}</span>
            <span className="sm:hidden">{t("product.cta.guestTip.mobile")}</span>
          </p>
        </div>
      )}

      {/* 버튼 그룹 */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* 장바구니 담기 버튼 */}
        <Button
          onClick={handleAddToCart}
          variant="outline"
          className="w-full sm:flex-1 h-12 sm:h-14 border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 transition-all duration-200 font-semibold text-sm sm:text-base"
          disabled={isOutOfStock || currentCart.isAddingToCart}
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">
            {currentCart.isAddingToCart ? t("product.cta.adding") : t("product.cta.addToCart")}
          </span>
          <span className="sm:hidden">
            {currentCart.isAddingToCart ? t("product.cta.adding") : t("product.cta.addToCart")}
          </span>
        </Button>

        {/* 바로 구매 버튼 */}
        <Button
          onClick={handlePurchase}
          className="w-full sm:flex-1 h-12 sm:h-14 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          disabled={isOutOfStock}
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">
            {isOutOfStock ? t("product.badge.soldout") : user?.id ? t("product.cta.buyNow") : t("product.cta.guestOrder")}
          </span>
          <span className="sm:hidden">
            {isOutOfStock ? t("product.badge.soldout") : user?.id ? t("product.cta.buy") : t("product.cta.order")}
          </span>
        </Button>
      </div>

      {/* 부가 정보 */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <div className="hidden sm:block space-y-1">
          <p>• {t("product.cta.securePayment")}</p>
          <p>• {t("product.cta.shippingStart")}</p>
          {!user?.id && <p>• {t("product.cta.guestTracking")}</p>}
        </div>
        <div className="sm:hidden">
          <p>
            {t("product.cta.securePaymentShort")} • {t("product.cta.shippingStartShort")} 
            {!user?.id && ` • ${t("product.cta.guestTrackingShort")}`}
          </p>
        </div>
      </div>
    </div>
  );
}
