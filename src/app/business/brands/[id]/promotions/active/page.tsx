"use client";

import { useParams } from "next/navigation";
import ActivePromotionsSubSection from "@/components/(Business)/brands/(id)/promotion-management/subsections/ActivePromotionsSubSection";

export default function ActivePromotionsPage() {
    const params = useParams();
    const brandId = params.id as string;

    return <ActivePromotionsSubSection brandId={brandId} />;
}
