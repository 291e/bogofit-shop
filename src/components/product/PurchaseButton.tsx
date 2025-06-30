"use client";

import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { useCart, useGuestCart } from "@/hooks/useCart";

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
  const { user } = useUser();

  // 로그인된 사용자와 비회원을 위한 각각의 장바구니 훅
  const userCart = useCart();
  const guestCart = useGuestCart();

  // 현재 사용할 장바구니 결정
  const currentCart = user?.id ? userCart : guestCart;

  const handlePurchase = () => {
    // 옵션이 있는 상품인 경우에만 옵션 체크
    if (hasOptions) {
      if (typeof selectedOption === "string" && selectedOption.trim() === "") {
        alert("옵션을 선택하세요.");
        return;
      }
      if (
        typeof selectedOption === "string" &&
        selectedOption.includes("품절")
      ) {
        alert("선택하신 상품은 품절입니다.");
        return;
      }
    }

    if (isOutOfStock) {
      alert("품절된 상품입니다.");
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
      alert("옵션을 선택해주세요.");
      return;
    }

    // variantId가 없는 경우 처리
    if (!variantId) {
      if (hasOptions) {
        alert("옵션을 선택해주세요.");
      } else {
        alert("상품 정보를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.");
      }
      return;
    }

    // 옵션이 있는 상품인 경우 추가 검증
    if (hasOptions) {
      if (typeof selectedOption === "string" && selectedOption.trim() === "") {
        alert("옵션을 선택하세요.");
        return;
      }
      if (
        typeof selectedOption === "string" &&
        selectedOption.includes("품절")
      ) {
        alert("선택하신 상품은 품절입니다.");
        return;
      }
    }

    if (isOutOfStock) {
      alert("품절된 상품입니다.");
      return;
    }

    try {
      await currentCart.addToCart({ variantId: variantId!, quantity });
      alert("장바구니에 추가되었습니다!");
    } catch (error) {
      console.error("장바구니 추가 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "장바구니에 추가하는데 실패했습니다."
      );
    }
  };

  const totalPrice = productPrice * quantity;

  return (
    <div className="space-y-4">
      {/* 총 가격 표시 */}
      <div className="text-center">
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
          총 {totalPrice.toLocaleString()}원
        </p>
        <p className="text-sm text-gray-500">
          {productPrice.toLocaleString()}원 × {quantity}개
        </p>
      </div>

      {/* 비회원 안내 메시지 */}
      {!user?.id && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700 text-center">
            💡 로그인하지 않아도 주문할 수 있습니다!
          </p>
        </div>
      )}

      {/* 버튼 그룹 */}
      <div className="flex gap-3">
        {/* 장바구니 담기 버튼 */}
        <Button
          onClick={handleAddToCart}
          variant="outline"
          className="flex-1 h-14 border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 transition-all duration-200 font-semibold"
          disabled={isOutOfStock || currentCart.isAddingToCart}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {currentCart.isAddingToCart ? "추가 중..." : "장바구니"}
        </Button>

        {/* 바로 구매 버튼 */}
        <Button
          onClick={handlePurchase}
          className="flex-1 h-14 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isOutOfStock}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          {isOutOfStock ? "품절" : user?.id ? "바로 구매" : "비회원 주문"}
        </Button>
      </div>

      {/* 부가 정보 */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>• 안전한 결제 시스템으로 보호됩니다</p>
        <p>• 주문 후 1-2일 내 배송 시작</p>
        {!user?.id && <p>• 비회원 주문 시 주문번호로 배송 조회 가능</p>}
      </div>
    </div>
  );
}
