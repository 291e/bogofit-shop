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

// 비회원 장바구니 아이템 (메모리/로컬스토리지용)
export interface GuestCartItem {
  id: string; // 임시 ID (UUID 등)
  variantId: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: number;
    imageUrl: string;
    category: string;
  };
  variant: {
    optionName: string;
    optionValue: string;
    priceDiff: number;
  };
}

// 비회원 장바구니
export interface GuestCart {
  items: GuestCartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
}

// 게스트 주문 정보
export interface GuestOrderInfo {
  // 주문자 정보
  ordererName: string;
  ordererEmail: string;
  ordererPhone: string;

  // 배송지 정보
  recipientName: string;
  recipientPhone: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  deliveryRequest?: string;

  // 통관 정보 (해외배송용)
  customsInfo: {
    recipientNameEn: string;
    personalCustomsCode: string;
  };

  // 동의 정보
  agreements: {
    terms: boolean;
    privacy: boolean;
    marketing?: boolean;
  };
}

export interface AddToCartRequest {
  variantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
