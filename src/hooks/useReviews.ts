"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    CreateReviewDto,
    UpdateReviewDto,
    ReviewQueryParams,
    ProductReviewsResponse,
    ReviewStatsResponse,
    SingleReviewResponse,
    UserReviewsResponse
} from "@/types/review";
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";

// Query key constants
export const REVIEWS_QUERY_KEY = ["reviews"];
export const REVIEW_STATS_QUERY_KEY = ["review-stats"];

/**
 * Hook for fetching product reviews
 */
export function useProductReviews(productId: string, params: ReviewQueryParams = {}) {
    const {
        page = 1,
        pageSize = 10,
        rating,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = params;

    return useQuery({
        queryKey: [...REVIEWS_QUERY_KEY, "product", productId, page, pageSize, rating, sortBy, sortOrder],
        queryFn: async (): Promise<ProductReviewsResponse> => {
            const searchParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                sortBy,
                sortOrder
            });

            if (rating) {
                searchParams.set('rating', rating.toString());
            }

            const response = await fetch(`/api/review/product/${productId}?${searchParams}`);

            if (!response.ok) {
                throw new Error('Failed to fetch product reviews');
            }

            return response.json();
        },
        enabled: !!productId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for fetching product review stats
 */
export function useProductReviewStats(productId: string) {
    return useQuery({
        queryKey: [...REVIEW_STATS_QUERY_KEY, productId],
        queryFn: async (): Promise<ReviewStatsResponse> => {
            const response = await fetch(`/api/review/product/${productId}/stats`);

            if (!response.ok) {
                throw new Error('Failed to fetch review stats');
            }

            return response.json();
        },
        enabled: !!productId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook for fetching single review
 */
export function useReview(reviewId: string) {
    return useQuery({
        queryKey: [...REVIEWS_QUERY_KEY, reviewId],
        queryFn: async (): Promise<SingleReviewResponse> => {
            const response = await fetch(`/api/review/${reviewId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch review');
            }

            return response.json();
        },
        enabled: !!reviewId,
    });
}

/**
 * Hook for fetching user's reviews
 */
export function useUserReviews(params: ReviewQueryParams = {}) {
    const { getToken } = useAuth();
    const {
        page = 1,
        pageSize = 10,
        rating,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = params;

    return useQuery({
        queryKey: [...REVIEWS_QUERY_KEY, "user", page, pageSize, rating, sortBy, sortOrder],
        queryFn: async (): Promise<UserReviewsResponse> => {
            const token = getToken();
            if (!token) throw new Error('Authentication required');

            const searchParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                sortBy,
                sortOrder
            });

            if (rating) {
                searchParams.set('rating', rating.toString());
            }

            const response = await fetch(`/api/review?${searchParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user reviews');
            }

            return response.json();
        },
        enabled: !!getToken(),
    });
}

/**
 * Hook for creating a review
 */
export function useCreateReview() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateReviewDto): Promise<SingleReviewResponse> => {
            const token = getToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch('/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create review');
            }

            return result;
        },
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: [...REVIEWS_QUERY_KEY, "product", variables.productId]
            });
            queryClient.invalidateQueries({
                queryKey: [...REVIEW_STATS_QUERY_KEY, variables.productId]
            });
            queryClient.invalidateQueries({
                queryKey: [...REVIEWS_QUERY_KEY, "user"]
            });

            toast.success('리뷰가 성공적으로 작성되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message || '리뷰 작성에 실패했습니다');
        }
    });
}

/**
 * Hook for updating a review
 */
export function useUpdateReview() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            reviewId,
            data
        }: {
            reviewId: string;
            data: UpdateReviewDto
        }): Promise<SingleReviewResponse> => {
            const token = getToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`/api/review/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update review');
            }

            return result;
        },
        onSuccess: (data) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: [...REVIEWS_QUERY_KEY, data.review?.id]
            });
            queryClient.invalidateQueries({
                queryKey: [...REVIEWS_QUERY_KEY, "product", data.review?.productId]
            });
            queryClient.invalidateQueries({
                queryKey: [...REVIEW_STATS_QUERY_KEY, data.review?.productId]
            });
            queryClient.invalidateQueries({
                queryKey: [...REVIEWS_QUERY_KEY, "user"]
            });

            toast.success('리뷰가 성공적으로 수정되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message || '리뷰 수정에 실패했습니다');
        }
    });
}

/**
 * Hook for deleting a review
 */
export function useDeleteReview() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reviewId: string): Promise<{ success: boolean; message: string }> => {
            const token = getToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`/api/review/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete review');
            }

            return result;
        },
        onSuccess: (data, reviewId) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: [...REVIEWS_QUERY_KEY, reviewId]
            });
            queryClient.invalidateQueries({
                queryKey: [...REVIEWS_QUERY_KEY, "product"]
            });
            queryClient.invalidateQueries({
                queryKey: [...REVIEW_STATS_QUERY_KEY]
            });
            queryClient.invalidateQueries({
                queryKey: [...REVIEWS_QUERY_KEY, "user"]
            });

            toast.success('리뷰가 성공적으로 삭제되었습니다');
        },
        onError: (error: Error) => {
            toast.error(error.message || '리뷰 삭제에 실패했습니다');
        }
    });
}
