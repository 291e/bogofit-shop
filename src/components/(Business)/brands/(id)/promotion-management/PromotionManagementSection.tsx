"use client";

import SideBarSection from "@/components/ui/sidebar-section";
import { useLanguage } from "@/providers/languageProvider";

interface PromotionManagementSectionProps {
    brandId: string;
}

export default function PromotionManagementSection({
    brandId
}: PromotionManagementSectionProps) {
    const { t } = useLanguage();
    const promotionManagementData = {
        id: "promotion-management",
        label: t("header.business.brandDetail.sidebar.promotionManagement"),
        subSections: [
            {
                id: "all-promotions",
                label: t("header.business.brandDetail.sidebar.allPromotions"),
                href: `/business/brands/${brandId}/promotions`
            },
            {
                id: "create-promotion",
                label: t("header.business.brandDetail.sidebar.createPromotion"),
                href: `/business/brands/${brandId}/promotions/create`
            },
            {
                id: "active-promotions",
                label: t("header.business.brandDetail.sidebar.activePromotions"),
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
