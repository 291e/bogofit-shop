export interface InventoryProduct {
  id: number;
  title: string;
  sku: string;
  category: string;
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
    title: "프리미엄 셔츠",
    sku: "SHIRT_001",
    category: "의류",
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
    title: "슬림핏 청바지",
    sku: "JEANS_001",
    category: "의류",
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
    title: "니트 가디건",
    sku: "KNIT_001",
    category: "의류",
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
    title: "운동화",
    sku: "SHOES_001",
    category: "신발",
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
    title: "가죽 지갑",
    sku: "WALLET_001",
    category: "액세서리",
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
    title: "스마트워치",
    sku: "WATCH_001",
    category: "전자제품",
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
