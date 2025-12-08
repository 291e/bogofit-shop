"use client";

import AllProductsSubSection from "@/components/(Business)/brands/(id)/product-management/subsections/AllProductsSubSection";
import { useBrandContext } from "../layout";

export default function AllProductsPage() {
  const { brandId, brand } = useBrandContext();

  return <AllProductsSubSection brandId={brandId} brand={brand} />;
}
