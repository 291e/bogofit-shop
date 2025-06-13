import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Payment } from "@/hooks/usePaymentHistory";
import Image from "next/image";

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

interface PaymentDetailModalProps {
  payment: Payment | null;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailModal({
  payment,
  onOpenChange,
}: PaymentDetailModalProps) {
  return (
    <Dialog open={!!payment} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>주문 상세 내역</DialogTitle>
        </DialogHeader>
        {payment && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">상품 정보</h3>
              <Link
                href={`/product/${payment.productId}`}
                className="text-[#d74fdf] hover:underline"
              >
                {payment.product?.title}
              </Link>
              <Image
                src={payment.product?.imageUrl || ""}
                alt={payment.product?.title || ""}
                width={100}
                height={100}
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">결제 정보</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">주문번호</span>
                <span>{payment.orderId}</span>
                <span className="text-gray-500">결제금액</span>
                <span className="font-semibold">
                  {payment.amount.toLocaleString()}원
                </span>
                <span className="text-gray-500">결제수단</span>
                <span>
                  {
                    paymentMethodMap[
                      payment.method as keyof typeof paymentMethodMap
                    ]
                  }
                </span>
                <span className="text-gray-500">결제상태</span>
                <span>
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
                </span>
                <span className="text-gray-500">결제일시</span>
                <span>
                  {format(new Date(payment.createdAt), "PPP p", { locale: ko })}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
