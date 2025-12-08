"use client";

import ProductEditForm from "@/components/(Business)/brands/(id)/product-management/subsections/ProductForm/ProductEditForm";
import { useParams } from "next/navigation";
import { useLanguage } from "@/providers/languageProvider";
import { useBrandContext } from "../../../layout";

export default function EditProductPage() {
  const params = useParams();
  const { brandId } = useBrandContext();
  // Directory is [product-slug], so param name is 'product-slug'
  const productSlug = params['product-slug'] as string;
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("header.business.brandDetail.products.edit.title")}</h1>
          <p className="text-muted-foreground">{t("header.business.brandDetail.products.edit.description")}</p>
        </div>

        {/* Pass slug directly - API will handle it */}
        <ProductEditForm
          brandId={brandId}
          productId={productSlug}
        />
      </div>
    </div>
  );
}
