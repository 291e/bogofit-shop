"use client";

import SettlementSection from "@/components/(Business)/brands/(id)/settlement/SettlementSection";
import InfoManagementSection from "@/components/(Business)/brands/(id)/info-management/InfoManagementSection";
import ProductManagementSection from "@/components/(Business)/brands/(id)/product-management/ProductManagementSection";
import OrderManagementSection from "@/components/(Business)/brands/(id)/order-management/OrderManagementSection";
import PromotionManagementSection from "@/components/(Business)/brands/(id)/promotion-management/PromotionManagementSection";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { useState } from "react";

interface BusinessSidebarProps {
  brandSlug: string;
}

export default function BusinessSidebar({ brandSlug }: BusinessSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`${collapsed ? "w-20" : "w-64"
        } bg-white text-gray-900 border-gray-200 shadow-sm transition-all duration-300 flex flex-col h-full border-r flex-shrink-0`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BUSINESS
            </h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-500 hover:text-gray-900"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          <InfoManagementSection brandSlug={brandSlug} theme='light' />
          <ProductManagementSection brandSlug={brandSlug} theme='light' />
          <OrderManagementSection brandSlug={brandSlug} theme='light' />
          <PromotionManagementSection brandSlug={brandSlug} theme='light' />
          <SettlementSection brandSlug={brandSlug} theme='light' />
        </div>
      )}

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-center text-gray-500">
            BOGOFIT Business v1.0
          </div>
        </div>
      )}
    </div>
  );
}
