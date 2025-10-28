"use client";

import SideBarSection from "@/components/ui/sidebar-section";

interface OrderManagementSectionProps {
    brandId: string;
}

export default function OrderManagementSection({
    brandId
}: OrderManagementSectionProps) {
    const orderManagementData = {
        id: "order-management",
        label: "주문관리",
        subSections: [
            {
                id: "all-orders",
                label: "전체 주문관리",
                href: `/business/brands/${brandId}/orders`
            },
            {
                id: "pending",
                label: "결제 대기",
                href: `/business/brands/${brandId}/orders?status=pending`
            },
            {
                id: "confirmed",
                label: "결제 완료",
                href: `/business/brands/${brandId}/orders?status=confirmed`
            },
            {
                id: "processing",
                label: "배송 준비 중",
                href: `/business/brands/${brandId}/orders?status=processing`
            },
            {
                id: "completed",
                label: "배송 완료",
                href: `/business/brands/${brandId}/orders?status=completed`
            },
            {
                id: "canceled",
                label: "취소됨",
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
