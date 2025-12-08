"use client";

import { use } from "react";
import OrderAnalysisSubSection from "@/components/(Business)/brands/(id)/settlement/subsections/OrderAnalysisSubSection";

export default function OrderAnalysisPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: brandId } = use(params);

    return <OrderAnalysisSubSection brandId={brandId} />;
}
