"use client";

import CompanyInfoSubSection from "@/components/(Business)/brands/(id)/info-management/subsections/CompanyInfoSubSection";
import { useBrandContext } from "../layout";

export default function CompanyInfoPage() {
  const { brandId } = useBrandContext();

  return <CompanyInfoSubSection brandId={brandId} />;
}