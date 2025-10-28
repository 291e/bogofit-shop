export type PromotionType = 'percentage' | 'fixed_amount' | 'free_shipping';

export type PromotionStatus = 'pending' | 'approved' | 'rejected' | 'banned';

// Bulk assign promotion request
export interface BulkAssignPromotionRequest {
    productIds: string[];
    promotionId: string | null; // null = remove promotion
}

export interface Promotion {
    id: string;
    brandId: string;
    brandName?: string;
    name: string;
    description?: string;
    type: PromotionType;
    value?: number;
    startDate: string;
    endDate: string;
    status: PromotionStatus;
    isActive: boolean;
    adminNote?: string;
    reviewedBy?: string;
    reviewerName?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
    productCount?: number;
}

export interface CreatePromotionRequest {
    name: string;
    description?: string;
    type: PromotionType;
    value?: number;
    startDate: string;
    endDate: string;
}

export interface UpdatePromotionRequest {
    name?: string;
    description?: string;
    value?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}

export interface PromotionFilters {
    status?: PromotionStatus;
    type?: PromotionType;
    isActive?: boolean;  // Keep for frontend compatibility
    onlyActive?: boolean;  // ✅ Backend uses this
}

export interface PromotionListResponse {
    message: string;
    items: Promotion[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface PromotionStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    banned: number;
    active: number;
}

// Validation schemas
export const PROMOTION_TYPES: PromotionType[] = ['percentage', 'fixed_amount', 'free_shipping'];
export const PROMOTION_STATUSES: PromotionStatus[] = ['pending', 'approved', 'rejected', 'banned'];

// Business rules
export const PROMOTION_RULES = {
    MAX_NAME_LENGTH: 255,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_ADMIN_NOTE_LENGTH: 500,
    MIN_PERCENTAGE: 0,
    MAX_PERCENTAGE: 100,
    MIN_FIXED_AMOUNT: 0,
    MAX_FIXED_AMOUNT: 10000000, // 10M VND
    MIN_ORDER_AMOUNT: 0,
    MAX_ORDER_AMOUNT: 10000000, // 10M VND
} as const;
