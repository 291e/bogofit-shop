"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/authProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requestTossPayment } from "@/lib/payment/toss";
import { toast } from "sonner";

interface OrderGroup {
  orders?: Array<{
    orderNo: string;
    items?: Array<{
      productTitle: string;
    }>;
  }>;
  finalAmount: number;
  shippingPhone?: string;
}

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderGroup, setOrderGroup] = useState<OrderGroup | null>(null);
  const [selectedMethod, setSelectedMethod] = useState("카드");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const loadOrderGroup = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("로그인이 필요합니다");
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/order/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrderGroup(data.data);
      } else {
        toast.error("주문 정보를 불러올 수 없습니다");
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to load order group:", error);
      toast.error("주문 정보 로드 실패");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!orderGroup || !user) {
      toast.error("결제 정보가 올바르지 않습니다");
      return;
    }

    if (isPaymentProcessing) {
      console.log("⚠️ Payment already in progress");
      return;
    }

    try {
      setIsPaymentProcessing(true);

      const firstOrder = orderGroup.orders?.[0];
      const firstOrderNo = firstOrder?.orderNo;

      if (!firstOrderNo) {
        toast.error("주문 번호를 찾을 수 없습니다");
        setIsPaymentProcessing(false);
        return;
      }

      // ✅ Convert to integer (KRW has no decimals)
      const amount = Math.round(orderGroup.finalAmount);

      if (amount <= 0) {
        toast.error("결제 금액이 올바르지 않습니다");
        setIsPaymentProcessing(false);
        return;
      }

      const orderName = firstOrder?.items?.[0]
        ? `${firstOrder.items[0].productTitle} ${firstOrder.items.length > 1 ? `외 ${firstOrder.items.length - 1}건` : ''}`
        : "BOGOFIT 주문";

      console.log("🚀 [PAYMENT] Initiating payment:", {
        orderId: firstOrderNo,
        amount,
        method: selectedMethod,
        orderName,
      });

      // ⚠️ Warning for popup blocker
      toast.info("결제 창이 열립니다. 팝업 차단을 해제해주세요.", { duration: 3000 });

      // Request Toss Payment
      await requestTossPayment({
        orderId: firstOrderNo,  // ⭐ Order.OrderNo
        amount: amount,  // ⭐ Integer amount
        orderName: orderName,
        customerName: user.name || user.email || "",
        customerEmail: user.email || "",
        customerPhone: orderGroup.shippingPhone || undefined,
        method: selectedMethod,
      });

      // ⚠️ If we reach here, payment was cancelled or failed
      // Toss should redirect, so this shouldn't execute
      console.log("⚠️ [PAYMENT] Request completed without redirect - unusual");
      setIsPaymentProcessing(false);

    } catch (error: unknown) {
      const err = error as Error;
      console.error("❌ [PAYMENT] Payment request failed:", error);
      setIsPaymentProcessing(false);

      // Show user-friendly error
      if (err.message?.includes("SDK")) {
        toast.error("결제 시스템 로딩 실패. 페이지를 새로고침해주세요.");
      } else if (err.message?.includes("client key")) {
        toast.error("결제 설정 오류. 관리자에게 문의해주세요.");
      } else if (err.message?.includes("popup")) {
        toast.error("팝업이 차단되었습니다. 브라우저 설정에서 팝업 차단을 해제해주세요.");
      } else {
        toast.error(err.message || "결제 요청에 실패했습니다");
      }
    }
  };

  useEffect(() => {
    loadOrderGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!orderGroup) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">결제</h1>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">주문 정보</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>주문 번호:</span>
              <span className="font-mono text-sm">{orderGroup.orders?.[0]?.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span>상품 수:</span>
              <span>{orderGroup.orders?.[0]?.items?.length || 0}개</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
              <span>총 결제금액:</span>
              <span>₩{orderGroup.finalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">결제 수단</h3>
          <div className="grid grid-cols-2 gap-2">
            {['카드', '가상계좌', '계좌이체', '간편결제'].map((method) => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`p-3 border rounded ${selectedMethod === method
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200'
                  }`}
              >
                {method}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Removed verbose instructions per request */}

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isPaymentProcessing}
        className="w-full bg-pink-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPaymentProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            결제 처리 중...
          </span>
        ) : (
          `${selectedMethod}로 ₩${orderGroup.finalAmount?.toLocaleString()} 결제하기`
        )}
      </Button>

      {/* Loading Overlay - WITH LOWER Z-INDEX */}
      {isPaymentProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-8 rounded-lg text-center max-w-sm shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">💳</div>
            <h3 className="text-xl font-bold mb-2">결제 창을 확인해주세요</h3>
            <p className="text-gray-600 mb-4">
              팝업 또는 새 탭에서 결제를 진행해주세요.<br />
              <strong className="text-red-600">반드시 카드 정보를 입력하고<br />결제하기 버튼을 눌러주세요!</strong>
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <div>⚠️ 결제 창을 닫지 마세요</div>
              <div>⚠️ 카드 정보 입력 후 &quot;결제하기&quot; 클릭</div>
              <div>⚠️ Toss가 처리 완료될 때까지 대기</div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

