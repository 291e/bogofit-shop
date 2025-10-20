"use client";

import InfoManagementSection from "@/components/(Business)/brands/(id)/info-management/InfoManagementSection";
import ProductManagementSection from "@/components/(Business)/brands/(id)/product-management/ProductManagementSection";


interface BusinessSidebarProps {
  brandId: string;
}

export default function BusinessSidebar({ brandId }: BusinessSidebarProps) {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 overflow-y-auto">
      <InfoManagementSection brandId={brandId} />
      <ProductManagementSection brandId={brandId} />

    </div>
  );
}
