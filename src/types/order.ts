// Order Types - Backend Integration

// ==================== ORDER STATUS ====================

export type OrderStatus =
  | "pending"          // Order created, awaiting payment
  | "paid"             // Payment completed
  | "fulfilling"       // Being processed/shipped
  | "fulfilled"        // Delivered
  | "completed"        // Confirmed by customer
  | "canceled"         // Canceled
  | "payment_failed"   // Payment failed
  | "refunded";        // Refunded

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
  pending: "결제 대기",
  paid: "결제 완료",
  fulfilling: "배송 준비 중",
  fulfilled: "배송 완료",
  completed: "구매 확정",
  canceled: "취소됨",
  payment_failed: "결제 실패",
  refunded: "환불됨",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  fulfilling: "bg-blue-100 text-blue-800",
  fulfilled: "bg-purple-100 text-purple-800",
  completed: "bg-gray-100 text-gray-800",
  canceled: "bg-red-100 text-red-800",
  payment_failed: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
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

