export type PaymentMethodCode =
  | "가상계좌"
  | "계좌이체"
  | "휴대폰"
  | "카드"
  | "문화상품권"
  | "게임문화상품권"
  | "도서문화상품권"
  | "해외간편결제"
  | "토스페이"
  | "토스결제"
  | "미선택";

export interface PaymentMethod {
  method: PaymentMethodCode;
  label: string;
}

export interface PaymentResult {
  orderId: string;
  amount: number;
  method: string;
  status: string;
  paymentKey: string;
  requestedAt: string;
  approvedAt: string;
  totalAmount?: number;
  methodName?: string;
  credits?: number;
  message?: string;
}

export interface PaymentResponse {
  orderId: string;
  error?: string;
  message?: string;
}
