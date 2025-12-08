"use client";

import SideBarSection from "@/components/ui/sidebar-section";
import { useLanguage } from "@/providers/languageProvider";

interface ProductManagementSectionProps {
  brandSlug: string;
  theme?: 'dark' | 'light';
}

export default function ProductManagementSection({
  brandSlug,
  theme
}: ProductManagementSectionProps) {
  const { t } = useLanguage();
  const productManagementData = {
    id: "product-management",
    label: t("header.business.brandDetail.sidebar.productManagement"),
    subSections: [
      {
        id: "all-products",
        label: t("header.business.brandDetail.sidebar.allProducts"),
        href: `/business/brands/${brandSlug}/products`
      },
      {
        id: "product-register",
        label: t("header.business.brandDetail.sidebar.productRegister"),
        href: `/business/brands/${brandSlug}/products/register`
      },
      {
        id: "inventory",
        label: t("header.business.brandDetail.sidebar.inventory"),
        href: `/business/brands/${brandSlug}/products/inventory`
      }
      ,
      {
        id: "reviews",
        label: t("header.business.brandDetail.sidebar.reviews"),
        href: `/business/brands/${brandSlug}/products/reviews`
      },
      {
        id: "inquiries",
        label: t("header.business.brandDetail.sidebar.inquiries"),
        href: `/business/brands/${brandSlug}/products/inquiries`
      }
    ]
  };

  return (
    <SideBarSection
      mainSection={productManagementData}
      theme={theme}
    />
  );
}