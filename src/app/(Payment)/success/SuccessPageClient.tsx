"use client";

import { useEffect, useState, useRef } from "react";
import { PaymentResult } from "@/types/payment";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<{
    paymentKey: string;
    orderId: string;
    amount: number;
  } | null>(null);
  const isProcessing = useRef(false);

  const paymentKey = searchParams.get("paymentKey") || "";
  const orderId = searchParams.get("orderId") || "";
  const amount = searchParams.get("amount")
    ? Number(searchParams.get("amount"))
    : 0;

  useEffect(() => {
    const getParams = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;
      try {
        if (!paymentKey || !orderId || !amount) {
          setError("결제 정보가 올바르지 않습니다.");
          return;
        }
        const data = { paymentKey, orderId, amount };
        setRequestData(data);
        const response = await fetch("/api/confirm/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const dataResponse = await response.json();
        if (!response.ok) {
          setError(dataResponse.message || "결제 확인 중 오류가 발생했습니다.");
        } else {
          setPaymentResult(dataResponse);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "결제 처리 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
        isProcessing.current = false;
      }
    };
    getParams();
  }, [paymentKey, orderId, amount]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="max-w-md mx-auto pt-16 px-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {error
                  ? "결제 처리 중 오류가 발생했습니다"
                  : "결제가 완료되었습니다"}
              </h1>
              <p className="text-gray-500 text-center">
                {paymentResult?.methodName || "신용카드"}로 결제가
                완료되었습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="max-w-md mx-auto pt-16 px-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                {/* 에러 아이콘 필요시 추가 */}
              </div>
              <h1 className="text-2xl font-bold text-red-500 mb-2">{error}</h1>
              <p className="text-gray-500 text-center">
                {paymentResult?.methodName || "신용카드"}로 결제가
                완료되었습니다.
              </p>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">주문번호</span>
                <span className="font-medium">{paymentResult?.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">결제금액</span>
                <span className="font-medium">
                  {requestData?.amount.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">결제수단</span>
                <span className="font-medium">
                  {paymentResult?.methodName || "신용카드"}
                </span>
              </div>
              {paymentResult?.credits && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">추가된 크레딧</span>
                  <span className="font-medium text-blue-600">
                    {paymentResult.credits} 크레딧
                  </span>
                </div>
              )}
              {paymentResult?.message && (
                <div className="text-sm text-blue-600 text-center mt-2">
                  {paymentResult.message}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentResult) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="max-w-md mx-auto pt-16 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              {/* 성공 아이콘 필요시 추가 */}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error
                ? "결제 처리 중 오류가 발생했습니다"
                : "결제가 완료되었습니다"}
            </h1>
            <p className="text-gray-500 text-center">
              {paymentResult?.methodName || "신용카드"}로 결제가 완료되었습니다.
            </p>
          </div>
          {!error && (
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">주문번호</span>
                <span className="font-medium">{paymentResult?.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">결제금액</span>
                <span className="font-medium">
                  {requestData?.amount.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">결제수단</span>
                <span className="font-medium">
                  {paymentResult?.methodName || "신용카드"}
                </span>
              </div>
              {paymentResult?.credits && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">추가된 크레딧</span>
                  <span className="font-medium text-blue-600">
                    {paymentResult.credits} 크레딧
                  </span>
                </div>
              )}
              {paymentResult?.message && (
                <div className="text-sm text-blue-600 text-center mt-2">
                  {paymentResult.message}
                </div>
              )}
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
