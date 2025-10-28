"use client";

import { useParams } from "next/navigation";
import CreatePromotionSubSection from "@/components/(Business)/brands/(id)/promotion-management/subsections/CreatePromotionSubSection";

export default function CreatePromotionPage() {
    const params = useParams();
    const brandId = params.id as string;

    return <CreatePromotionSubSection brandId={brandId} />;
}
