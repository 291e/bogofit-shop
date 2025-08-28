import { Suspense } from "react";
import ProductsPageClient from "./ProductsPageClient";
import LoadingText from "@/components/common/LoadingText";

export default function ProductsPage() {
  return (
  <Suspense fallback={<LoadingText />}> 
      <ProductsPageClient />
    </Suspense>
  );
}
