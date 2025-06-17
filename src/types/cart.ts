export interface CartItem {
  id: number;
  quantity: number;
  variant: {
    id: number;
    optionName: string;
    optionValue: string;
    priceDiff: number;
    stock: number;
    product: {
      id: number;
      title: string;
      price: number;
      imageUrl: string;
      category: string;
    };
  };
}

export interface Cart {
  id: number;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
}

export interface AddToCartRequest {
  variantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
