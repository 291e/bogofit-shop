import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: "FAIL" | "PENDING" | "COMPLETED";
  productTitle: string;
  productId: string;
  createdAt: string;
}

export function usePaymentHistory() {
  const { user } = useUser();

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
