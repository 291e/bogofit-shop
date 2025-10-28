"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Order,
  OrderGroup,
  CreateOrderFromCartDto,
  CreateOrderResponse,
  GetOrderResponse,
  GetOrdersResponse,
  GetOrderGroupResponse,
} from "@/types/order";
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";

// ==================== QUERY KEYS ====================

export const ORDER_QUERY_KEYS = {
  all: ["orders"] as const,
  lists: () => [...ORDER_QUERY_KEYS.all, "list"] as const,
  list: (page: number, pageSize: number) =>
    [...ORDER_QUERY_KEYS.lists(), page, pageSize] as const,
  details: () => [...ORDER_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ORDER_QUERY_KEYS.details(), id] as const,
  groups: () => [...ORDER_QUERY_KEYS.all, "group"] as const,
  group: (id: string) => [...ORDER_QUERY_KEYS.groups(), id] as const,
  // Seller orders
  seller: () => [...ORDER_QUERY_KEYS.all, "seller"] as const,
  sellerList: (status: string | undefined, page: number, pageSize: number) =>
    [...ORDER_QUERY_KEYS.seller(), status || "all", page, pageSize] as const,
};

// ==================== FETCHER FUNCTIONS ====================

/**
 * Get seller's orders with pagination and status filter
 * Uses Next.js API route as proxy to backend
 */
async function fetchSellerOrders(
  status: string | undefined,
  page: number,
  pageSize: number,
  token: string
): Promise<{
  orders: Order[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (status) {
    params.append('status', status);
  }

  console.log('🔍 useSellerOrders: Fetching seller orders');
  console.log('📤 Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  console.log('📤 URL:', `/api/order/seller?${params.toString()}`);

  const response = await fetch(
    `/api/order/seller?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch seller orders: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch seller orders");
  }

  return {
    orders: data.data || [],
    pagination: data.pagination || { page, pageSize, totalCount: 0 },
  };
}

/**
 * Update order status (seller only)
 * Uses Next.js API route as proxy to backend
 */
async function updateOrderStatus(
  orderId: string,
  status: string,
  note: string | undefined,
  token: string
): Promise<void> {
  const response = await fetch(`/api/order/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, note }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update order status");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to update order status");
  }
}

/**
 * Create order from cart
 * Uses Next.js API route as proxy to backend
 */
async function createOrderFromCart(
  dto: CreateOrderFromCartDto,
  token: string
): Promise<Order> {
  const response = await fetch("/api/order/from-cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create order");
  }

  const data: CreateOrderResponse = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to create order");
  }

  return data.data;
}

/**
 * Get user's orders with pagination (grouped view)
 * Uses Next.js API route as proxy to backend
 * Returns order groups (both MoR with multiple orders & SoR with single order)
 * Note: All orders are in groups now - no standalone orders
 */
async function fetchOrders(
  page: number,
  pageSize: number,
  token: string
): Promise<{
  groups: OrderGroup[];
  singles: OrderGroup[];  // SoR: Groups with only 1 order
  totalGroups: number;
  totalSingles: number;
}> {
  const response = await fetch(
    `/api/order?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.status}`);
  }

  const data: GetOrdersResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch orders");
  }

  return {
    groups: data.data.groups || [],
    singles: data.data.singles || [],
    totalGroups: data.pagination?.totalGroups || 0,
    totalSingles: data.pagination?.totalSingles || 0,
  };
}

/**
 * Get single order by ID (RESTful)
 * Uses Next.js API route as proxy to backend
 */
async function fetchOrder(orderId: string, token: string): Promise<Order> {
  const response = await fetch(`/api/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order: ${response.status}`);
  }

  const data: GetOrderResponse = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to fetch order");
  }

  return data.data;
}

/**
 * Get order group by ID (RESTful)
 * Uses Next.js API route as proxy to backend
 */
async function fetchOrderGroup(
  groupId: string,
  token: string
): Promise<OrderGroup> {
  const response = await fetch(`/api/order/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order group: ${response.status}`);
  }

  const data: GetOrderGroupResponse = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to fetch order group");
  }

  return data.data;
}

