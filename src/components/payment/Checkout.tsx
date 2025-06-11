"use client";

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { PaymentMethod } from "@/types/payment";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CheckoutButtonProps {
  productId: number;
  productTitle: string;
  productPrice: number;
  selectedOption?: string;
  hasOptions?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const dict = {
  payment: {
    title: "결제하기",
    checkout: "결제하기",
    method: "결제 수단",
    amount: "결제 금액",
    proceed: "결제 진행하기",
    methods: {
      card: "신용카드",
      virtual: "가상계좌",
      transfer: "계좌이체",
      phone: "휴대폰",
    },
  },
};

export function CheckoutButton({
  productId,
  productTitle,
  productPrice,
  selectedOption,
  hasOptions = false,
  isOpen,
  setIsOpen,
}: CheckoutButtonProps) {
  const paymentMethods: PaymentMethod[] = [
    { method: "카드", label: dict.payment.methods.card },
    { method: "가상계좌", label: dict.payment.methods.virtual },
    { method: "계좌이체", label: dict.payment.methods.transfer },
    { method: "휴대폰", label: dict.payment.methods.phone },
  ];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    paymentMethods[0]
  );
  const amount = productPrice.toString();
  const [internalOpen, setInternalOpen] = useState(false);
  const dialogOpen = typeof isOpen === "boolean" ? isOpen : internalOpen;
  const dialogSetOpen =
    typeof setIsOpen === "function" ? setIsOpen : setInternalOpen;
  const { user } = useUser();

  const handlePayment = async () => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
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

    if (!paymentMethod) {
      alert("결제 수단을 선택하세요.");
      return;
    }

    const res = await fetch("/api/payment/prepare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
      },
      body: JSON.stringify({
        amount: Number(amount),
        method: paymentMethod.method,
        productId,
        productTitle,
        selectedOption,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.orderId) {
      alert(
        data.error || data.message || "결제 준비 실패: 주문번호가 없습니다."
      );
      return;
    }
    const { orderId } = data;

    // 2. Toss 결제창 호출 (orderId가 정상일 때만)
    const tossPayments = await loadTossPayments(
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ""
    );
    try {
      await tossPayments.requestPayment(paymentMethod.method, {
        orderId,
        orderName: productTitle,
        customerName: user?.userId || "고객",
        amount: Number(amount),
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
      });
      dialogSetOpen(false);
    } catch (error) {
      console.error("결제 요청 실패:", error);
      // 결제 실패 처리
      try {
        await fetch("/api/payment/prepare", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            failReason: "결제 요청 실패",
          }),
        });
      } catch (updateError) {
        console.error("결제 실패 상태 업데이트 실패:", updateError);
      }
      alert("결제 요청에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={dialogSetOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-[#d74fdf] hover:bg-[#b93fc0] text-white font-bold py-2 px-4 rounded-md transition-colors shadow-md">
          {dict.payment.checkout}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-6 rounded-2xl shadow-lg border-2 border-[#d74fdf]">
        <DialogHeader>
          <DialogTitle className="text-[#d74fdf] text-xl font-extrabold flex items-center gap-2">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#d74fdf" opacity="0.15" />
              <path
                d="M7 12h10M7 16h10M7 8h10"
                stroke="#d74fdf"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {dict.payment.title}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#d74fdf]">
              {dict.payment.method}
            </label>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.method}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold flex items-center gap-1 transition-all focus:outline-none focus:ring-2 focus:ring-[#d74fdf] focus:border-[#d74fdf] shadow-sm
                    ${
                      paymentMethod?.method === method.method
                        ? "bg-[#d74fdf] border-[#d74fdf] text-white scale-105 shadow-lg"
                        : "bg-white border-gray-300 text-[#d74fdf] hover:bg-[#f7e6fa] hover:border-[#d74fdf]"
                    }
                  `}
                  onClick={() => setPaymentMethod(method)}
                  type="button"
                  aria-pressed={paymentMethod?.method === method.method}
                >
                  {/* 아이콘 예시: 카드, 계좌 등 */}
                  {method.method === "카드" && (
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <rect
                        x="2"
                        y="4"
                        width="12"
                        height="8"
                        rx="2"
                        fill="currentColor"
                        opacity="0.15"
                      />
                      <rect
                        x="2"
                        y="4"
                        width="12"
                        height="8"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="4"
                        y="9"
                        width="3"
                        height="1"
                        rx="0.5"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  {method.method === "가상계좌" && (
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <rect
                        x="3"
                        y="5"
                        width="10"
                        height="6"
                        rx="1"
                        fill="currentColor"
                        opacity="0.15"
                      />
                      <rect
                        x="3"
                        y="5"
                        width="10"
                        height="6"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                    </svg>
                  )}
                  {method.method === "계좌이체" && (
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <rect
                        x="2.5"
                        y="6"
                        width="11"
                        height="4"
                        rx="1"
                        fill="currentColor"
                        opacity="0.15"
                      />
                      <rect
                        x="2.5"
                        y="6"
                        width="11"
                        height="4"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M4 10V12h8v-2"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                  )}
                  {method.method === "휴대폰" && (
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <rect
                        x="5"
                        y="2.5"
                        width="6"
                        height="11"
                        rx="1"
                        fill="currentColor"
                        opacity="0.15"
                      />
                      <rect
                        x="5"
                        y="2.5"
                        width="6"
                        height="11"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <circle cx="8" cy="12" r="0.7" fill="currentColor" />
                    </svg>
                  )}
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#d74fdf]">
              {dict.payment.amount}
            </label>
            <div className="w-full p-4 bg-[#f7e6fa] border-2 border-[#d74fdf] rounded-lg text-2xl font-bold text-[#d74fdf] text-center select-none cursor-not-allowed">
              {Number(amount).toLocaleString()}원
            </div>
            {/* 금액 입력란 제거, 아래는 readOnly input 대체용 */}
            {/*
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
              readOnly
              style={{ backgroundColor: '#f7e6fa', color: '#d74fdf', cursor: 'not-allowed', fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center' }}
            />
            */}
          </div>

          <Button
            className="w-full bg-[#d74fdf] hover:bg-[#b93fc0] text-white font-bold py-3 px-4 rounded-xl text-lg shadow-lg transition-colors mt-2"
            onClick={handlePayment}
            disabled={!paymentMethod}
          >
            {dict.payment.proceed}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
