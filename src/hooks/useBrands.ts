"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BrandResponseDto, CreateBrandDto, GetBrandsResponse } from "@/types/brand";
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";

// Query key constants
export const BRANDS_QUERY_KEY = ["brands"];

/**
 * Fetcher function for brands
 */
async function fetchBrands(applicationId?: string, token?: string): Promise<GetBrandsResponse> {
  if (!token) throw new Error('Authentication token not found.');
  
  const url = applicationId 
    ? `/api/brand?applicationId=${applicationId}`
    : "/api/brand";

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch brands');
  }
  
  return response.json();
}

/**
 * Hook to fetch brands
 */
export function useBrands(applicationId?: string) {
  const { token, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [...BRANDS_QUERY_KEY],
    queryFn: () => fetchBrands(applicationId, token!),
    enabled: isAuthenticated && !!token && !!applicationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to create brand
 */
export function useCreateBrand() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  
  return useMutation({
    mutationFn: async (data: CreateBrandDto) => {
      if (!token) throw new Error('Authentication token not found.');
      
      const response = await fetch('/api/brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create brand');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // ✅ Optimistic update: Add new brand to cache
      queryClient.setQueryData(BRANDS_QUERY_KEY, (oldData: GetBrandsResponse | undefined) => {
        if (!oldData) return oldData;
        
        const newBrand = {
          id: data.brand?.id || `temp-${Date.now()}`,
          ...variables,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return {
          ...oldData,
          brands: [...oldData.brands, newBrand]
        };
      });
      
      toast.success("브랜드가 성공적으로 생성되었습니다!");
    },
    onError: (error: Error) => {
      toast.error("브랜드 생성 실패", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update brand
 */
export function useUpdateBrand() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BrandResponseDto> }) => {
      if (!token) throw new Error('Authentication token not found.');
      
      const response = await fetch(`/api/brand/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update brand');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // ✅ Invalidate brands query
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      toast.success("브랜드가 성공적으로 수정되었습니다!");
    },
    onError: (error: Error) => {
      toast.error("브랜드 수정 실패", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete brand
 */
export function useDeleteBrand() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Authentication token not found.');
      
      const response = await fetch(`/api/brand/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete brand');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // ✅ Invalidate brands query
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      toast.success("브랜드가 성공적으로 삭제되었습니다!");
    },
    onError: (error: Error) => {
      toast.error("브랜드 삭제 실패", {
        description: error.message,
      });
    },
  });
}

/**
 * Fetcher function for public brands (no auth required)
 */
async function fetchPublicBrands(): Promise<GetBrandsResponse> {
  const response = await fetch('/api/brand', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch brands');
  }
  
  return response.json();
}

/**
 * Hook to fetch public brands (no authentication required)
 * 
 * @returns Query result with public brands data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePublicBrands();
 * const brands = data?.brands || [];
 * ```
 */
export function usePublicBrands() {
  return useQuery({
    queryKey: [...BRANDS_QUERY_KEY, 'public'],
    queryFn: fetchPublicBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes - brands don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });
}
