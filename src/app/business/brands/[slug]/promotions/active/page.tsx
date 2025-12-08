"use client";

import ActivePromotionsSubSection from "@/components/(Business)/brands/(id)/promotion-management/subsections/ActivePromotionsSubSection";
import { useBrandContext } from "../../layout";

export default function ActivePromotionsPage() {
    const { brandId } = useBrandContext();

    return <ActivePromotionsSubSection brandId={brandId} />;
}
