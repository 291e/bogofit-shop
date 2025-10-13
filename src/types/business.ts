export interface Business {
  id: string;
  userId: string;
  businessName: string;
  businessNumber?: string;
  businessType: BusinessType;
  description?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  isApproved: boolean;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  stores?: Store[];
  businessProducts?: BusinessProduct[];
  businessOrders?: BusinessOrder[];
}

export interface User {
  id: string;
  userId: string;
  email: string;
  name: string;
  profile?: string;
  phoneNumber?: string;
  isBusiness: boolean;
  isAdmin: boolean;
  brandId?: number;
  gradeId?: number;
  gender?: string;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BusinessType = "BRAND" | "RETAILER" | "MARKETPLACE" | "DISTRIBUTOR";

export interface Store {
  id: string;
  businessId: string;
  storeName: string;
  storeCode?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  businessProducts?: BusinessProduct[];
}

export interface BusinessProduct {
  id: string;
  businessId: string;
  storeId?: string;
  productId?: number;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  status: ProductStatus;
  stockQuantity: number;
  minOrderQuantity: number;
  imageUrl: string; // 메인 이미지 (단일)
  detailImage?: string; // 상세 이미지 (단일, 선택사항)
  thumbnailImages: string[]; // 썸네일 배열
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  store?: Store;
  businessOrderItems?: BusinessOrderItem[];
}

export type ProductStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface BusinessOrder {
  id: string;
  businessId: string;
  orderId?: string;
  businessOrderNumber: string;
  status: BusinessOrderStatus;
  totalAmount: number;
  commission: number;
  createdAt: Date;
  updatedAt: Date;
  business?: Business;
  items?: BusinessOrderItem[];
}

export type BusinessOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "REFUNDED";

export interface BusinessOrderItem {
  id: number;
  businessOrderId: string;
  businessProductId?: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  businessProduct?: BusinessProduct;
}

export interface BusinessStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
}

export interface BusinessCreateInput {
  businessName: string;
  businessNumber?: string;
  businessType: BusinessType;
  description?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface BusinessUpdateInput {
  businessName?: string;
  businessNumber?: string;
  businessType?: BusinessType;
  description?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ProductCreateInput {
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  stockQuantity: number;
  minOrderQuantity?: number;
  imageUrls: string[];
  tags?: string[];
  storeId?: string;
}

export interface ProductUpdateInput {
  title?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  stockQuantity?: number;
  minOrderQuantity?: number;
  imageUrls?: string[];
  tags?: string[];
  status?: ProductStatus;
  isActive?: boolean;
}
