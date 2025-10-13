export interface InventoryProduct {
  id: number | string;
  productId: number;
  variantId: number;
  title: string;
  variantName?: string;
  sku: string;
  category: string;
  imageUrl?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  stockValue: number;
  lastUpdated: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface StockAdjustment {
  productId: number;
  type: "increase" | "decrease";
  quantity: number;
  reason: string;
}

export const mockInventoryData: InventoryProduct[] = [
  {
    id: 1,
    productId: 1,
    variantId: 1,
    title: "프리미엄 셔츠",
    variantName: "사이즈: M",
    sku: "SHIRT_001",
    category: "의류",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop&crop=center",
    currentStock: 150,
    minStock: 20,
    maxStock: 500,
    unitPrice: 79000,
    stockValue: 11850000,
    lastUpdated: "2024-01-20",
    status: "in_stock",
  },
  {
    id: 2,
    productId: 2,
    variantId: 1,
    title: "슬림핏 청바지",
    variantName: "사이즈: L",
    sku: "JEANS_001",
    category: "의류",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&h=100&fit=crop&crop=center",
    currentStock: 5,
    minStock: 10,
    maxStock: 200,
    unitPrice: 129000,
    stockValue: 645000,
    lastUpdated: "2024-01-19",
    status: "low_stock",
  },
  {
    id: 3,
    productId: 3,
    variantId: 1,
    title: "니트 가디건",
    variantName: "사이즈: S",
    sku: "KNIT_001",
    category: "의류",
    imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=100&h=100&fit=crop&crop=center",
    currentStock: 0,
    minStock: 5,
    maxStock: 100,
    unitPrice: 89000,
    stockValue: 0,
    lastUpdated: "2024-01-18",
    status: "out_of_stock",
  },
  {
    id: 4,
    productId: 4,
    variantId: 1,
    title: "운동화",
    variantName: "사이즈: 270",
    sku: "SHOES_001",
    category: "신발",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop&crop=center",
    currentStock: 85,
    minStock: 15,
    maxStock: 300,
    unitPrice: 159000,
    stockValue: 13515000,
    lastUpdated: "2024-01-20",
    status: "in_stock",
  },
  {
    id: 5,
    productId: 5,
    variantId: 1,
    title: "가죽 지갑",
    variantName: "색상: 브라운",
    sku: "WALLET_001",
    category: "액세서리",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop&crop=center",
    currentStock: 8,
    minStock: 10,
    maxStock: 150,
    unitPrice: 89000,
    stockValue: 712000,
    lastUpdated: "2024-01-19",
    status: "low_stock",
  },
  {
    id: 6,
    productId: 6,
    variantId: 1,
    title: "스마트워치",
    variantName: "색상: 블랙",
    sku: "WATCH_001",
    category: "전자제품",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop&crop=center",
    currentStock: 45,
    minStock: 5,
    maxStock: 100,
    unitPrice: 299000,
    stockValue: 13455000,
    lastUpdated: "2024-01-18",
    status: "in_stock",
  },
];

export const stockStatusOptions = [
  { value: "all", label: "모든 상태" },
  { value: "in_stock", label: "재고 충분" },
  { value: "low_stock", label: "재고 부족" },
  { value: "out_of_stock", label: "품절" },
];

export const adjustmentTypeOptions = [
  { value: "increase", label: "입고 (+)" },
  { value: "decrease", label: "출고 (-)" },
];
