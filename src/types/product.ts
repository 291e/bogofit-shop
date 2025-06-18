export interface ProductVariant {
  id: number;
  optionName: string;
  optionValue: string;
  priceDiff: number;
  stock: number;
}

export interface ProductReview {
  id: number;
  rating: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user: {
    userId: string;
    name: string;
  };
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description?: string;
  price: number;
  url: string;
  category: string;
  imageUrl: string;
  storeName: string;
  isActive: boolean;
  detailImage?: string;
  thumbnailImages?: string[];
  badge?: string;
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
