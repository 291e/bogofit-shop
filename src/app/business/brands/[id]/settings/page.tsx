"use client";

import { useParams } from "next/navigation";
import CompanyInfoSubSection from "@/components/(Business)/brands/(id)/info-management/subsections/CompanyInfoSubSection";

export default function CompanyInfoPage() {
  const params = useParams();
  const brandId = params.id as string;

  return <CompanyInfoSubSection brandId={brandId} />;
}