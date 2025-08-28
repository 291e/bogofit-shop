// 매출 분석 관련 데이터
export interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  growth: number;
}

export interface SalesByStore {
  storeId: string;
  storeName: string;
  revenue: number;
  orders: number;
  target: number;
  achievement: number;
}

export interface SalesByProduct {
  productId: string;
  productName: string;
  category: string;
  revenue: number;
  quantity: number;
  averagePrice: number;
}

// 상품 분석 관련 데이터
export interface ProductPerformance {
  productId: string;
  productName: string;
  category: string;
  totalSales: number;
  quantitySold: number;
  currentStock: number;
  stockTurnover: number;
  profitMargin: number;
  rating: number;
  reviewCount: number;
}

export interface CategoryAnalysis {
  category: string;
  revenue: number;
  quantity: number;
  productCount: number;
  averagePrice: number;
  growth: number;
}

// 매출 분석 모의 데이터
export const mockSalesData: SalesData[] = [
  {
    period: "2024-01",
    revenue: 45680000,
    orders: 1250,
    averageOrderValue: 36544,
    growth: 15.2,
  },
  {
    period: "2024-02",
    revenue: 52340000,
    orders: 1380,
    averageOrderValue: 37942,
    growth: 14.6,
  },
  {
    period: "2024-03",
    revenue: 48920000,
    orders: 1295,
    averageOrderValue: 37779,
    growth: -6.5,
  },
  {
    period: "2024-04",
    revenue: 56780000,
    orders: 1456,
    averageOrderValue: 39011,
    growth: 16.1,
  },
  {
    period: "2024-05",
    revenue: 61250000,
    orders: 1520,
    averageOrderValue: 40296,
    growth: 7.9,
  },
  {
    period: "2024-06",
    revenue: 59840000,
    orders: 1485,
    averageOrderValue: 40296,
    growth: -2.3,
  },
];

export const mockSalesByStore: SalesByStore[] = [
  {
    storeId: "STORE-001",
    storeName: "강남 플래그십 스토어",
    revenue: 45680000,
    orders: 1250,
    target: 50000000,
    achievement: 91.4,
  },
  {
    storeId: "STORE-002",
    storeName: "홍대 팝업 스토어",
    revenue: 28950000,
    orders: 890,
    target: 25000000,
    achievement: 115.8,
  },
  {
    storeId: "STORE-003",
    storeName: "부산 센텀시티점",
    revenue: 32140000,
    orders: 750,
    target: 35000000,
    achievement: 91.8,
  },
  {
    storeId: "STORE-004",
    storeName: "온라인 스토어",
    revenue: 125680000,
    orders: 5640,
    target: 100000000,
    achievement: 125.7,
  },
];

export const mockSalesByProduct: SalesByProduct[] = [
  {
    productId: "PROD-001",
    productName: "프리미엄 셔츠",
    category: "의류",
    revenue: 15800000,
    quantity: 200,
    averagePrice: 79000,
  },
  {
    productId: "PROD-002",
    productName: "슬림핏 청바지",
    category: "의류",
    revenue: 12900000,
    quantity: 100,
    averagePrice: 129000,
  },
  {
    productId: "PROD-003",
    productName: "운동화",
    category: "신발",
    revenue: 15900000,
    quantity: 100,
    averagePrice: 159000,
  },
  {
    productId: "PROD-004",
    productName: "스마트워치",
    category: "전자제품",
    revenue: 29900000,
    quantity: 100,
    averagePrice: 299000,
  },
];

// 상품 분석 모의 데이터
export const mockProductPerformance: ProductPerformance[] = [
  {
    productId: "PROD-001",
    productName: "프리미엄 셔츠",
    category: "의류",
    totalSales: 15800000,
    quantitySold: 200,
    currentStock: 150,
    stockTurnover: 1.33,
    profitMargin: 35.5,
    rating: 4.5,
    reviewCount: 48,
  },
  {
    productId: "PROD-002",
    productName: "슬림핏 청바지",
    category: "의류",
    totalSales: 12900000,
    quantitySold: 100,
    currentStock: 5,
    stockTurnover: 20.0,
    profitMargin: 42.3,
    rating: 4.3,
    reviewCount: 32,
  },
  {
    productId: "PROD-003",
    productName: "운동화",
    category: "신발",
    totalSales: 15900000,
    quantitySold: 100,
    currentStock: 85,
    stockTurnover: 1.18,
    profitMargin: 38.9,
    rating: 4.7,
    reviewCount: 67,
  },
  {
    productId: "PROD-004",
    productName: "스마트워치",
    category: "전자제품",
    totalSales: 29900000,
    quantitySold: 100,
    currentStock: 45,
    stockTurnover: 2.22,
    profitMargin: 25.8,
    rating: 4.2,
    reviewCount: 89,
  },
];

export const mockCategoryAnalysis: CategoryAnalysis[] = [
  {
    category: "의류",
    revenue: 28700000,
    quantity: 300,
    productCount: 15,
    averagePrice: 95667,
    growth: 12.5,
  },
  {
    category: "신발",
    revenue: 15900000,
    quantity: 100,
    productCount: 8,
    averagePrice: 159000,
    growth: 8.3,
  },
  {
    category: "전자제품",
    revenue: 29900000,
    quantity: 100,
    productCount: 5,
    averagePrice: 299000,
    growth: 25.7,
  },
  {
    category: "액세서리",
    revenue: 8900000,
    quantity: 120,
    productCount: 12,
    averagePrice: 74167,
    growth: -3.2,
  },
];

// 기간 옵션
export const periodOptions = [
  { value: "today", label: "오늘" },
  { value: "week", label: "이번 주" },
  { value: "month", label: "이번 달" },
  { value: "quarter", label: "이번 분기" },
  { value: "year", label: "올해" },
  { value: "custom", label: "사용자 정의" },
];

// 유틸리티 함수들
export const formatCurrency = (amount: number) => {
  return `₩${amount.toLocaleString()}`;
};

export const formatNumber = (num: number) => {
  return num.toLocaleString();
};

export const formatPercent = (percent: number) => {
  return `${percent.toFixed(1)}%`;
};

export const getGrowthColor = (growth: number) => {
  if (growth > 0) return "text-green-600";
  if (growth < 0) return "text-red-600";
  return "text-gray-600";
};

export const getGrowthIcon = (growth: number) => {
  if (growth > 0) return "↗";
  if (growth < 0) return "↘";
  return "→";
};
