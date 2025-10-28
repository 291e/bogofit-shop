"use client";

import { use } from "react";
import SettlementPendingSubSection from "@/components/(Business)/brands/(id)/settlement/subsections/SettlementPendingSubSection";

export default function SettlementPendingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = use(params);

  return <SettlementPendingSubSection brandId={brandId} />;
}