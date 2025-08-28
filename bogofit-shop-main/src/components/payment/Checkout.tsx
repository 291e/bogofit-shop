"use client";

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Building2, Smartphone } from "lucide-react";

type PaymentMethodType = "카드" | "계좌이체" | "가상계좌";

interface CheckoutButtonProps {
  productId: number;
  productTitle: string;
  productPrice: number;
  selectedOption?: string;
  hasOptions?: boolean;
  isGuest?: boolean; // 비회원 주문 플래그
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function CheckoutButton({
  productId,
  productTitle,
  productPrice,
  selectedOption,
  hasOptions = false,
  isGuest = false,
  isOpen,
  setIsOpen,
}: CheckoutButtonProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<{
    method: PaymentMethodType;
    label: string;
    icon: React.ReactNode;
  } | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogSetOpen = setIsOpen || setDialogOpen;
  const amount = productPrice;

  const handlePayment = async () => {
    // 비회원인 경우 로그인 체크 건너뛰기
    if (!isGuest && !user?.id) {
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

    // 주문 페이지에서 온 경우 URL 파라미터에서 주문 정보 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const orderInfo = {
      ordererName: urlParams.get("ordererName") || "",
      ordererEmail: urlParams.get("ordererEmail") || "",
      ordererPhone: urlParams.get("ordererPhone") || "",
      recipientName: urlParams.get("recipientName") || "",
      recipientPhone: urlParams.get("recipientPhone") || "",
      address: urlParams.get("address") || "",
      addressDetail: urlParams.get("addressDetail") || "",
      zipCode: urlParams.get("zipCode") || "",
      deliveryRequest: urlParams.get("deliveryRequest") || "",
      customsInfo: {
        recipientNameEn: urlParams.get("recipientNameEn") || "",
        personalCustomsCode: urlParams.get("personalCustomsCode") || "",
      },
    };

    // 주문 정보가 있는지 확인 (주문 페이지에서 온 경우)
    const hasOrderInfo =
      orderInfo.ordererName && orderInfo.recipientName && orderInfo.address;

    const requestBody = {
      amount: Number(amount),
      method: paymentMethod.method,
      productId,
      productTitle,
      selectedOption,
      quantity: 1,
      isGuest, // 비회원 플래그 추가
      ...(hasOrderInfo && { orderInfo }), // 주문 정보가 있을 때만 포함
    };

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // 회원인 경우에만 x-user-id 헤더 추가
    if (!isGuest && user?.id) {
      headers["x-user-id"] = user.id;
    }

    const res = await fetch("/api/payment/prepare", {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
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
        customerName: isGuest
          ? orderInfo.ordererName || "게스트"
          : user?.userId || "고객",
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

  const paymentMethods: Array<{
    method: PaymentMethodType;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      method: "카드" as PaymentMethodType,
      label: "신용/체크카드",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      method: "계좌이체" as PaymentMethodType,
      label: "계좌이체",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      method: "가상계좌" as PaymentMethodType,
      label: "가상계좌",
      icon: <Smartphone className="w-5 h-5" />,
    },
  ];

  return (
    <Dialog open={isOpen || dialogOpen} onOpenChange={dialogSetOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg">
          {amount.toLocaleString()}원 결제하기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            결제 수단 선택
          </DialogTitle>
          <DialogDescription>
            원하시는 결제 방법을 선택해주세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 상품 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-1">{productTitle}</h3>
            {selectedOption && (
              <p className="text-sm text-gray-600 mb-2">{selectedOption}</p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">결제 금액</span>
              <span className="text-lg font-bold text-pink-600">
                {amount.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 결제 수단 선택 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">결제 수단</Label>
            <RadioGroup
              value={paymentMethod?.method || ""}
              onValueChange={(value) => {
                const selected = paymentMethods.find((m) => m.method === value);
                setPaymentMethod(selected || null);
              }}
            >
              {paymentMethods.map((method) => (
                <div
                  key={method.method}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setPaymentMethod(method)}
                >
                  <RadioGroupItem value={method.method} id={method.method} />
                  <div className="flex items-center gap-2 flex-1">
                    {method.icon}
                    <Label htmlFor={method.method} className="cursor-pointer">
                      {method.label}
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* 결제 버튼 */}
          <Button
            onClick={handlePayment}
            disabled={!paymentMethod}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold"
          >
            {amount.toLocaleString()}원 결제하기
          </Button>

          <p className="text-xs text-gray-500 text-center">
            안전한 결제를 위해 SSL 암호화를 사용합니다
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
