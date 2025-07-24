export interface ShippingOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  orderDate: string;
  shippingDate?: string;
  deliveryDate?: string;
  status: "pending" | "preparing" | "shipped" | "delivered" | "cancelled";
  courier: string;
  trackingNumber?: string;
  notes?: string;
}

export interface ShippingStats {
  total: number;
  pending: number;
  preparing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export const mockShippingOrders: ShippingOrder[] = [
  {
    id: "ORD-001",
    orderNumber: "ORD-2024-001",
    customerName: "김민수",
    customerPhone: "010-1234-5678",
    shippingAddress: "서울시 강남구 테헤란로 123, 456호",
    products: [
      { name: "프리미엄 셔츠", quantity: 2, price: 79000 },
      { name: "슬림핏 청바지", quantity: 1, price: 129000 },
    ],
    totalAmount: 287000,
    orderDate: "2024-01-20",
    shippingDate: "2024-01-21",
    status: "shipped",
    courier: "CJ대한통운",
    trackingNumber: "123456789012",
    notes: "문앞 배송 요청",
  },
  {
    id: "ORD-002",
    orderNumber: "ORD-2024-002",
    customerName: "이영희",
    customerPhone: "010-9876-5432",
    shippingAddress: "부산시 해운대구 해운대로 456, 789호",
    products: [{ name: "니트 가디건", quantity: 1, price: 89000 }],
    totalAmount: 89000,
    orderDate: "2024-01-21",
    status: "preparing",
    courier: "로젠택배",
    notes: "배송 전 연락 요청",
  },
  {
    id: "ORD-003",
    orderNumber: "ORD-2024-003",
    customerName: "박철수",
    customerPhone: "010-5555-1234",
    shippingAddress: "대구시 중구 동성로 789, 101호",
    products: [
      { name: "운동화", quantity: 1, price: 159000 },
      { name: "가죽 지갑", quantity: 1, price: 89000 },
    ],
    totalAmount: 248000,
    orderDate: "2024-01-22",
    shippingDate: "2024-01-23",
    deliveryDate: "2024-01-24",
    status: "delivered",
    courier: "한진택배",
    trackingNumber: "987654321098",
  },
  {
    id: "ORD-004",
    orderNumber: "ORD-2024-004",
    customerName: "정수연",
    customerPhone: "010-1111-2222",
    shippingAddress: "인천시 남동구 구월로 321, 202호",
    products: [{ name: "스마트워치", quantity: 1, price: 299000 }],
    totalAmount: 299000,
    orderDate: "2024-01-23",
    status: "pending",
    courier: "CJ대한통운",
  },
  {
    id: "ORD-005",
    orderNumber: "ORD-2024-005",
    customerName: "홍길동",
    customerPhone: "010-3333-4444",
    shippingAddress: "광주시 서구 상무대로 654, 301호",
    products: [{ name: "프리미엄 셔츠", quantity: 3, price: 79000 }],
    totalAmount: 237000,
    orderDate: "2024-01-23",
    status: "cancelled",
    courier: "우체국택배",
    notes: "고객 주문 취소",
  },
];

export const shippingStatusOptions = [
  { value: "all", label: "전체" },
  { value: "pending", label: "주문접수" },
  { value: "preparing", label: "배송준비" },
  { value: "shipped", label: "배송중" },
  { value: "delivered", label: "배송완료" },
  { value: "cancelled", label: "취소" },
];

export const courierOptions = [
  { value: "CJ대한통운", label: "CJ대한통운" },
  { value: "한진택배", label: "한진택배" },
  { value: "로젠택배", label: "로젠택배" },
  { value: "우체국택배", label: "우체국택배" },
  { value: "GSPostbox", label: "GSPostbox" },
  { value: "롯데택배", label: "롯데택배" },
];

export const getShippingStats = (orders: ShippingOrder[]): ShippingStats => {
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };
};
