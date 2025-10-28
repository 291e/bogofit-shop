"use client";

import SideBarSection from "@/components/ui/sidebar-section";

interface PromotionManagementSectionProps {
    brandId: string;
}

export default function PromotionManagementSection({
    brandId
}: PromotionManagementSectionProps) {
    const promotionManagementData = {
        id: "promotion-management",
        label: "프로모션 관리",
        subSections: [
            {
                id: "all-promotions",
                label: "전체 프로모션",
                href: `/business/brands/${brandId}/promotions`
            },
            {
                id: "create-promotion",
                label: "프로모션 생성",
                href: `/business/brands/${brandId}/promotions/create`
            },
            {
                id: "active-promotions",
                label: "활성 프로모션",
                href: `/business/brands/${brandId}/promotions/active`
            }
        ]
    };

    return (
        <SideBarSection
            mainSection={promotionManagementData}
        />
    );
}
