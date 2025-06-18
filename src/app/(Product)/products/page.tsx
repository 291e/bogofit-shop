import { Suspense } from "react";
import ProductsPageClient from "./ProductsPageClient";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">로딩 중...</div>}>
      <ProductsPageClient />
    </Suspense>
  );
}
