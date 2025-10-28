"use client";

import { use } from "react";
import AnnouncementsSubSection from "@/components/(Business)/brands/(id)/settlement/subsections/AnnouncementsSubSection";

export default function AnnouncementsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: brandId } = use(params);

    return <AnnouncementsSubSection brandId={brandId} />;
}
