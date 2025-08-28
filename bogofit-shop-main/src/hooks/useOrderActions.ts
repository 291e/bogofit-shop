import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface CancelOrderResponse {
  success: boolean;
  message: string;
  orderId: string;
}

interface RefundOrderResponse {
  success: boolean;
  message: string;
  refundId: string;
}

interface RefundRequestData {
  reason?: string;
  description?: string;
}

export function useOrderActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 주문 취소 뮤테이션
  const cancelOrderMutation = useMutation<CancelOrderResponse, Error, string>({
    mutationFn: async (orderId: string) => {
      if (!user?.id) throw new Error("로그인이 필요합니다.");

      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "주문 취소에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      // 결제 내역 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
    },
  });

  // 환불 신청 뮤테이션
  const refundOrderMutation = useMutation<
    RefundOrderResponse,
    Error,
    { orderId: string; data?: RefundRequestData }
  >({
    mutationFn: async ({ orderId, data = {} }) => {
      if (!user?.id) throw new Error("로그인이 필요합니다.");

      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "환불 신청에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      // 결제 내역 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
    },
  });

  return {
    // 주문 취소
    cancelOrder: cancelOrderMutation.mutate,
    cancelOrderAsync: cancelOrderMutation.mutateAsync,
    isCanceling: cancelOrderMutation.isPending,
    cancelError: cancelOrderMutation.error,
    cancelIsSuccess: cancelOrderMutation.isSuccess,

    // 환불 신청
    refundOrder: refundOrderMutation.mutate,
    refundOrderAsync: refundOrderMutation.mutateAsync,
    isRefunding: refundOrderMutation.isPending,
    refundError: refundOrderMutation.error,
    refundIsSuccess: refundOrderMutation.isSuccess,

    // 전체 로딩 상태
    isLoading: cancelOrderMutation.isPending || refundOrderMutation.isPending,
  };
}
