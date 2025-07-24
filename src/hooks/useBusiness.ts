"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
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
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = async () => {
    if (!user?.isBusiness) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/business", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  };

  const createBusiness = async (input: BusinessCreateInput) => {
    try {
      setLoading(true);
      const response = await fetch("/api/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    if (user) {
      fetchBusiness();
    }
  }, [user]);

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
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/business/stats", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

export const useBusinessProducts = () => {
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/business/products", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("상품 목록을 가져오는데 실패했습니다");
      }

      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (input: ProductCreateInput) => {
    try {
      const response = await fetch("/api/business/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
};

export const useBusinessOrders = () => {
  const [orders, setOrders] = useState<BusinessOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/business/orders", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("주문 목록을 가져오는데 실패했습니다");
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: BusinessOrderStatus
  ) => {
    try {
      const response = await fetch(`/api/business/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refetch: fetchOrders,
  };
};
