"use client";

import { useParams } from "next/navigation";
import AllProductsSubSection from "@/components/(Business)/brands/(id)/product-management/subsections/AllProductsSubSection";

export default function AllProductsPage() {
  const params = useParams();
  const brandId = params.id as string;

  return <AllProductsSubSection brandId={brandId} />;
}
