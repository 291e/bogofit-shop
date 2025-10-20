"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getTossPaymentStatus, 
  cancelTossPayment 
} from "@/lib/payment/toss";
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";

// ==================== QUERY KEYS ====================

export const PAYMENT_QUERY_KEYS = {
  all: ["payments"] as const,
  status: (paymentKey: string) => [...PAYMENT_QUERY_KEYS.all, "status", paymentKey] as const,
};

// ==================== HOOKS ====================

/**
 * Hook to fetch payment status
 * 
 * @example
 * ```tsx
 * const { data: payment, isLoading } = usePaymentStatus(paymentKey);
 * ```
 */
export function usePaymentStatus(paymentKey: string | undefined) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.status(paymentKey || ""),
    queryFn: async () => {
      if (!token || !paymentKey) throw new Error("Token and payment key required");
      return getTossPaymentStatus(paymentKey, token);
    },
    enabled: isAuthenticated && !!token && !!paymentKey,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to cancel/refund payment
 * 
 * @example
 * ```tsx
 * const cancelPayment = useCancelPayment();
 * 
 * const handleCancel = async () => {
 *   await cancelPayment.mutateAsync({
 *     paymentKey: "tgen_abc123",
 *     cancelReason: "Customer request",
 *     cancelAmount: 10000 // Optional, for partial refund
 *   });
 * };
 * ```
 */
export function useCancelPayment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      paymentKey: string;
      cancelReason: string;
      cancelAmount?: number;
    }) => {
      if (!token) throw new Error("Authentication required");
      return cancelTossPayment(
        data.paymentKey,
        data.cancelReason,
        token,
        data.cancelAmount
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate payment status query
      queryClient.invalidateQueries({
        queryKey: PAYMENT_QUERY_KEYS.status(variables.paymentKey),
      });
      
      // Invalidate order queries (payment affects order status)
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      const isPartial = !!variables.cancelAmount;
      toast.success(
        isPartial 
          ? `₩${variables.cancelAmount?.toLocaleString()} 부분 환불 완료` 
          : "결제 취소 완료"
      );
      console.log("✅ Payment canceled:", data);
    },
    onError: (error: Error) => {
      console.error("❌ Payment cancellation failed:", error.message);
      toast.error(error.message || "결제 취소 실패");
    },
  });
}

