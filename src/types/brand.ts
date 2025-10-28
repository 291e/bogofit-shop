// Brand Status Types
export type BrandStatus = "pending" | "approved" | "rejected" | "banned";

// Payment Mode Types
export type PaymentMode = "platform" | "business";

// Brand Response DTO
export interface BrandResponseDto {
  id: string;
  name: string;
  slug: string;
  status: BrandStatus;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  paymentMode: PaymentMode;
  createdAt: string;
  updatedAt: string;
}


// Create Brand DTO
export interface CreateBrandDto {
  applicationId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  paymentMode: "platform" | "business";
}


// API Response Types
export interface CreateBrandResponse {
  success: boolean;
  message: string;
  brand?: BrandResponseDto;
}

export interface GetBrandsResponse {
  success: boolean;
  message: string;
  brands: BrandResponseDto[];
  count: number;  // NEW: Total count of brands
}

export interface GetBrandResponse {
  success: boolean;
  message: string;
  brand?: BrandResponseDto;
}

// Backend API Response Types
export interface BackendBrandResponse {
  success: boolean;
  message: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
    status: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    websiteUrl?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface BackendBrandsResponse {
  success: boolean;
  message: string;
  brands?: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    websiteUrl?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  count?: number;
}

