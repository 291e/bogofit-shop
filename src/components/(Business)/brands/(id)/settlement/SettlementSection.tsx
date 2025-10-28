"use client";

import SideBarSection from "@/components/ui/sidebar-section";

interface SettlementSectionProps {
    brandId: string;
}

export default function SettlementSection({ brandId }: SettlementSectionProps) {
    const settlementData = {
        id: "settlement",
        label: "기타/정산관리",
        subSections: [
            {
                id: "order-analysis",
                label: "주문통계분석",
                href: `/business/brands/${brandId}/settlement/analysis`
            },
            {
                id: "settlement-pending",
                label: "정산대기목록",
                href: `/business/brands/${brandId}/settlement/pending`
            },
            {
                id: "settlement-completed",
                label: "정산완료목록",
                href: `/business/brands/${brandId}/settlement/completed`
            },
            {
                id: "announcements",
                label: "공지사항",
                href: `/business/brands/${brandId}/settlement/announcements`
            },
            {
                id: "faq",
                label: "질문과답변",
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
