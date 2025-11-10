"use client";

import SideBarSection from "@/components/ui/sidebar-section";
import { useLanguage } from "@/providers/languageProvider";

interface SettlementSectionProps {
    brandId: string;
}

export default function SettlementSection({ brandId }: SettlementSectionProps) {
    const { t } = useLanguage();
    const settlementData = {
        id: "settlement",
        label: t("header.business.brandDetail.sidebar.settlement"),
        subSections: [
            {
                id: "order-analysis",
                label: t("header.business.brandDetail.sidebar.orderAnalysis"),
                href: `/business/brands/${brandId}/settlement/analysis`
            },
            {
                id: "settlement-pending",
                label: t("header.business.brandDetail.sidebar.settlementPending"),
                href: `/business/brands/${brandId}/settlement/pending`
            },
            {
                id: "settlement-completed",
                label: t("header.business.brandDetail.sidebar.settlementCompleted"),
                href: `/business/brands/${brandId}/settlement/completed`
            },
            {
                id: "announcements",
                label: t("header.business.brandDetail.sidebar.announcements"),
                href: `/business/brands/${brandId}/settlement/announcements`
            },
            {
                id: "faq",
                label: t("header.business.brandDetail.sidebar.faq"),
                href: `/business/brands/${brandId}/settlement/faq`
            }
        ]
    };

    return (
        <SideBarSection
            mainSection={settlementData}
        />
    );
}
