"use client";

import { ShoppingBag, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";

interface PurchaseButtonProps {
  productId: number;
  productTitle: string;
  productPrice: number;
  quantity: number;
  selectedOption?: string;
  hasOptions?: boolean;
  isOutOfStock?: boolean;
}

export function PurchaseButton({
  productId,
  productTitle,
  productPrice,
  quantity,
  selectedOption,
  hasOptions = false,
  isOutOfStock = false,
}: PurchaseButtonProps) {
  const router = useRouter();
  const { user } = useUser();

  const handlePurchase = () => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

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

    // 주문/결제 페이지로 이동 (URL 파라미터로 상품 정보 전달)
    const orderParams = new URLSearchParams({
      productId: productId.toString(),
      productTitle,
      productPrice: productPrice.toString(),
      quantity: quantity.toString(),
      ...(selectedOption && { selectedOption }),
    });

    router.push(`/order?${orderParams.toString()}`);
  };

  const handleAddToCart = () => {
    // TODO: 장바구니 기능 구현
    alert("장바구니 기능은 추후 구현 예정입니다.");
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

      {/* 버튼 그룹 */}
      <div className="flex gap-3">
        {/* 장바구니 담기 버튼 */}
        <Button
          onClick={handleAddToCart}
          variant="outline"
          className="flex-1 h-14 border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 transition-all duration-200 font-semibold"
          disabled={isOutOfStock}
        >
          <Heart className="w-5 h-5 mr-2" />
          찜하기
        </Button>

        {/* 바로 구매 버튼 */}
        <Button
          onClick={handlePurchase}
          className="flex-1 h-14 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isOutOfStock}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          {isOutOfStock ? "품절" : "바로 구매"}
        </Button>
      </div>

      {/* 부가 정보 */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>• 안전한 결제 시스템으로 보호됩니다</p>
        <p>• 주문 후 1-2일 내 배송 시작</p>
      </div>
    </div>
  );
}
