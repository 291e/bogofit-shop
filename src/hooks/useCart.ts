import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { Cart, AddToCartRequest, GuestCart, GuestCartItem } from "@/types/cart";
import { useState, useEffect } from "react";

// 기존 로그인 사용자용 장바구니 훅
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

// 비회원 장바구니 훅
export function useGuestCart() {
  const [guestCart, setGuestCart] = useState<GuestCart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    updatedAt: new Date().toISOString(),
  });

  // 로컬 스토리지에서 장바구니 로드
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("guest-cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setGuestCart(parsed);
        } catch (error) {
          console.error("게스트 장바구니 로드 실패:", error);
        }
      }
    }
  }, []);

  // 장바구니 데이터를 로컬 스토리지에 저장
  const saveCartToStorage = (cart: GuestCart) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("guest-cart", JSON.stringify(cart));
    }
    setGuestCart(cart);
  };

  // 장바구니에 상품 추가
  const addToGuestCart = async (request: AddToCartRequest) => {
    // 상품 정보 조회
    const res = await fetch(`/api/products/${request.variantId}`);
    if (!res.ok) {
      throw new Error("상품 정보를 불러올 수 없습니다.");
    }

    const productData = await res.json();

    // 이미 있는 상품인지 확인
    const existingItemIndex = guestCart.items.findIndex(
      (item) => item.variantId === request.variantId
    );

    let newItems: GuestCartItem[];

    if (existingItemIndex >= 0) {
      // 기존 상품 수량 업데이트
      newItems = [...guestCart.items];
      newItems[existingItemIndex].quantity += request.quantity;
    } else {
      // 새 상품 추가
      const newItem: GuestCartItem = {
        id: `guest-${Date.now()}-${Math.random()}`,
        variantId: request.variantId,
        quantity: request.quantity,
        product: {
          id: productData.product.id,
          title: productData.product.title,
          price: productData.product.price,
          imageUrl: productData.product.imageUrl,
          category: productData.product.category,
        },
        variant: {
          optionName: productData.variant?.optionName || "기본",
          optionValue: productData.variant?.optionValue || "기본",
          priceDiff: productData.variant?.priceDiff || 0,
        },
      };
      newItems = [...guestCart.items, newItem];
    }

    // 총합 계산
    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = newItems.reduce(
      (sum, item) =>
        sum + (item.product.price + item.variant.priceDiff) * item.quantity,
      0
    );

    const updatedCart: GuestCart = {
      items: newItems,
      totalItems,
      totalPrice,
      updatedAt: new Date().toISOString(),
    };

    saveCartToStorage(updatedCart);
  };

  // 장바구니 아이템 수량 변경
  const updateGuestCartItem = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeGuestCartItem(itemId);
      return;
    }

    const newItems = guestCart.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );

    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = newItems.reduce(
      (sum, item) =>
        sum + (item.product.price + item.variant.priceDiff) * item.quantity,
      0
    );

    const updatedCart: GuestCart = {
      items: newItems,
      totalItems,
      totalPrice,
      updatedAt: new Date().toISOString(),
    };

    saveCartToStorage(updatedCart);
  };

  // 장바구니 아이템 제거
  const removeGuestCartItem = (itemId: string) => {
    const newItems = guestCart.items.filter((item) => item.id !== itemId);

    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = newItems.reduce(
      (sum, item) =>
        sum + (item.product.price + item.variant.priceDiff) * item.quantity,
      0
    );

    const updatedCart: GuestCart = {
      items: newItems,
      totalItems,
      totalPrice,
      updatedAt: new Date().toISOString(),
    };

    saveCartToStorage(updatedCart);
  };

  // 장바구니 비우기
  const clearGuestCart = () => {
    const emptyCart: GuestCart = {
      items: [],
      totalItems: 0,
      totalPrice: 0,
      updatedAt: new Date().toISOString(),
    };

    saveCartToStorage(emptyCart);
  };

  return {
    // 데이터
    cart: guestCart,
    isLoading: false,
    error: null,

    // 액션
    addToCart: addToGuestCart,
    updateItem: updateGuestCartItem,
    removeItem: removeGuestCartItem,
    clearCart: clearGuestCart,

    // 로딩 상태 (게스트는 즉시 처리)
    isAddingToCart: false,
    isUpdatingItem: false,
    isRemovingItem: false,
    isClearingCart: false,
  };
}
