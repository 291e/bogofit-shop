"use client";

import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import type { Payment } from "@/hooks/usePaymentHistory";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useState } from "react";
import { PaymentDetailModal } from "@/components/payment/PaymentDetailModal";

const paymentStatusMap = {
  PENDING: { label: "진행중", variant: "secondary" as const },
  COMPLETED: { label: "완료", variant: "default" as const },
  FAIL: { label: "실패", variant: "destructive" as const },
  UNKNOWN: { label: "알 수 없음", variant: "secondary" as const },
} as const;

const paymentMethodMap = {
  카드: "신용카드",
  가상계좌: "가상계좌",
  계좌이체: "계좌이체",
  휴대폰: "휴대폰",
} as const;

export default function PaymentHistoryPage() {
  const { data: payments, isLoading, error } = usePaymentHistory();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">결제 내역</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">결제 내역</h1>
        <div className="text-center text-red-500 py-8">
          {error instanceof Error
            ? error.message
            : "결제 내역을 불러오는데 실패했습니다."}
        </div>
      </div>
    );
  }

  if (!payments?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">결제 내역</h1>
        <div className="text-center text-gray-500 py-8">
          결제 내역이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">결제 내역</h1>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setSelectedPayment(payment)}
          >
            <div className="flex-1">
              <Link
                href={`/product/${payment.productId}`}
                className="font-semibold hover:text-[#d74fdf] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {payment.productTitle}
              </Link>
              <p className="text-sm text-gray-500">
                {format(new Date(payment.createdAt), "PPP", { locale: ko })}
              </p>
              <p className="text-sm text-gray-500">
                주문번호: {payment.orderId}
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <p className="text-lg font-bold">
                {payment.amount.toLocaleString()}원
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    paymentStatusMap[
                      payment.status as keyof typeof paymentStatusMap
                    ]?.variant || paymentStatusMap.UNKNOWN.variant
                  }
                >
                  {paymentStatusMap[
                    payment.status as keyof typeof paymentStatusMap
                  ]?.label || paymentStatusMap.UNKNOWN.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  {
                    paymentMethodMap[
                      payment.method as keyof typeof paymentMethodMap
                    ]
                  }
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PaymentDetailModal
        payment={selectedPayment}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
      />
    </div>
  );
}
