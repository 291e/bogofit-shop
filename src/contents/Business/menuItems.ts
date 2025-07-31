import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  BarChart3,
  FileText,
  DollarSign,
} from "lucide-react";

export interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

export const businessMenuItems: MenuItem[] = [
  {
    name: "대시보드",
    href: "/business",
    icon: LayoutDashboard,
  },
  {
    name: "상품 관리",
    href: "/business/products",
    icon: Package,
    children: [
      { name: "상품 목록", href: "/business/products", icon: Package },
      { name: "상품 등록", href: "/business/products/new", icon: Package },
      {
        name: "재고 관리",
        href: "/business/products/inventory",
        icon: Package,
      },
    ],
  },
  {
    name: "주문 관리",
    href: "/business/orders",
    icon: ShoppingCart,
    children: [
      { name: "주문 목록", href: "/business/orders", icon: ShoppingCart },
      {
        name: "배송 관리",
        href: "/business/shipping",
        icon: ShoppingCart,
      },
      {
        name: "반품/환불",
        href: "/business/refunds",
        icon: ShoppingCart,
      },
    ],
  },
  {
    name: "통계 및 분석",
    href: "/business/analytics",
    icon: BarChart3,
    children: [
      {
        name: "매출 분석",
        href: "/business/analytics/sales",
        icon: DollarSign,
      },
      {
        name: "상품 분석",
        href: "/business/analytics/products",
        icon: Package,
      },
    ],
  },
  {
    name: "정산 관리",
    href: "/business/settlement",
    icon: FileText,
  },
  {
    name: "업체 정보",
    href: "/business/settings/brand",
    icon: Settings,
  },
];
