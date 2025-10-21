"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductResponseDto, CreateProductDto, UpdateProductDto } from "@/types/product";
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";

// Query key constants
export const PRODUCTS_QUERY_KEY = ["products"];
export const PRODUCT_DETAIL_QUERY_KEY = ["product"];

/**
 * Response type for products list
 */
export interface GetProductsResponse {
  success: boolean;
  message?: string;
  data?: {
    data: ProductResponseDto[];
    totalPages: number;
    totalCount: number;
    page: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  // Legacy support
  products?: ProductResponseDto[];
  pagination?: {
    totalPages: number;
    currentPage: number;
    pageSize: number;
    totalCount: number;
  };
  totalPages?: number;
  totalCount?: number;
}

/**
 * Response type for single product
 */
interface GetProductResponse {
  success: boolean;
  data?: ProductResponseDto;  // Legacy format
  product?: ProductResponseDto;  // ✅ Actual API format
  message?: string;
}

/**
 * Fetcher function for products list
 */
async function fetchProducts(
  brandId: string,
  pageNumber: number,
  token: string,
  searchKeyword?: string
): Promise<GetProductsResponse> {
  if (!token) throw new Error('Authentication token not found.');
  
  // Build URL with optional search keyword
  let url = `/api/product?brandId=${brandId}&pageNumber=${pageNumber}&pageSize=10&include=true`;
  if (searchKeyword && searchKeyword.trim()) {
    url += `&search=${encodeURIComponent(searchKeyword.trim())}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fetcher function for single product
 */
async function fetchProduct(
  productId: string,
  token: string
): Promise<GetProductResponse> {
  if (!token) throw new Error('Authentication token not found.');
  
  const response = await fetch(`/api/product/${productId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Hook to fetch products list with pagination, search, and caching
 * 
 * @param brandId - Brand ID to filter products
 * @param pageNumber - Current page number
 * @param searchKeyword - Optional search keyword for backend search
 * @returns Query result with products list
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useProducts(brandId, 1, "shirt");
 * const products = data?.data?.data || data?.products || [];
 * ```
 */
export function useProducts(brandId?: string, pageNumber: number = 1, searchKeyword?: string) {
  const { token, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, brandId, pageNumber, searchKeyword],
    queryFn: () => fetchProducts(brandId!, pageNumber, token!, searchKeyword),
    enabled: isAuthenticated && !!token && !!brandId,
    staleTime: 60 * 1000, // 1 minute - products change more frequently
    gcTime: 3 * 60 * 1000, // 3 minutes cache time
  });
}

/**
 * Hook to fetch single product with caching
 * 
 * @param productId - Product ID to fetch
 * @returns Query result with product data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useProduct(productId);
 * const product = data?.data;
 * ```
 */
export function useProduct(productId?: string) {
  const { token, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [...PRODUCT_DETAIL_QUERY_KEY, productId],
    queryFn: () => fetchProduct(productId!, token!),
    enabled: isAuthenticated && !!token && !!productId,
    staleTime: 30 * 1000, // 30 seconds - for edit forms
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
  });
}

/**
 * Hook to invalidate products cache
 * Note: For create/update, prefer using useCreateProduct/useUpdateProduct mutations
 * Use this for delete operations or manual cache invalidation
 * 
 * @example
 * ```tsx
 * const invalidateProducts = useInvalidateProducts();
 * await deleteProduct(id);
 * invalidateProducts(brandId);
 * ```
 */
export function useInvalidateProducts() {
  const queryClient = useQueryClient();
  
  return (brandId?: string) => {
    if (brandId) {
      // Invalidate specific brand's products
      queryClient.invalidateQueries({ 
        queryKey: [...PRODUCTS_QUERY_KEY, brandId] 
      });
    } else {
      // Invalidate all products
      queryClient.invalidateQueries({ 
        queryKey: PRODUCTS_QUERY_KEY 
      });
    }
    
    // Also invalidate product details
    queryClient.invalidateQueries({ 
      queryKey: PRODUCT_DETAIL_QUERY_KEY 
    });
  };
}

/**
 * Mutation hook to create a new product
 * Automatically handles toast notifications and cache updates
 * 
 * @example
 * ```tsx
 * const createProduct = useCreateProduct(brandId);
 * 
 * const handleSubmit = async (data) => {
 *   await createProduct.mutateAsync(data);
 *   router.push('/products');
 * };
 * ```
 */
export function useCreateProduct(brandId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: CreateProductDto) => {
      if (!token) throw new Error('Authentication token not found.');
      
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '상품 등록 실패');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // ✅ Update cache with new product
      if (data.success && data.data) {
        queryClient.setQueriesData(
          { queryKey: [...PRODUCTS_QUERY_KEY, brandId] },
          (oldData: GetProductsResponse | undefined) => {
            if (!oldData) return oldData;
            
            const currentProducts = Array.isArray(oldData.data?.data)
              ? oldData.data.data
              : Array.isArray(oldData.products)
              ? oldData.products
              : [];
            
            return {
              ...oldData,
              data: {
                data: [data.data, ...currentProducts]
              }
            };
          }
        );
      }
      
      // ✅ Show success toast
      toast.success("상품이 등록되었습니다!");
    },
    onError: (error: Error) => {
      // ✅ Show error toast
      toast.error(error.message || "등록 실패");
    }
  });
}

