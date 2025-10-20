"use client";

import { useQuery } from "@tanstack/react-query";
import { CategoryTreeDto } from "@/types/category";
import { useAuth } from "@/providers/authProvider";

// Query key constants
export const CATEGORIES_QUERY_KEY = ["categories"];

/**
 * Response type for categories
 */
interface GetCategoriesResponse {
  success: boolean;
  data: CategoryTreeDto[];
  message?: string;
}

/**
 * Fetcher function for categories
 */
async function fetchCategories(token?: string): Promise<GetCategoriesResponse> {
  if (!token) throw new Error('Authentication token not found.');
  
  const response = await fetch('/api/category?isTree=true', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch categories');
  }
  
  return response.json();
}

/**
 * Hook to fetch categories with React Query caching
 * 
 * @returns Query result with categories data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCategories();
 * const categories = data?.data || [];
 * ```
 */
/**
 * Fetcher function for public categories (no auth required)
 */
async function fetchPublicCategories(): Promise<GetCategoriesResponse> {
  const response = await fetch('/api/category?isTree=true', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch categories');
  }
  
  return response.json();
}

export function useCategories() {
  const { token, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => fetchCategories(token || undefined),
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
  });
}

/**
 * Hook to fetch public categories (no authentication required)
 * 
 * @returns Query result with public categories data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePublicCategories();
 * const categories = data?.data || [];
 * ```
 */
export function usePublicCategories() {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, 'public'],
    queryFn: fetchPublicCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });
}

