export interface ProductVariant {
  id: number;
  optionName: string;
  optionValue: string;
  priceDiff: number;
  stock: number;
}

export interface ProductReview {
  id: number;
  productId: number;
  rating: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user: {
    userId: string;
    name: string;
  };
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export type ShippingType = "DOMESTIC" | "OVERSEAS";

export interface Product {
  id: number;
  brandId?: number;
  brand?: Brand;
  title: string;
  slug: string;
  description?: string;
  detailDescription?: string;
  price: number;
  url: string;
  category: string;
  subCategory?: string; // 서브카테고리 필드 추가
  imageUrl: string;
  badge?: string;
  storeName?: string; // 호환성을 위해 유지 (brand.name으로 설정됨)
  isActive: boolean;
  detailImage?: string;
  thumbnailImages?: string[];
  status?: "PENDING" | "APPROVED" | "REJECTED" | "DRAFT";
  shippingType?: ShippingType; // 배송 타입 (국내/해외)
  totalSales?: number;
  totalSold?: number;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  avgRating?: number;
  reviewCount?: number;
  isSoldOut?: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "price_low" | "price_high" | "name" | "rating";
  showSoldOut?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  filters: ProductFilters;
}
