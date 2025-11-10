"use client";

import SideBarSection from "@/components/ui/sidebar-section";
import { useLanguage } from "@/providers/languageProvider";

interface ProductManagementSectionProps {
  brandId: string;
}

export default function ProductManagementSection({
  brandId
}: ProductManagementSectionProps) {
  const { t } = useLanguage();
  const productManagementData = {
    id: "product-management",
    label: t("header.business.brandDetail.sidebar.productManagement"),
    subSections: [
      {
        id: "all-products",
        label: t("header.business.brandDetail.sidebar.allProducts"),
        href: `/business/brands/${brandId}/products`
      },
      {
        id: "product-register",
        label: t("header.business.brandDetail.sidebar.productRegister"),
        href: `/business/brands/${brandId}/products/register`
      },
      {
        id: "inventory",
        label: t("header.business.brandDetail.sidebar.inventory"),
        href: `/business/brands/${brandId}/products/inventory`
      }
      ,
      {
        id: "reviews",
        label: t("header.business.brandDetail.sidebar.reviews"),
        href: `/business/brands/${brandId}/products/reviews`
      },
      {
        id: "inquiries",
        label: t("header.business.brandDetail.sidebar.inquiries"),
        href: `/business/brands/${brandId}/products/inquiries`
      }
    ]
  };

  return (
    <SideBarSection
      mainSection={productManagementData}
    />
  );
}