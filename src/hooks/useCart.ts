"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Cart, 
  CartItem, 
  CreateCartItemDto, 
  UpdateCartItemDto,
  EMPTY_CART 
} from "@/types/cart";
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";

// ==================== QUERY KEYS ====================

export const CART_QUERY_KEY = ["cart"];


// ==================== RESPONSE TYPES ====================

interface CartResponse {
  success: boolean;
  message: string;
  data: Cart;
}

interface CartItemResponse {
  success: boolean;
  message: string;
  data: CartItem;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

// ==================== FETCHER FUNCTIONS ====================

/**
 * Fetch user's cart
 */
async function fetchCart(token: string): Promise<Cart> {
  const response = await fetch('/api/cart', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cart: ${response.status}`);
  }

  const data: CartResponse = await response.json();
  
  if (data.success) {
    return data.data;
  }
  
  // Return empty cart if no cart exists
  return EMPTY_CART;
}

/**
 * Add item to cart
 */
async function addToCartApi(
  dto: CreateCartItemDto,
  token: string
): Promise<CartItem> {
  const response = await fetch('/api/cart/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  const data: CartItemResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to add to cart');
  }

  return data.data;
}

/**
 * Update cart item quantity
 */
async function updateCartItemApi(
  itemId: string,
  dto: UpdateCartItemDto,
  token: string
): Promise<CartItem> {
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  const data: CartItemResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to update cart item');
  }

  return data.data;
}

/**
 * Remove item from cart
 */
async function removeFromCartApi(
  itemId: string,
  token: string
): Promise<void> {
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: DeleteResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to remove from cart');
  }
}

/**
 * Clear all items from cart
 */
async function clearCartApi(token: string): Promise<void> {
  const response = await fetch('/api/cart/clear', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: DeleteResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to clear cart');
  }
}

// ==================== HOOKS ====================

/**
 * Hook to fetch cart with caching
 * 
 * @example
 * ```tsx
 * const { data: cart, isLoading } = useCart();
 * const totalItems = cart?.totalItems || 0;
 * ```
 */
export function useCart() {
  const { token, isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => {
      return fetchCart(token!);
    },
    enabled: isAuthenticated && !!token,
    staleTime: 30 * 1000, // 30 seconds - cart changes frequently
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
  });

  return query;
}

/**
 * Hook to add item to cart
 * Automatically handles toast notifications and cache updates
 * 
 * @example
 * ```tsx
 * const addToCart = useAddToCart();
 * 
 * const handleAddToCart = async () => {
 *   await addToCart.mutateAsync({
 *     productId: 'uuid',
 *     variantId: 'uuid',
 *     quantity: 1
 *   });
 * };
 * ```
 */
export function useAddToCart() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateCartItemDto) => {
      if (!token) throw new Error('Authentication required');
      return addToCartApi(dto, token);
    },
    onSuccess: (newItem) => {
      // ✅ Invalidate cart to refetch
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      
      // ✅ Show success toast
      toast.success("Added to cart successfully!");
      console.log('✅ Added to cart:', newItem.productName);
    },
    onError: (error: Error) => {
      // ✅ Show error toast
      console.error('❌ Add to cart failed:', error.message);
      
      // Show user-friendly error for stock issues
      if (error.message.includes('Insufficient stock')) {
        toast.error(error.message);
        } else {
        toast.error("Failed to add to cart");
      }
    }
  });
}

/**
 * Hook to update cart item quantity
 * 
 * @example
 * ```tsx
 * const updateCartItem = useUpdateCartItem();
 * 
 * const handleQuantityChange = async (itemId: string, newQuantity: number) => {
 *   await updateCartItem.mutateAsync({ itemId, quantity: newQuantity });
 * };
 * ```
 */
export function useUpdateCartItem() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (!token) throw new Error('Authentication required');
      return updateCartItemApi(itemId, { quantity }, token);
    },
    onSuccess: (updatedItem) => {
      // ✅ Invalidate cart to refetch
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      
      console.log('✅ Cart updated:', updatedItem.productName, 'x', updatedItem.quantity);
    },
    onError: (error: Error) => {
      console.error('❌ Update cart item failed:', error.message);
      
      // Show user-friendly error for stock issues
      if (error.message.includes('Insufficient stock')) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update cart");
      }
    }
  });
}

/**
 * Hook to remove item from cart
 * 
 * @example
 * ```tsx
 * const removeFromCart = useRemoveFromCart();
 * 
 * const handleRemove = async (itemId: string) => {
 *   await removeFromCart.mutateAsync(itemId);
 * };
 * ```
 */
export function useRemoveFromCart() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!token) throw new Error('Authentication required');
      return removeFromCartApi(itemId, token);
    },
    onSuccess: () => {
      // ✅ Invalidate cart to refetch
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      
      // ✅ Show success toast
      toast.success("Removed from cart");
      console.log('✅ Item removed from cart');
    },
    onError: (error: Error) => {
      console.error('❌ Remove from cart failed:', error.message);
      toast.error("Failed to remove from cart");
    }
  });
}

/**
 * Hook to clear all items from cart
 * 
 * @example
 * ```tsx
 * const clearCart = useClearCart();
 * 
 * const handleClearCart = async () => {
 *   if (confirm('Clear all items?')) {
 *     await clearCart.mutateAsync();
 *   }
 * };
 * ```
 */
export function useClearCart() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Authentication required');
      return clearCartApi(token);
    },
    onSuccess: () => {
      // ✅ Invalidate cart to refetch
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      
      // ✅ Show success toast
      toast.success("Cart cleared");
      console.log('✅ Cart cleared');
    },
    onError: (error: Error) => {
      console.error('❌ Clear cart failed:', error.message);
      toast.error("Failed to clear cart");
    }
  });
}

/**
 * Get cart count (total items)
 * 
 * @example
 * ```tsx
 * const { data: cart } = useCart();
 * const cartCount = cart?.totalItems || 0;
 * ```
 */
export function useCartCount() {
  const { data: cart } = useCart();
  return cart?.totalItems || 0;
}

/**
 * Check if product/variant is in cart
 * 
 * @example
 * ```tsx
 * const { data: cart } = useCart();
 * const isInCart = useIsInCart(productId, variantId);
 * ```
 */
export function useIsInCart(productId?: string, variantId?: string) {
  const { data: cart } = useCart();
  
  if (!cart || !productId) return false;
  
  return cart.items.some(item => 
    item.productId === productId && 
    item.variantId === variantId
  );
}

/**
 * Get cart item by product/variant
 * 
 * @example
 * ```tsx
 * const { data: cart } = useCart();
 * const cartItem = useCartItem(productId, variantId);
 * ```
 */
export function useCartItem(productId?: string, variantId?: string) {
  const { data: cart } = useCart();
  
  if (!cart || !productId) return null;
  
  return cart.items.find(item => 
    item.productId === productId && 
    item.variantId === variantId
  ) || null;
}

// ==================== LEGACY SUPPORT (for backward compatibility) ====================

/**
 * Legacy hook interface (same as useCart)
 * @deprecated Use useCart, useAddToCart, etc. instead
 */
export function useGuestCart() {
  return useCart();
}
