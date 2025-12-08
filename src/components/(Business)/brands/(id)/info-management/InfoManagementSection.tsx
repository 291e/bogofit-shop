"use client";

import SideBarSection from "@/components/ui/sidebar-section";
import { useLanguage } from "@/providers/languageProvider";

interface InfoManagementSectionProps {
  brandSlug: string;
  theme?: 'dark' | 'light';
}

export default function InfoManagementSection({
  brandSlug,
  theme
}: InfoManagementSectionProps) {
  const { t } = useLanguage();
  const infoManagementData = {
    id: "info-management",
    label: t("header.business.brandDetail.sidebar.infoManagement"),
    subSections: [
      {
        id: "company-info",
        label: t("header.business.brandDetail.sidebar.companyInfo"),
        href: `/business/brands/${brandSlug}/settings`
      },
      {
        id: "shipping-policy",
        label: t("header.business.brandDetail.sidebar.shippingPolicy"),
        href: `/business/brands/${brandSlug}/settings/shipping`
      }
    ]
  };

  return (
    <SideBarSection
      mainSection={infoManagementData}
      className="border-t-0"
      theme={theme}
    />
  );
}