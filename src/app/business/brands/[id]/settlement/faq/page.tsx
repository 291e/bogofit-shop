"use client";

import { use } from "react";
import FAQSubSection from "@/components/(Business)/brands/(id)/settlement/subsections/FAQSubSection";

export default function FAQPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: brandId } = use(params);

    return <FAQSubSection brandId={brandId} />;
}
