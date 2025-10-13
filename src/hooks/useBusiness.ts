"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Business,
  BusinessStats,
  BusinessProduct,
  BusinessOrder,
  BusinessCreateInput,
  BusinessUpdateInput,
  ProductCreateInput,
  ProductUpdateInput,
  BusinessOrderStatus,
} from "@/types/business";

export const useBusiness = () => {
  const { user: authUser } = useAuth(); // ✅ Use AuthProvider
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 공통 헤더 생성 함수
  const getAuthHeaders = () => {
    if (!authUser || !authUser.id) {
      console.error("[useBusiness] No authenticated user");
      throw new Error("로그인이 필요합니다");
    }

    const headers: Record<string, string> = {
      "x-user-id": authUser.id,  // ✅ Use real user ID from AuthProvider
    };

    const userData = {
      userId: authUser.userId,
      email: authUser.email,
      name: authUser.name || authUser.userId,
      isBusiness: authUser.isBusiness,
    };
    headers["x-user-data"] = encodeURIComponent(JSON.stringify(userData));

    return headers;
  };

  const fetchBusiness = useCallback(async () => {
    if (!authUser?.isBusiness) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/business", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error("비즈니스 정보를 가져오는데 실패했습니다");
      }

      const data = await response.json();
      setBusiness(data.business);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, [authUser?.isBusiness]);

  const createBusiness = async (input: BusinessCreateInput) => {
    try {
      setLoading(true);
      const response = await fetch("/api/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("비즈니스 등록에 실패했습니다");
      }

      const data = await response.json();
      setBusiness(data.business);
      return data.business;
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBusiness = async (input: BusinessUpdateInput) => {
    try {
      setLoading(true);
      const response = await fetch("/api/business", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("비즈니스 정보 수정에 실패했습니다");
      }

      const data = await response.json();
      setBusiness(data.business);
      return data.business;
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchBusiness();
    }
  }, [authUser, fetchBusiness]);

  return {
    business,
    loading,
    error,
    fetchBusiness,
    createBusiness,
    updateBusiness,
  };
};

export const useBusinessStats = () => {
  const { user: authUser } = useAuth(); // ✅ Use AuthProvider
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 공통 헤더 생성 함수
  const getAuthHeaders = () => {
    if (!authUser || !authUser.id) {
      console.error("[useBusinessStats] No authenticated user");
      throw new Error("로그인이 필요합니다");
    }

    const headers: Record<string, string> = {
      "x-user-id": authUser.id,  // ✅ Use real user ID from AuthProvider
    };

    const userData = {
      userId: authUser.userId,
      email: authUser.email,
      name: authUser.name || authUser.userId,
      isBusiness: authUser.isBusiness,
    };
    headers["x-user-data"] = encodeURIComponent(JSON.stringify(userData));

    return headers;
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/business/stats", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error("통계 정보를 가져오는데 실패했습니다");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export const useBusinessProducts = (
  page: number = 1, 
  limit: number = 10,
  searchTerm: string = "",
  statusFilter: string = "ALL",
  categoryFilter: string = "ALL"
) => {
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const fetchProducts = useCallback(async (pageNum: number = page, limitNum: number = limit) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limitNum.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      
      const response = await fetch(`/api/business/products?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("상품 목록을 가져오는데 실패했습니다");
      }

      const data = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, statusFilter, categoryFilter]);

  const createProduct = async (input: ProductCreateInput) => {
    try {
      const response = await fetch("/api/business/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("상품 등록에 실패했습니다");
      }

      const data = await response.json();
      setProducts((prev) => [data.product, ...prev]);
      return data.product;
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      throw err;
    }
  };

  const updateProduct = async (id: string, input: ProductUpdateInput) => {
    try {
      const response = await fetch(`/api/business/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("상품 수정에 실패했습니다");
      }

      const data = await response.json();
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? data.product : product))
      );
      return data.product;
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/business/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("상품 삭제에 실패했습니다");
      }

      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts(page, limit);
  }, [page, limit, searchTerm, statusFilter, categoryFilter, fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    stats,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
    goToPage: (newPage: number) => fetchProducts(newPage, limit),
  };
};

export const useBusinessOrders = () => {
  const { user: authUser } = useAuth(); // ✅ Use AuthProvider instead of localStorage
  const [orders, setOrders] = useState<BusinessOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 공통 헤더 생성 함수
  const getAuthHeaders = () => {
    if (!authUser || !authUser.id) {
      console.error("[useBusinessOrders] No authenticated user");
      throw new Error("로그인이 필요합니다");
    }

    const headers: Record<string, string> = {
      "x-user-id": authUser.id,  // ✅ Use real user ID from AuthProvider
    };

    const userData = {
      userId: authUser.userId,
      email: authUser.email,
      name: authUser.name || authUser.userId,
      isBusiness: authUser.isBusiness,
    };
    headers["x-user-data"] = encodeURIComponent(JSON.stringify(userData));

    return headers;
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/business/orders", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "주문 목록을 가져오는데 실패했습니다");
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    status: BusinessOrderStatus
  ) => {
    try {
      const response = await fetch(`/api/business/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("주문 상태 변경에 실패했습니다");
      }

      const data = await response.json();
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? data.order : order))
      );
      return data.order;
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      throw err;
    }
  };

  useEffect(() => {
    if (authUser && authUser.isBusiness) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [authUser, fetchOrders]);

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refetch: fetchOrders,
  };
};

// 재고 관리를 위한 Hook
interface InventoryProduct {
  id: string;
  productId: number;
  variantId: number;
  title: string;
  variantName: string;
  sku: string;
  category: string;
  imageUrl?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  stockValue: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  lastUpdated: string;
}

export const useBusinessInventory = (page: number = 1, limit: number = 10) => {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalProducts: 0,
  });

  const fetchInventory = async (pageNum: number = page, limitNum: number = limit) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/business/inventory?page=${pageNum}&limit=${limitNum}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("재고 목록을 불러오는데 실패했습니다");

      const data = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || { page: pageNum, limit: limitNum, total: 0, totalPages: 0 });
      setStats(data.stats || { totalValue: 0, lowStockCount: 0, outOfStockCount: 0, totalProducts: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (
    productId: number,
    variantId: number,
    type: "increase" | "decrease",
    quantity: number,
    reason: string
  ) => {
    try {
      const response = await fetch(`/api/business/inventory`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          variantId,
          type,
          quantity,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "재고 조정에 실패했습니다");
      }

      await fetchInventory(page, limit);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      throw err;
    }
  };

  useEffect(() => {
    fetchInventory(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  return {
    products,
    loading,
    error,
    pagination,
    stats,
    adjustStock,
    refetch: fetchInventory,
    goToPage: (newPage: number) => fetchInventory(newPage, limit),
  };
};
