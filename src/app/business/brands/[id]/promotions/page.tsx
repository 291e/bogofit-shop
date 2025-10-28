"use client";

import { useParams } from "next/navigation";
import AllPromotionsSubSection from "@/components/(Business)/brands/(id)/promotion-management/subsections/AllPromotionsSubSection";

export default function AllPromotionsPage() {
    const params = useParams();
    const brandId = params.id as string;

    return <AllPromotionsSubSection brandId={brandId} />;
}
