"use client";

import ProductRegisterSubSection from "@/components/(Business)/brands/(id)/product-management/subsections/ProductRegisterSubSection";
import { useBrandContext } from "../../layout";

export default function ProductRegisterPage() {
  const { brandId } = useBrandContext();

  return <ProductRegisterSubSection brandId={brandId} />;
}