/**
 * Mutation hook to update an existing product
 * Automatically handles toast notifications and cache updates
 * 
 * @example
 * ```tsx
 * const updateProduct = useUpdateProduct(brandId, productId);
 * 
 * const handleSubmit = async (data) => {
 *   await updateProduct.mutateAsync(data);
 *   router.push('/products');
 * };
 * ```
 */
export function useUpdateProduct(brandId: string, productId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: UpdateProductDto) => {
      if (!token) throw new Error('Authentication token not found.');
      
      const response = await fetch(`/api/product/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '상품 수정 실패');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // ✅ Update product list cache
      if (data.success && data.data) {
        queryClient.setQueriesData(
          { queryKey: [...PRODUCTS_QUERY_KEY, brandId] },
          (oldData: GetProductsResponse | undefined) => {
            if (!oldData) return oldData;
            
            const currentProducts = Array.isArray(oldData.data?.data)
              ? oldData.data.data
              : Array.isArray(oldData.products)
              ? oldData.products
              : [];
            
            const updatedProducts = currentProducts.map(p => 
              p.id === productId ? data.data : p
            );
            
            return {
              ...oldData,
              data: {
                data: updatedProducts
              }
            };
          }
        );
        
        // ✅ Update product detail cache
        queryClient.setQueryData(
          [...PRODUCT_DETAIL_QUERY_KEY, productId],
          {
            success: true,
            data: data.data
          }
        );
      }
      
      // ✅ Show success toast
      toast.success("상품이 수정되었습니다!");
    },
    onError: (error: Error) => {
      // ✅ Show error toast
      toast.error(error.message || "수정 실패");
    }
  });
}

/**
 * Hook to fetch all products for public pages (no authentication required)
 * 
 * @param pageNumber - Current page number
 * @param pageSize - Number of products per page
 * @param searchKeyword - Optional search keyword
 * @returns Query result with products list
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePublicProducts(1, 12, "shirt");
 * const products = data?.data?.data || [];
 * ```
 */
/**
 * Options for usePublicProducts hook
 */
export interface UsePublicProductsOptions {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string;
  isActive?: boolean;
  brandId?: string;
  categoryId?: string;
  enabled?: boolean; // ✅ Add enabled option to disable hook
}

/**
 * Hook for fetching public products with various filters
 */
export function usePublicProducts(options: UsePublicProductsOptions = {}) {
  const {
    pageNumber = 1,
    pageSize = 12,
    searchKeyword,
    isActive = true,
    brandId,
    categoryId,
    enabled = true // ✅ Default enabled
  } = options;

  return useQuery({
    queryKey: ["publicProducts", pageNumber, pageSize, searchKeyword, isActive, brandId, categoryId],
    enabled, // ✅ Use enabled option
    queryFn: async (): Promise<GetProductsResponse> => {
      // Build URL with all query params
      const params = new URLSearchParams();
      params.append('page', pageNumber.toString());
      params.append('pageSize', pageSize.toString());
      
      if (searchKeyword && searchKeyword.trim()) {
        params.append('search', searchKeyword.trim());
      }
      if (isActive !== undefined) {
        params.append('isActive', isActive.toString());
      }
      if (brandId) {
        params.append('brandId', brandId);
      }
      if (categoryId) {
        params.append('categoryId', categoryId);
      }
      
      const response = await fetch(`/api/product?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
  });
}

