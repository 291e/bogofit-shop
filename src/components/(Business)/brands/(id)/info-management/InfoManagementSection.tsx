"use client";

import SideBarSection from "@/components/ui/sidebar-section";

interface InfoManagementSectionProps {
  brandId: string;
}

export default function InfoManagementSection({ 
  brandId 
}: InfoManagementSectionProps) {
  const infoManagementData = {
    id: "info-management",
    label: "정보관리",
    subSections: [
      {
        id: "company-info",
        label: "업체 정보관리",
        href: `/business/brands/${brandId}/settings`
      },
      {
        id: "shipping-policy",
        label: "업체 배송정책",
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