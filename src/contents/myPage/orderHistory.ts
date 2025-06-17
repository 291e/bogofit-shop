export interface OrderHistoryProduct {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
}

export interface OrderHistoryItem {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  product: OrderHistoryProduct;
}
