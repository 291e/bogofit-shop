import ProductEditForm from "@/components/(Business)/brands/(id)/product-management/subsections/ProductForm/ProductEditForm";

interface EditProductPageProps {
  params: Promise<{
    id: string;
    productId: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id, productId } = await params;
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">상품 수정</h1>
          <p className="text-muted-foreground">상품 정보를 수정하세요</p>
        </div>
        
        <ProductEditForm 
          brandId={id}
          productId={productId}
        />
      </div>
    </div>
  );
}
