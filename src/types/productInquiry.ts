// Product Inquiry Types
export interface ProductInquiry {
    id: string;
    productId: string;
    userId: string;
    question: string;
    answer: string | null;
    answeredBy: string | null;
    answeredAt: string | null;
    isSecret: boolean;
    status: 'pending' | 'answered' | 'hidden';
    createdAt: string;
    updatedAt: string;
    user: UserInfo;
    answeredByUser: UserInfo | null;
}

export interface UserInfo {
    id: string;
    userId: string;
    name: string;
    email: string;
}

// DTOs
export interface CreateProductInquiryDto {
    productId: string;
    question: string; // 10-2000 chars
    isSecret?: boolean; // default: false
}

export interface UpdateProductInquiryDto {
    question?: string; // 10-2000 chars
    isSecret?: boolean;
}

export interface AnswerProductInquiryDto {
    answer: string; // 10-2000 chars
}

// Query Parameters
export interface ProductInquiryQueryParams {
    page?: number;
    pageSize?: number;
    status?: 'pending' | 'answered' | 'hidden';
}

// API Response Types
export interface ProductInquiriesResponse {
    success: boolean;
    message: string;
    inquiries: ProductInquiry[];
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface SingleProductInquiryResponse {
    success: boolean;
    message: string;
    inquiry: ProductInquiry;
}

export interface CreateProductInquiryResponse {
    success: boolean;
    message: string;
    inquiry: ProductInquiry;
}

