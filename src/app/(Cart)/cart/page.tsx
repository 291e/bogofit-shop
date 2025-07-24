"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    isLoading,
    error,
    updateItem,
    removeItem,
    clearCart,
    isRemovingItem,
    isClearingCart,
  } = useCart();

  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  // 수량 변경 핸들러
  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      setUpdatingItemId(itemId);
      await updateItem({ itemId, quantity: newQuantity });
    } catch (error) {
      console.error("수량 변경 실패:", error);
      alert("수량 변경에 실패했습니다.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // 아이템 제거 핸들러
  const handleRemoveItem = async (itemId: number) => {
    if (!confirm("이 상품을 장바구니에서 제거하시겠습니까?")) return;

    try {
      await removeItem(itemId);
    } catch (error) {
      console.error("상품 제거 실패:", error);
      alert("상품 제거에 실패했습니다.");
    }
  };

  // 장바구니 비우기 핸들러
  const handleClearCart = async () => {
    if (!confirm("장바구니를 모두 비우시겠습니까?")) return;

    try {
      await clearCart();
    } catch (error) {
      console.error("장바구니 비우기 실패:", error);
      alert("장바구니 비우기에 실패했습니다.");
    }
  };

  // 주문하기 핸들러
  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) return;

    // 첫 번째 상품 정보로 주문 페이지 이동 (다중 상품 주문은 추후 구현)
    const firstItem = cart.items[0];
    const searchParams = new URLSearchParams({
      productId: firstItem.variant.product.id.toString(),
      productTitle: firstItem.variant.product.title,
      productPrice: (
        firstItem.variant.product.price + firstItem.variant.priceDiff
      ).toString(),
      quantity: firstItem.quantity.toString(),
      selectedOption: `${firstItem.variant.optionName}: ${firstItem.variant.optionValue}`,
    });

    router.push(`/order?${searchParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">장바구니를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error
              ? error.message
              : "장바구니를 불러오는데 실패했습니다."}
          </p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-pink-600" />
              장바구니
            </h1>
          </div>

          {!cart || cart.items.length === 0 ? (
            /* 빈 장바구니 */
            <div className="text-center py-20">
              <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                장바구니가 비어있습니다
              </h2>
              <p className="text-gray-600 mb-8">
                원하는 상품을 장바구니에 담아보세요!
              </p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                  상품 둘러보기
                </Button>
              </Link>
            </div>
          ) : (
            /* 장바구니 내용 */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 장바구니 아이템 목록 */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    상품 목록 ({cart.totalItems}개)
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={isClearingCart}
                    className="text-red-500 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {isClearingCart ? "비우는 중..." : "전체 삭제"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* 상품 이미지 */}
                          <div className="flex-shrink-0">
                            <Image
                              src={item.variant.product.imageUrl}
                              alt={item.variant.product.title}
                              width={100}
                              height={100}
                              className="rounded-lg object-cover"
                            />
                          </div>

                          {/* 상품 정보 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-lg truncate">
                                  {item.variant.product.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {item.variant.optionName}:{" "}
                                  {item.variant.optionValue}
                                </p>
                                <Badge variant="outline" className="mt-1">
                                  {item.variant.product.category}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={isRemovingItem}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* 가격 및 수량 */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-pink-600">
                                  {(
                                    item.variant.product.price +
                                    item.variant.priceDiff
                                  ).toLocaleString()}
                                  원
                                </span>
                                {item.variant.priceDiff !== 0 && (
                                  <span className="text-sm text-gray-500">
                                    (옵션:{" "}
                                    {item.variant.priceDiff > 0 ? "+" : ""}
                                    {item.variant.priceDiff.toLocaleString()}원)
                                  </span>
                                )}
                              </div>

                              {/* 수량 조절 */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={
                                    item.quantity <= 1 ||
                                    updatingItemId === item.id
                                  }
                                  className="h-8 w-8"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQuantity = parseInt(
                                      e.target.value
                                    );
                                    if (
                                      newQuantity > 0 &&
                                      newQuantity <= item.variant.stock
                                    ) {
                                      handleQuantityChange(
                                        item.id,
                                        newQuantity
                                      );
                                    }
                                  }}
                                  disabled={updatingItemId === item.id}
                                  className="w-16 h-8 text-center"
                                  min="1"
                                  max={item.variant.stock}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={
                                    item.quantity >= item.variant.stock ||
                                    updatingItemId === item.id
                                  }
                                  className="h-8 w-8"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* 소계 */}
                            <div className="mt-3 text-right">
                              <span className="text-sm text-gray-600">
                                소계:{" "}
                              </span>
                              <span className="font-bold text-lg">
                                {(
                                  (item.variant.product.price +
                                    item.variant.priceDiff) *
                                  item.quantity
                                ).toLocaleString()}
                                원
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 주문 요약 */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>주문 요약</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>상품 금액</span>
                        <span>{cart.totalPrice.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span>배송비</span>
                        <span className="text-green-600">무료</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>총 결제 금액</span>
                        <span className="text-pink-600">
                          {cart.totalPrice.toLocaleString()}원
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• 모든 주문 무료배송</p>
                      <p>• 주문 완료 후 1-2일 내 배송 시작</p>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={handleCheckout}
                        className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg"
                        disabled={cart.items.length === 0}
                      >
                        주문하기
                      </Button>
                      <Link href="/products">
                        <Button variant="outline" className="w-full">
                          쇼핑 계속하기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
