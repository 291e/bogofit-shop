"use client";

import CreatePromotionSubSection from "@/components/(Business)/brands/(id)/promotion-management/subsections/CreatePromotionSubSection";
import { useBrandContext } from "../../layout";

export default function CreatePromotionPage() {
    const { brandId } = useBrandContext();

    return <CreatePromotionSubSection brandId={brandId} />;
}
