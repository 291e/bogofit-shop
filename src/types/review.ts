// Review Types
export interface Review {
    id: string;
    productId: string;
    userId: string;
    rating: number; // 1-5
    title?: string;
    content?: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
    user: UserInfo;
}

export interface UserInfo {
    id: string;
    userId: string;
    name: string;
    email: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>; // {5: 10, 4: 8, ...}
}

export interface PagedResult<T> {
    data: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// DTOs
export interface CreateReviewDto {
    productId: string;
    orderId: string; // REQUIRED: Verify specific order purchase
    rating: number;
    title?: string;
    content?: string;
    images?: string[];
}

export interface UpdateReviewDto {
    rating?: number;
    title?: string;
    content?: string;
    images?: string[];
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    review?: T;
    reviews?: T;
    stats?: T;
    product?: T;
}

export type ReviewResponse = Review;

export interface ProductWithReviews {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
    finalPrice?: number;
    promotion?: {
        id: string;
        name: string;
        description?: string;
        type: string;
        value: number;
        startDate: string;
        endDate: string;
    };
    reviewStats?: ReviewStats;
    variants?: Array<{
        id: string;
        name: string;
        price: number;
        finalPrice?: number;
        quantity: number;
    }>;
}

// Query Parameters
export interface ReviewQueryParams {
    page?: number;
    pageSize?: number;
    rating?: number;
    sortBy?: 'createdAt' | 'rating';
    sortOrder?: 'asc' | 'desc';
}

export interface ProductReviewsResponse {
    success: boolean;
    message: string;
    reviews: Review[];
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface ReviewStatsResponse {
    success: boolean;
    message: string;
    stats: ReviewStats;
}

export interface SingleReviewResponse {
    success: boolean;
    message: string;
    review: Review;
}

export interface UserReviewsResponse {
    success: boolean;
    message: string;
    reviews: Review[];
}
