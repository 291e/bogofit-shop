"use client";

import SideBarSection from "@/components/ui/sidebar-section";

interface ProductManagementSectionProps {
  brandId: string;
}

export default function ProductManagementSection({ 
  brandId 
}: ProductManagementSectionProps) {
  const productManagementData = {
    id: "product-management",
    label: "상품관리",
    subSections: [
      {
        id: "all-products",
        label: "전체 상품관리",
        href: `/business/brands/${brandId}/products`
      },
      {
        id: "product-register",
        label: "상품 등록",
        href: `/business/brands/${brandId}/products/register`
      },
      {
        id: "inventory",
        label: "상품 재고관리",
        href: `/business/brands/${brandId}/products/inventory`,
      },
      {
        id: "product-categories",
        label: "상품 카테고리",
        href: `/business/brands/${brandId}/products/categories`
      },
      {
        id: "product-inquiries",
        label: "상품 문의관리",
        href: `/business/brands/${brandId}/products/inquiries`,
      },
      {
        id: "product-ratings",
        label: "상품 평점관리",
        href: `/business/brands/${brandId}/products/ratings`,
      }
    ]
  };

  return (
    <SideBarSection
      mainSection={productManagementData}
    />
  );
}