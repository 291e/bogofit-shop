"use client";

import SettlementSection from "@/components/(Business)/brands/(id)/settlement/SettlementSection";
import InfoManagementSection from "@/components/(Business)/brands/(id)/info-management/InfoManagementSection";
import ProductManagementSection from "@/components/(Business)/brands/(id)/product-management/ProductManagementSection";
import OrderManagementSection from "@/components/(Business)/brands/(id)/order-management/OrderManagementSection";
import PromotionManagementSection from "@/components/(Business)/brands/(id)/promotion-management/PromotionManagementSection";


interface BusinessSidebarProps {
  brandId: string;
}

export default function BusinessSidebar({ brandId }: BusinessSidebarProps) {
  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
      <InfoManagementSection brandId={brandId} />
      <ProductManagementSection brandId={brandId} />
      <OrderManagementSection brandId={brandId} />
      <PromotionManagementSection brandId={brandId} />
      <SettlementSection brandId={brandId} />
    </div>
  );
}