// ==================== HOOKS ====================

/**
 * Hook to create order from cart
 * 
 * @example
 * ```tsx
 * const createOrder = useCreateOrderFromCart();
 * 
 * const handleCheckout = async () => {
 *   await createOrder.mutateAsync({
 *     shippingAddress: {...},
 *     discountTotal: 5000,
 *     shippingTotal: 3000
 *   });
 * };
 * ```
 */
export function useCreateOrderFromCart() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateOrderFromCartDto) => {
      if (!token) throw new Error("Authentication required");
      return createOrderFromCart(dto, token);
    },
    onSuccess: (order) => {
      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      // Invalidate order queries
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });

      toast.success("주문이 생성되었습니다!");
      console.log("✅ Order created:", order.orderNo);
    },
    onError: (error: Error) => {
      console.error("❌ Order creation failed:", error.message);
      toast.error(error.message || "주문 생성 실패");
    },
  });
}

/**
 * Hook to fetch user's orders with pagination
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useOrders(1, 20);
 * const orders = data?.orders || [];
 * ```
 */
export function useOrders(page: number = 1, pageSize: number = 20) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(page, pageSize),
    queryFn: () => {
      if (!token) throw new Error("Authentication required");
      return fetchOrders(page, pageSize, token);
    },
    enabled: isAuthenticated && !!token,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch single order
 * 
 * @example
 * ```tsx
 * const { data: order, isLoading } = useOrder(orderId);
 * ```
 */
export function useOrder(orderId: string | undefined) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderId || ""),
    queryFn: () => {
      if (!token || !orderId) throw new Error("Order ID required");
      return fetchOrder(orderId, token);
    },
    enabled: isAuthenticated && !!token && !!orderId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch order group
 * 
 * @example
 * ```tsx
 * const { data: orderGroup } = useOrderGroup(groupId);
 * ```
 */
export function useOrderGroup(groupId: string | undefined) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ORDER_QUERY_KEYS.group(groupId || ""),
    queryFn: () => {
      if (!token || !groupId) throw new Error("Group ID required");
      return fetchOrderGroup(groupId, token);
    },
    enabled: isAuthenticated && !!token && !!groupId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== SELLER HOOKS ====================

/**
 * Hook to fetch seller's orders with pagination and status filter
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useSellerOrders('paid', 1, 20);
 * const orders = data?.orders || [];
 * ```
 */
export function useSellerOrders(
  status: string | undefined = undefined,
  page: number = 1,
  pageSize: number = 20
) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ORDER_QUERY_KEYS.sellerList(status, page, pageSize),
    queryFn: () => {
      if (!token) throw new Error("Authentication required");
      return fetchSellerOrders(status, page, pageSize, token);
    },
    enabled: isAuthenticated && !!token,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update order status (seller only)
 * 
 * @example
 * ```tsx
 * const updateStatus = useUpdateOrderStatus();
 * 
 * const handleStatusUpdate = async () => {
 *   await updateStatus.mutateAsync({
 *     orderId: 'BOGOFIT-xxx',
 *     status: 'fulfilling',
 *     note: 'Order is being prepared'
 *   });
 * };
 * ```
 */
export function useUpdateOrderStatus() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      note,
    }: {
      orderId: string;
      status: string;
      note?: string;
    }) => {
      if (!token) throw new Error("Authentication required");
      return updateOrderStatus(orderId, status, note, token);
    },
    onSuccess: (_, variables) => {
      // Invalidate seller orders queries
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.seller() });

      // Invalidate specific order detail
      queryClient.invalidateQueries({
        queryKey: ORDER_QUERY_KEYS.detail(variables.orderId)
      });

      toast.success(`주문 상태가 '${variables.status}'로 변경되었습니다!`);
      console.log("✅ Order status updated:", variables.orderId, variables.status);
    },
    onError: (error: Error) => {
      console.error("❌ Order status update failed:", error.message);
      toast.error(error.message || "주문 상태 변경 실패");
    },
  });
}

