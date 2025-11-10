"use client";

import SideBarSection from "@/components/ui/sidebar-section";
import { useLanguage } from "@/providers/languageProvider";

interface InfoManagementSectionProps {
  brandId: string;
}

export default function InfoManagementSection({ 
  brandId 
}: InfoManagementSectionProps) {
  const { t } = useLanguage();
  const infoManagementData = {
    id: "info-management",
    label: t("header.business.brandDetail.sidebar.infoManagement"),
    subSections: [
      {
        id: "company-info",
        label: t("header.business.brandDetail.sidebar.companyInfo"),
        href: `/business/brands/${brandId}/settings`
      },
      {
        id: "shipping-policy",
        label: t("header.business.brandDetail.sidebar.shippingPolicy"),
        href: `/business/brands/${brandId}/settings/shipping`
      }
    ]
  };

  return (
    <SideBarSection
      mainSection={infoManagementData}
      className="border-t-0"
    />
  );
}