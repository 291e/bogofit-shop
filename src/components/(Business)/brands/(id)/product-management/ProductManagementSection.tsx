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
        href: `/business/brands/${brandId}/products/inventory`
      }
    ]
  };

  return (
    <SideBarSection
      mainSection={productManagementData}
    />
  );
}