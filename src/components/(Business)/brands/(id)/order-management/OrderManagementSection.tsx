"use client";

import SideBarSection from "@/components/ui/sidebar-section";
import { useLanguage } from "@/providers/languageProvider";

interface OrderManagementSectionProps {
    brandId: string;
}

export default function OrderManagementSection({
    brandId
}: OrderManagementSectionProps) {
    const { t } = useLanguage();
    const orderManagementData = {
        id: "order-management",
        label: t("header.business.brandDetail.sidebar.orderManagement"),
        subSections: [
            {
                id: "all-orders",
                label: t("header.business.brandDetail.sidebar.allOrders"),
                href: `/business/brands/${brandId}/orders`
            },
            {
                id: "pending",
                label: t("header.business.brandDetail.sidebar.paymentPending"),
                href: `/business/brands/${brandId}/orders?status=pending`
            },
            {
                id: "confirmed",
                label: t("header.business.brandDetail.sidebar.paymentCompleted"),
                href: `/business/brands/${brandId}/orders?status=confirmed`
            },
            {
                id: "processing",
                label: t("header.business.brandDetail.sidebar.processing"),
                href: `/business/brands/${brandId}/orders?status=processing`
            },
            {
                id: "completed",
                label: t("header.business.brandDetail.sidebar.shippingCompleted"),
                href: `/business/brands/${brandId}/orders?status=completed`
            },
            {
                id: "canceled",
                label: t("header.business.brandDetail.sidebar.canceled"),
                href: `/business/brands/${brandId}/orders?status=canceled`
            }
        ]
    };

    return (
        <SideBarSection
            mainSection={orderManagementData}
        />
    );
}
