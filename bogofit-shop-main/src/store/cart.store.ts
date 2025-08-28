import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartState {
  // 장바구니 드롭다운 상태
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  toggleCart: () => void;

  // 최근 추가된 상품 정보 (알림용)
  recentlyAdded: {
    productTitle: string;
    quantity: number;
  } | null;
  setRecentlyAdded: (
    item: { productTitle: string; quantity: number } | null
  ) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      // 초기 상태
      isCartOpen: false,
      recentlyAdded: null,

      // 액션
      setCartOpen: (open: boolean) => set({ isCartOpen: open }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      setRecentlyAdded: (item) => set({ recentlyAdded: item }),
    }),
    {
      name: "cart-store",
      partialize: (state) => ({
        // 장바구니 열림 상태는 저장하지 않음
        recentlyAdded: state.recentlyAdded,
      }),
    }
  )
);
