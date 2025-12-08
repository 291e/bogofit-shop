"use client";

import AllPromotionsSubSection from "@/components/(Business)/brands/(id)/promotion-management/subsections/AllPromotionsSubSection";
import { useBrandContext } from "../layout";

export default function AllPromotionsPage() {
    const { brandId } = useBrandContext();

    return <AllPromotionsSubSection brandId={brandId} />;
}
