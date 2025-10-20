"use client";

import { useParams } from "next/navigation";
import ProductRegisterSubSection from "@/components/(Business)/brands/(id)/product-management/subsections/ProductRegisterSubSection";

export default function ProductRegisterPage() {
  const params = useParams();
  const brandId = params.id as string;

  return <ProductRegisterSubSection brandId={brandId} />;
}
