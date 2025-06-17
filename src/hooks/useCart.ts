import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { Cart, AddToCartRequest } from "@/types/cart";

export function useCart() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // 장바구니 조회
  const {
    data: cart,
    isLoading,
    error,
  } = useQuery<Cart>({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("로그인이 필요합니다.");

      const res = await fetch("/api/cart", {
        headers: {
          "x-user-id": user.id,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "장바구니를 불러오는데 실패했습니다.");
      }

      const data = await res.json();
      return data.cart;
    },
    enabled: !!user?.id,
  });

  // 장바구니에 상품 추가
  const addToCartMutation = useMutation({
    mutationFn: async (request: AddToCartRequest) => {
      if (!user?.id) throw new Error("로그인이 필요합니다.");

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "장바구니에 추가하는데 실패했습니다.");
      }

      return res.json();
    },
    onSuccess: () => {
      // 장바구니 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  // 장바구니 아이템 수량 변경
  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      if (!user?.id) throw new Error("로그인이 필요합니다.");

      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "수량 변경에 실패했습니다.");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  // 장바구니 아이템 삭제
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      if (!user?.id) throw new Error("로그인이 필요합니다.");

      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.id,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "상품 제거에 실패했습니다.");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  // 장바구니 비우기
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("로그인이 필요합니다.");

      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "x-user-id": user.id,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "장바구니를 비우는데 실패했습니다.");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  return {
    // 데이터
    cart,
    isLoading,
    error,

    // 액션
    addToCart: addToCartMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,

    // 로딩 상태
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
}
