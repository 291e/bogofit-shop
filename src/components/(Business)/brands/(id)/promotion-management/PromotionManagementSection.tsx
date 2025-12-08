"use client";

import SideBarSection from "@/components/ui/sidebar-section";
import { useLanguage } from "@/providers/languageProvider";

interface PromotionManagementSectionProps {
    brandSlug: string;
    theme?: 'dark' | 'light';
}

export default function PromotionManagementSection({
    brandSlug,
    theme
}: PromotionManagementSectionProps) {
    const { t } = useLanguage();
    const promotionManagementData = {
        id: "promotion-management",
        label: t("header.business.brandDetail.sidebar.promotionManagement"),
        subSections: [
            {
                id: "all-promotions",
                label: t("header.business.brandDetail.sidebar.allPromotions"),
                href: `/business/brands/${brandSlug}/promotions`
            },
            {
                id: "create-promotion",
                label: t("header.business.brandDetail.sidebar.createPromotion"),
                href: `/business/brands/${brandSlug}/promotions/create`
            },
            {
                id: "active-promotions",
                label: t("header.business.brandDetail.sidebar.activePromotions"),
                href: `/business/brands/${brandSlug}/promotions/active`
            }
        ]
    };

    return (
        <SideBarSection
            mainSection={promotionManagementData}
            theme={theme}
        />
    );
}
