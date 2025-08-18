import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: "FAIL" | "PENDING" | "COMPLETED" | "SHIPPING" | "PAID";
  createdAt: string;
  approvedAt?: string | null;
  product: {
    id: number;
    title: string;
    imageUrl: string;
  } | null;
  productCount: number;
  orderer: {
    name: string | null;
    email: string | null;
    phone: string | null;
    tel: string | null;
  } | null;
  order: {
    status:
      | "PENDING"
      | "PAID"
      | "SHIPPING"
      | "COMPLETED"
      | "CANCELED"
      | "FAILED";
  } | null;
  shipping: {
    recipientName: string | null;
    recipientPhone: string | null;
    recipientTel: string | null;
    zipCode: string | null;
    address1: string | null;
    address2: string | null;
  } | null;
  customsId: string | null;
}

export function usePaymentHistory() {
  const { user } = useAuth();

  return useQuery<Payment[]>({
    queryKey: ["paymentHistory", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("로그인이 필요합니다.");

      const res = await fetch("/api/payment/history", {
        headers: {
          "x-user-id": user.id,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.message || "결제 내역을 불러오는데 실패했습니다."
        );
      }

      const data = await res.json();
      return data.payments;
    },
    enabled: !!user?.id,
  });
}
