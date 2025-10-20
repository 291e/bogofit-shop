"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/authProvider";
import { confirmPayment } from "@/lib/payment/toss";
import { isValidPaymentKey, isSessionId, TossPaymentData } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<TossPaymentData | null>(null);
  const [isVirtualAccount, setIsVirtualAccount] = useState(false);

  const handleConfirm = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [PAYMENT-SUCCESS] Payment Success Page Loaded');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = Number(searchParams.get("amount"));

    console.log('📋 [PAYMENT-SUCCESS] URL Query Params:');
    console.log('  - paymentKey:', paymentKey);
    console.log('  - orderId:', orderId);
    console.log('  - amount:', amount);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!paymentKey || !orderId || !amount) {
      console.error('❌ [PAYMENT-SUCCESS] Missing required params');
      setError("잘못된 결제 정보입니다");
      setLoading(false);
      return;
    }

    // Check if Session ID - REJECT IMMEDIATELY
    if (isSessionId(paymentKey)) {
      console.error("❌ [PAYMENT-SUCCESS] Session ID detected - payment NOT completed!", paymentKey);
      console.error("❌ [PAYMENT-SUCCESS] User closed widget before completing payment");
      setError(
        "결제가 완료되지 않았습니다.\n" +
        "결제 창에서 카드 정보를 입력하고 '결제하기' 버튼을 눌러야 합니다.\n" +
        "다시 시도해주세요."
      );
      setLoading(false);
      return;
    }
    
    // Validate real payment key format
    if (!isValidPaymentKey(paymentKey)) {
      console.error("❌ [PAYMENT-SUCCESS] Invalid payment key format:", paymentKey);
      setError("유효하지 않은 결제 키 형식입니다");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("로그인이 필요합니다");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Confirm payment with Toss API
      console.log("🔄 [PAYMENT-SUCCESS] Step 1: Confirming payment with Toss...");
      const result = await confirmPayment(paymentKey, orderId, amount, token);
      setPaymentData(result as TossPaymentData);
      console.log("✅ [PAYMENT-SUCCESS] Step 1: Payment confirmed with Toss");
      
      // Step 2: Update order status in database
      console.log("🔄 [PAYMENT-SUCCESS] Step 2: Updating order status in database...");
      try {
        const orderUpdateResponse = await fetch(`/api/order/${orderId}/payment-status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentKey,
            paymentStatus: 'PAID',
            paymentMethod: result.method,
            paymentAmount: amount,
            paymentDate: new Date().toISOString(),
            tossPaymentData: result
          })
        });

        if (orderUpdateResponse.ok) {
          console.log("✅ [PAYMENT-SUCCESS] Step 2: Order status updated in database");
        } else {
          console.warn("⚠️ [PAYMENT-SUCCESS] Step 2: Failed to update order status:", await orderUpdateResponse.text());
          // Don't fail the whole flow - payment is confirmed with Toss
        }
      } catch (orderUpdateError) {
        console.warn("⚠️ [PAYMENT-SUCCESS] Step 2: Order update failed:", orderUpdateError);
        // Don't fail the whole flow - payment is confirmed with Toss
      }
      
      // Check if virtual account
      if (result.method === "가상계좌" || result.virtualAccount) {
        setIsVirtualAccount(true);
        console.log("🏦 [PAYMENT-SUCCESS] Virtual account detected");
        console.log("🏦 [PAYMENT-SUCCESS] Account info:", result.virtualAccount);
      }
      
      setLoading(false);

      // Redirect to orders after 5 seconds (longer for virtual account to read info)
      const redirectDelay = result.method === "가상계좌" || result.virtualAccount ? 10000 : 3000;
      setTimeout(() => {
        router.push("/myPage?section=order");
      }, redirectDelay);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "결제 확인 실패");
      setLoading(false);
    }
  };

  useEffect(() => {
    handleConfirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-pink-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">결제를 확인하는 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    // Check if this is a SessionId error (incomplete payment)
    const isSessionIdError = error.includes("완료되지 않았습니다") || error.includes("결제하기");
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">결제 실패</h2>
              <p className="text-red-600 mb-4 whitespace-pre-line">{error}</p>
            </div>
            
            {isSessionIdError && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
                <p className="text-sm font-bold text-yellow-800 mb-3">
                  💡 결제를 완료하려면:
                </p>
                <ol className="text-sm text-yellow-900 space-y-2 list-decimal list-inside">
                  <li>결제 페이지로 돌아가기 버튼을 클릭하세요</li>
                  <li>다시 결제 버튼을 클릭하면 결제 창이 열립니다</li>
                  <li>카드 정보를 입력하세요:
                    <div className="ml-6 mt-1 font-mono text-xs">
                      • 카드번호: 4282-0000-0000-4282<br/>
                      • 유효기간: 12/25<br/>
                      • CVC: 123
                    </div>
                  </li>
                  <li className="font-bold text-red-700">
                    ⚠️ 반드시 결제 창 안에서 &quot;결제하기&quot; 버튼을 클릭하세요!
                  </li>
                  <li>2-3초 기다리면 자동으로 완료 페이지로 이동합니다</li>
                </ol>
                <p className="text-xs text-yellow-700 mt-3 font-semibold">
                  ❌ 중간에 결제 창을 닫으면 다시 이 오류가 발생합니다!
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.back()} 
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                {isSessionIdError ? "결제 페이지로 돌아가기" : "돌아가기"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/myPage?section=order")}
                className="w-full"
              >
                주문 목록으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Virtual Account UI
  if (isVirtualAccount && paymentData?.virtualAccount) {
    const va = paymentData.virtualAccount;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏦</div>
              <h2 className="text-2xl font-bold mb-2">가상계좌 발급 완료</h2>
              <p className="text-gray-600">
                아래 계좌로 입금하시면 결제가 완료됩니다
              </p>
            </div>

            {/* Virtual Account Info */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">은행</p>
                  <p className="text-xl font-bold">{va.bankCode}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-600 mb-1">계좌번호</p>
                  <p className="text-2xl font-bold font-mono mb-2">
                    {va.accountNumber}
                  </p>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(va.accountNumber);
                      alert("계좌번호가 복사되었습니다!");
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    📋 계좌번호 복사
                  </Button>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">입금금액</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₩{paymentData.totalAmount?.toLocaleString()}
                  </p>
                </div>

                {va.dueDate && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">입금기한</p>
                    <p className="text-lg font-semibold text-red-600">
                      {new Date(va.dueDate).toLocaleString('ko-KR')}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-600 mb-1">예금주</p>
                  <p className="text-lg font-semibold">
                    {va.customerName}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                ⚠️ 주의사항
              </p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• 입금자명이 일치해야 입금이 확인됩니다</li>
                <li>• 입금금액이 정확해야 자동 확인됩니다</li>
                <li>• 기한 내 미입금 시 자동 취소됩니다</li>
                <li>• 입금 확인까지 1-2분 소요될 수 있습니다</li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 text-center mb-4">
              10초 후 주문 목록으로 이동합니다...
            </p>

            <Button 
              onClick={() => router.push("/myPage?section=order")}
              className="w-full"
            >
              주문 목록 보기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular Card Payment UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full">
        <CardContent className="p-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">결제 완료!</h2>
          <p className="text-gray-600 mb-6">결제가 성공적으로 완료되었습니다</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">주문 번호:</span>
                <span className="font-mono">{paymentData?.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제 금액:</span>
                <span className="font-semibold">₩{paymentData?.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            3초 후 주문 목록으로 이동합니다...
          </p>
          
          <Button 
            onClick={() => router.push("/myPage?section=order")}
            className="w-full"
          >
            주문 목록 보기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-pink-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">결제를 확인하는 중...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

