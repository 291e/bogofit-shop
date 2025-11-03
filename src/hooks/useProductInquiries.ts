"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    CreateProductInquiryDto,
    UpdateProductInquiryDto,
    AnswerProductInquiryDto,
    ProductInquiryQueryParams,
    ProductInquiriesResponse,
    SingleProductInquiryResponse,
    CreateProductInquiryResponse
} from "@/types/productInquiry";
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";

// Query key constants
export const PRODUCT_INQUIRIES_QUERY_KEY = ["product-inquiries"];

/**
 * Hook for fetching product inquiries
 * Automatically includes auth token if available (for brand owners to see secret inquiries)
 */
export function useProductInquiries(productId: string, params: ProductInquiryQueryParams = {}) {
    const {
        page = 1,
        pageSize = 10,
        status
    } = params;
    
    const { getToken } = useAuth();

    return useQuery({
        queryKey: [...PRODUCT_INQUIRIES_QUERY_KEY, "product", productId, page, pageSize, status],
        queryFn: async (): Promise<ProductInquiriesResponse> => {
            const searchParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            if (status) {
                searchParams.set('status', status);
            }

            // Get token if available (for brand owners to see all inquiries including secret ones)
            const token = getToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/product/${productId}/inquiries?${searchParams}`, {
                headers
            });

            if (!response.ok) {
                throw new Error('Failed to fetch product inquiries');
            }

            return response.json();
        },
        enabled: !!productId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for fetching single inquiry
 */
export function useProductInquiry(inquiryId: string) {
    return useQuery({
        queryKey: [...PRODUCT_INQUIRIES_QUERY_KEY, inquiryId],
        queryFn: async (): Promise<SingleProductInquiryResponse> => {
            const response = await fetch(`/api/ProductInquiry/${inquiryId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch inquiry');
            }

            return response.json();
        },
        enabled: !!inquiryId,
    });
}

/**
 * Hook for creating a product inquiry
 */
export function useCreateProductInquiry() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateProductInquiryDto): Promise<CreateProductInquiryResponse> => {
            const token = getToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch('/api/ProductInquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create inquiry');
            }

            return result;
        },
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: [...PRODUCT_INQUIRIES_QUERY_KEY, "product", variables.productId]
            });

            toast.success('문의가 성공적으로 등록되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message || '문의 등록에 실패했습니다');
        }
    });
}

/**
 * Hook for updating a product inquiry
 */
export function useUpdateProductInquiry() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            inquiryId,
            data
        }: {
            inquiryId: string;
            data: UpdateProductInquiryDto
        }): Promise<SingleProductInquiryResponse> => {
            const token = getToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`/api/ProductInquiry/${inquiryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update inquiry');
            }

            return result;
        },
        onSuccess: (data) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: [...PRODUCT_INQUIRIES_QUERY_KEY, data.inquiry?.id]
            });
            queryClient.invalidateQueries({
                queryKey: [...PRODUCT_INQUIRIES_QUERY_KEY, "product", data.inquiry?.productId]
            });

            toast.success('문의가 성공적으로 수정되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message || '문의 수정에 실패했습니다');
        }
    });
}

/**
 * Hook for deleting a product inquiry
 */
export function useDeleteProductInquiry() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (inquiryId: string): Promise<{ success: boolean; message: string }> => {
            const token = getToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`/api/ProductInquiry/${inquiryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete inquiry');
            }

            return result;
        },
        onSuccess: (data, inquiryId) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: [...PRODUCT_INQUIRIES_QUERY_KEY, inquiryId]
            });
            queryClient.invalidateQueries({
                queryKey: [...PRODUCT_INQUIRIES_QUERY_KEY, "product"]
            });

            toast.success('문의가 성공적으로 삭제되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message || '문의 삭제에 실패했습니다');
        }
    });
}

/**
 * Hook for answering a product inquiry (Brand Owner/Admin only)
 */
export function useAnswerProductInquiry() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            inquiryId,
            data
        }: {
            inquiryId: string;
            data: AnswerProductInquiryDto
        }): Promise<SingleProductInquiryResponse> => {
            const token = getToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`/api/ProductInquiry/${inquiryId}/answer`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to answer inquiry');
            }

            return result;
        },
        onSuccess: (data) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: [...PRODUCT_INQUIRIES_QUERY_KEY, data.inquiry?.id]
            });
            queryClient.invalidateQueries({
                queryKey: [...PRODUCT_INQUIRIES_QUERY_KEY, "product", data.inquiry?.productId]
            });

            toast.success('답변이 성공적으로 등록되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message || '답변 등록에 실패했습니다');
        }
    });
}

