// Frontend TypeScript Types - Phù hợp với Backend đã dọn dẹp

// ==================== COMMON TYPES ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
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

// ==================== NEW API FORMAT (v2.0) ====================

// NEW: Pagination info separate from data
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// NEW: Product list response (flat structure)
export interface GetProductsResponse {
  success: boolean;
  message: string;
  products: ProductResponseDto[];
  pagination: PaginationInfo;
}

// NEW: Single product response
export interface GetProductResponse {
  success: boolean;
  message: string;
  product: ProductResponseDto;
}

// ==================== PRODUCT TYPES ====================

// ✅ Create Product DTO
export interface CreateProductDto {
  brandId: string;
  name: string;
  slug: string;
  sku?: string;
  status?: string;
  description?: string;
  categoryId?: string;
  thumbUrl?: string;
  images?: string[];
  basePrice: number;
  baseCompareAtPrice?: number;
  quantity?: number | null; // v2.0: product-level inventory (null = unlimited)
  hasOptions?: boolean; // ✅ v2.1: Whether product has variants
  variants: CreateProductVariantDto[];
}

// ✅ Update Product DTO với variant operations
export interface UpdateProductDto {
  name?: string;
  slug?: string;
  sku?: string;
  isActive?: boolean;  // ✅ Business user có thể set active/inactive
  // status?: string;  // ❌ Removed - chỉ admin mới set status (PENDING, APPROVED, REJECTED)
  description?: string;
  categoryId?: string;
  thumbUrl?: string;
  images?: string[];
  basePrice?: number;
  baseCompareAtPrice?: number;
  quantity?: number | null; // v2.0: product-level inventory (null = unlimited)
  promotionId?: string | null; // ✅ v2.2: Assign/remove promotion (use "00000000-0000-0000-0000-000000000000" to remove)

  // Variant operations
  newVariants?: CreateProductVariantDto[];
  updateVariants?: UpdateProductVariantDto[];
  deleteVariants?: string[]; // Array of variant IDs
}

// ✅ Product Response DTO
export interface ProductResponseDto {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  sku: string;
  status: string;  // Admin approval status (PENDING, APPROVED, REJECTED) - READ ONLY
  isActive?: boolean;  // Business user control - CAN UPDATE
  description?: string;
  categoryId?: string;
  thumbUrl?: string;
  images?: string[];
  basePrice: number;
  baseCompareAtPrice?: number;
  finalPrice?: number | null;        // ✅ v2.3: Auto-calculated from promotion (computed on-the-fly)
  promotionId?: string | null;        // ✅ v2.2: Active promotion ID
  promotion?: {                        // ✅ v2.2: Promotion details (if include=true)
    id: string;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value?: number;
    startDate: string;
    endDate: string;
    status: string;
    isActive: boolean;
  };
  quantity?: number | null; // v2.0
  createdAt: string;
  updatedAt: string;
  brand: BrandInfoDto;
  variants?: ProductVariantResponseDto[];
}

// ✅ Brand Info DTO
export interface BrandInfoDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl?: string;
}

// ==================== PRODUCT VARIANT TYPES ====================

// ✅ Create Product Variant DTO
export interface CreateProductVariantDto {
  price?: number;
  compareAtPrice?: number;
  quantity: number;
  weightGrams?: number;
  status: 'active' | 'paused' | 'archived';
  optionsJson?: string; // JSON string: '[{"size": "M", "color": "Red"}]' - Optional for products without options
}

// ✅ Update Product Variant DTO
export interface UpdateProductVariantDto {
  id: string; // Required for update
  price?: number;
  compareAtPrice?: number;
  quantity?: number;
  weightGrams?: number;
  status?: 'active' | 'paused' | 'archived';
  optionsJson?: string; // JSON string - Optional for products without options
}

// ✅ Product Variant Response DTO
export interface ProductVariantResponseDto {
  id: string;
  productId: string;
  price?: number;
  compareAtPrice?: number;
  finalPrice?: number | null;  // ✅ Auto-calculated from promotion (computed on-the-fly)
  quantity: number;
  weightGrams?: number;
  status: string;
  optionsJson?: string; // JSON string từ backend - Optional for products without options
  createdAt: string;
  updatedAt: string;
  product?: ProductInfoDto;
}

// ✅ Product Info DTO (for variant responses)
export interface ProductInfoDto {
  id: string;
  name: string;
  slug: string;
  status: string;
}

// ==================== FRONTEND FORM TYPES ====================

// ✅ Frontend Form Types (dễ sử dụng hơn)
export interface VariantOption {
  key: string;
  value: string;
}

export interface ProductVariantForm {
  price?: number;
  compareAtPrice?: number;
  quantity: number;
  weightGrams?: number;
  status: 'active' | 'paused' | 'archived';
  options: VariantOption[]; // Object array cho form - Can be empty for products without options
}

export interface ProductForm {
  brandId: string;
  name: string;
  slug: string;
  sku?: string;
  isActive?: boolean;  // ✅ Business user control (true/false)
  // status is READ ONLY - admin controls it (PENDING, APPROVED, REJECTED)
  description?: string;
  categoryId?: string;
  thumbUrl?: string;
  images?: string[];
  basePrice: number;
  baseCompareAtPrice?: number;
  quantity?: number | null; // v2.0
  promotionId?: string | null; // ✅ v2.2: Promotion assignment
  variants: ProductVariantForm[]; // Can be empty for products without options
  hasOptions: boolean; // New field to indicate if product has options
}

// ==================== API QUERY TYPES ====================

// ✅ Product Query Parameters
export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  status?: string;
  include?: boolean;
  sortBy?: 'name' | 'price' | 'status' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ==================== UTILITY FUNCTIONS ====================

// ✅ Convert form data to API data
export const convertVariantFormToDto = (variant: ProductVariantForm): CreateProductVariantDto => ({
  price: variant.price,
  compareAtPrice: variant.compareAtPrice,
  quantity: variant.quantity,
  weightGrams: variant.weightGrams,
  status: variant.status,
  optionsJson: variant.options.length > 0 ? JSON.stringify(variant.options.map(opt => ({ [opt.key]: opt.value }))) : undefined // Only include if has options
});

export const convertProductFormToDto = (product: ProductForm): CreateProductDto => ({
  brandId: product.brandId,
  name: product.name,
  slug: product.slug,
  sku: product.sku,
  description: product.description,
  categoryId: product.categoryId,
  thumbUrl: product.thumbUrl,
  images: product.images,
  basePrice: product.basePrice,
  baseCompareAtPrice: product.baseCompareAtPrice,
  quantity: product.quantity ?? null,
  hasOptions: product.hasOptions, // ✅ v2.1: Include hasOptions flag
  variants: product.variants.map(convertVariantFormToDto)
});

// ✅ Convert API response to form data
export const convertVariantResponseToForm = (variant: ProductVariantResponseDto): ProductVariantForm => ({
  price: variant.price,
  compareAtPrice: variant.compareAtPrice,
  quantity: variant.quantity,
  weightGrams: variant.weightGrams,
  status: variant.status as 'active' | 'paused' | 'archived',
  options: variant.optionsJson ? parseOptionsFromJson(variant.optionsJson) : [] // Parse from JSON string or empty array
});

export const parseOptionsFromJson = (optionsJson: string): VariantOption[] => {
  try {
    const parsed = JSON.parse(optionsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing options JSON:', error);
    return [];
  }
};




