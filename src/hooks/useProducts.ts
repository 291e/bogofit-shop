import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";

interface UseProductsParams {
  page?: number;
  limit?: number;
  random?: number;
  dateSeed?: string;
  showSoldOut?: boolean;
  sortBy?: string;
  category?: string;
  search?: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useProducts(params: UseProductsParams = {}) {
  const {
    page = 1,
    limit = 12,
    random,
    dateSeed,
    showSoldOut = false,
    sortBy,
    category,
    search,
  } = params;

  // Build query string
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());
  if (random) searchParams.set("random", random.toString());
  if (dateSeed) searchParams.set("dateSeed", dateSeed);
  if (showSoldOut) searchParams.set("showSoldOut", "true");
  if (sortBy) searchParams.set("sortBy", sortBy);
  if (category) searchParams.set("category", category);
  if (search) searchParams.set("search", search);

  return useQuery({
    queryKey: ["products", params],
    queryFn: async (): Promise<ProductsResponse> => {
      const res = await fetch(`/api/products?${searchParams.toString()}`);
      if (!res.ok) throw new Error("상품 목록을 불러오지 못했습니다.");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// Convenience hooks for specific use cases
export function useRandomProducts(count: number = 60) {
  const today = new Date();
  const dateSeed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
  return useProducts({
    random: count,
    dateSeed,
    showSoldOut: true, // Include sold out products for main page sections
  });
}

export function useBestSellers() {
  const today = new Date();
  const dateSeed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
  return useProducts({
    random: 60,
    dateSeed: `${dateSeed}-best`, // Unique seed for Best Sellers
    showSoldOut: true,
  });
}

export function useNewArrivals() {
  const today = new Date();
  const dateSeed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
  return useProducts({
    random: 60,
    dateSeed: `${dateSeed}-new`, // Unique seed for New Arrivals
    showSoldOut: true,
  });
}

export function useAllProducts(page: number = 1, limit: number = 12) {
  return useProducts({
    page,
    limit,
    showSoldOut: true,
  });
}
