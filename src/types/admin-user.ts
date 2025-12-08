// Admin User Management Types
export interface User {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    isAdmin: boolean;
    isActive: boolean;
    isBusiness?: boolean;
    brandName?: string | null;
    applicationStatus?: 'approved' | 'pending' | null;
    createdAt: string;
    updatedAt?: string;
    reviewCount?: number;
    inquiryCount?: number;
}

export interface UserListItemDto {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    isAdmin: boolean;
    isActive: boolean;
    isBusiness?: boolean;
    brandName?: string | null;
    applicationStatus?: 'approved' | 'pending' | null;
    createdAt: string;
}

export interface UserDetailDto extends UserListItemDto {
    updatedAt?: string;
    reviewCount: number;
    inquiryCount: number;
}

export interface UserQueryDto {
    page?: number;
    pageSize?: number;
    search?: string;
    isAdmin?: boolean;
    isActive?: boolean;
    isBusiness?: boolean;
    applicationStatus?: 'approved' | 'pending';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface AdminUpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    isAdmin?: boolean;
    isActive?: boolean;
}

export interface UsersResponse {
    success: boolean;
    data: {
        users: UserListItemDto[];
        pagination: {
            currentPage: number;
            pageSize: number;
            totalCount: number;
            totalPages: number;
        };
    };
}

export interface UserResponse {
    success: boolean;
    data: UserDetailDto;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
    errorType?: string;
}
