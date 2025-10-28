"use client";

import { use } from "react";
import SettlementCompletedSubSection from "@/components/(Business)/brands/(id)/settlement/subsections/SettlementCompletedSubSection";

export default function SettlementCompletedPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: brandId } = use(params);

    return <SettlementCompletedSubSection brandId={brandId} />;
}
