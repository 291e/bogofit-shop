// Order Types - Backend Integration

// ==================== ORDER STATUS ====================

export type OrderStatus =
  | "pending"          // 1️⃣ Chờ thanh toán
  | "confirmed"        // 2️⃣ Đã thanh toán (was 'paid')
  | "processing"       // 3️⃣ Đang xử lý (was 'fulfilling' + 'fulfilled')
  | "completed"        // 4️⃣ Hoàn tất
  | "canceled";        // 5️⃣ Đã hủy (check Payment.status for details)

// ==================== ORDER ADDRESS (for CreateOrderFromCartDto) ====================

export interface CreateOrderAddressDto {
  type?: "shipping" | "billing";
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  countryCode?: string;
  memo?: string;
}

// ==================== ORDER ITEM ====================

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productVariantId?: string;
  brandId: string;
  productTitle: string;
  variantTitle?: string;
  sku?: string;
  barcode?: string;
  optionsJson: Record<string, string>[];
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  rowTotal: number;
  createdAt: string;
  updatedAt: string;
  brandSlug?: string; // Brand slug for URL navigation
  productSlug?: string; // Product slug for URL navigation
  review?: {
    id: string;
    rating: number;
    title?: string;
    content?: string;
    images: string[];
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null; // Review information from Order API
}

// ==================== ORDER ====================

export interface Order {
  id: string;
  groupId: string;              // REQUIRED - every order has a group
  brandId: string;
  userId?: string;
  orderNo: string;              // BOGOFIT-xxx
  status: OrderStatus;
  placedAt?: string;            // Deprecated - use group.placedAt
  paidAt?: string;              // Deprecated - use group.paidAt
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;

  // Shipping info (from OrderGroup - for seller API)
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;

  // Nested data
  brand?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  items: OrderItem[];
  payments?: Payment[];
}

// ==================== ORDER GROUP ====================

export interface OrderGroup {
  id: string;
  userId: string;
  groupNo: string;              // GROUP-xxx
  status: OrderStatus;

  // Amounts (sum of all orders)
  totalAmount: number;          // Sum of items
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;          // totalAmount - discount + shipping

  // Shipping address (snapshot)
  notes?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;

  // Timestamps
  placedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;

  // Nested data
  orders: Order[];
  payments?: Payment[];
}

// ==================== PAYMENT (Reference) ====================

export interface Payment {
  id: string;
  orderId?: string;
  orderGroupId?: string;
  userId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== DTOs ====================

export interface CreateOrderFromCartDto {
  shippingAddress: CreateOrderAddressDto;
  billingAddress?: CreateOrderAddressDto;
  discountTotal?: number;
  shippingTotal?: number;
  taxTotal?: number;
}

// ==================== API RESPONSES ====================

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data?: Order;
}

export interface GetOrderResponse {
  success: boolean;
  message: string;
  data?: Order;
}

export interface GetOrdersResponse {
  success: boolean;
  message: string;
  data: {
    groups: OrderGroup[];      // MoR: Groups with multiple orders (2+ brands)
    singles: OrderGroup[];     // SoR: Groups with single order (1 brand)
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalGroups: number;
    totalSingles: number;
  };
}

export interface GetOrderGroupResponse {
  success: boolean;
  message: string;
  data?: OrderGroup;
}

// ==================== HELPERS ====================

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "결제 대기",      // 1️⃣ Chờ thanh toán
  confirmed: "결제 완료",    // 2️⃣ Đã thanh toán
  processing: "배송 준비 중", // 3️⃣ Đang xử lý
  completed: "배송 완료",    // 4️⃣ Hoàn tất
  canceled: "취소됨",        // 5️⃣ Đã hủy
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",    // 1️⃣ Chờ thanh toán
  confirmed: "bg-green-100 text-green-800",    // 2️⃣ Đã thanh toán
  processing: "bg-blue-100 text-blue-800",     // 3️⃣ Đang xử lý
  completed: "bg-gray-100 text-gray-800",      // 4️⃣ Hoàn tất
  canceled: "bg-red-100 text-red-800",         // 5️⃣ Đã hủy
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Parse variant options from OrderItem optionsJson
 * Converts array format to object: [{"color": "Red"}, {"size": "M"}] => {color: "Red", size: "M"}
 */
export const parseOrderItemOptions = (
  optionsJson?: Record<string, string>[]
): Record<string, string> => {
  if (!optionsJson || optionsJson.length === 0) return {};

  try {
    if (Array.isArray(optionsJson)) {
      // Convert array of objects to single object
      return optionsJson.reduce((acc, obj) => ({ ...acc, ...obj }), {});
    }
    return optionsJson as unknown as Record<string, string>;
  } catch {
    return {};
  }
};

/**
 * Format variant options for display
 * Example: [{"color": "28 다크오렌지 473496"}, {"size": "XS"}] => "색상: 28 다크오렌지, 사이즈: XS"
 */
export const formatOrderItemOptions = (
  optionsJson?: Record<string, string>[]
): string => {
  const options = parseOrderItemOptions(optionsJson);

  // Korean option name mapping
  const optionNameMap: Record<string, string> = {
    color: "색상",
    colour: "색상",
    size: "사이즈",
    style: "스타일",
    material: "소재",
    type: "타입",
    model: "모델",
  };

  return Object.entries(options)
    .map(([key, value]) => {
      const koreanKey = optionNameMap[key.toLowerCase()] || key;
      // Remove product codes and [품절] tags from display
      const cleanValue = value
        .replace(/\s+\d{6}$/g, '') // Remove 6-digit codes at end
        .replace(/\s*\[품절\]$/g, '') // Remove [품절] tag
        .trim();
      return `${koreanKey}: ${cleanValue}`;
    })
    .join(", ");
};

