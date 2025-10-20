// Cart Module Types - Frontend TypeScript

// ==================== CART TYPES ====================

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  totalItems: number;      // Calculated: Sum of quantities
  totalPrice: number;      // Calculated: Sum of (price * quantity)
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  priceSnapshot: number;   // Price at time of adding
  createdAt: string;
  updatedAt: string;
  
  // Product info (joined from backend)
  productName: string;
  productSlug: string;
  productThumbUrl?: string;
  
  // Variant info (if exists)
  variantPrice?: number;
  variantQuantity?: number;
  variantOptionsJson?: string;  // JSON string of variant options
  
  // Calculated
  totalPrice: number;      // priceSnapshot * quantity
}

// ==================== DTOs ====================

export interface CreateCartItemDto {
  productId: string;
  variantId?: string;
  quantity: number;        // Required, min: 1
}

export interface UpdateCartItemDto {
  quantity: number;        // Required, min: 1
}

// ==================== API RESPONSE TYPES ====================

export interface CartResponse {
  success: boolean;
  message: string;
  data: Cart;
}

export interface CartItemResponse {
  success: boolean;
  message: string;
  data: CartItem;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// ==================== EMPTY CART CONSTANT ====================

export const EMPTY_CART: Cart = {
  id: '00000000-0000-0000-0000-000000000000',
  userId: '00000000-0000-0000-0000-000000000000',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Parse variant options from JSON string
 */
export const parseVariantOptions = (optionsJson?: string): Record<string, string> => {
  if (!optionsJson) return {};
  
  try {
    const parsed = JSON.parse(optionsJson);
    if (Array.isArray(parsed)) {
      // Convert array of objects to single object
      // [{"size": "M"}, {"color": "Red"}] => {size: "M", color: "Red"}
      return parsed.reduce((acc, obj) => ({ ...acc, ...obj }), {});
    }
    return parsed;
  } catch (error) {
    console.error('Error parsing variant options:', error);
    return {};
  }
};

/**
 * Format variant options for display
 * Example: {size: "M", color: "Red"} => "Size: M, Color: Red"
 */
export const formatVariantOptions = (optionsJson?: string): string => {
  const options = parseVariantOptions(optionsJson);
  return Object.entries(options)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
};

/**
 * Get display price for cart item (with discount indicator)
 */
export const getCartItemPriceInfo = (item: CartItem) => {
  const currentPrice = item.variantPrice ?? 0;
  const snapshotPrice = item.priceSnapshot;
  const hasDiscount = currentPrice > snapshotPrice;
  
  return {
    displayPrice: snapshotPrice,
    currentPrice: currentPrice,
    hasDiscount: hasDiscount,
    savedAmount: hasDiscount ? currentPrice - snapshotPrice : 0,
  };
};

/**
 * Check if item is low stock
 */
export const isLowStock = (item: CartItem, threshold: number = 10): boolean => {
  if (item.variantQuantity === undefined) return false;
  return item.variantQuantity < threshold;
};

/**
 * Check if item is out of stock
 */
export const isOutOfStock = (item: CartItem): boolean => {
  if (item.variantQuantity === undefined) return false;
  return item.variantQuantity === 0;
};

/**
 * Check if requested quantity exceeds stock
 */
export const exceedsStock = (item: CartItem): boolean => {
  if (item.variantQuantity === undefined) return false;
  return item.quantity > item.variantQuantity;
};

