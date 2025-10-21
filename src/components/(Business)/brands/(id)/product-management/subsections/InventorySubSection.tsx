"use client";

import { useState, useEffect } from "react";
import { useBrandContext } from "@/app/business/brands/[id]/layout";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductResponseDto } from "@/types/product";
import Image from "next/image";
import VariantEditModal from "./ProductForm/VariantEditModal";
import { toast } from "sonner";
import { useAuth } from "@/providers/authProvider";
import { useQueryClient } from "@tanstack/react-query";
import { PRODUCTS_QUERY_KEY, PRODUCT_DETAIL_QUERY_KEY } from "@/hooks/useProducts";


interface InventorySubSectionProps {
  brandId?: string;
}

export default function InventorySubSection({ 
  brandId 
}: InventorySubSectionProps) {
  const { brandId: contextBrandId } = useBrandContext();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductResponseDto | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<{
    variant: any;
    productName: string;
    productId: string;
  } | null>(null);
  const [showVariantEditModal, setShowVariantEditModal] = useState(false);
  const [isSavingVariant, setIsSavingVariant] = useState(false);
  
  // Debounce search term to avoid spamming API
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Reset to page 1 when search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setPageNumber(1);
    }
  }, [debouncedSearchTerm]);
  
  const { data, isLoading, error } = useProducts(brandId || contextBrandId, pageNumber, debouncedSearchTerm);
  
  const products: ProductResponseDto[] = Array.isArray(data?.data?.data) 
    ? data.data.data 
    : Array.isArray(data?.data) 
      ? data.data 
      : Array.isArray(data?.products) 
        ? data.products 
        : [];

  // Pagination is inside data.data, NOT data.pagination
  const totalPages = data?.data?.totalPages || data?.pagination?.totalPages || data?.totalPages || 1;

  // No need for client-side filtering anymore - backend handles search
  const filteredProducts = products;

  // Handler to save variant updates
  const handleSaveVariant = async (variantId: string, updates: any) => {
    if (!selectedVariant) return;
    
    setIsSavingVariant(true);
    
    try {
      const token = getToken();
      const response = await fetch(`/api/product/${selectedVariant.productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updateVariants: [{
            id: variantId,
            quantity: updates.quantity,
            price: updates.price,
            compareAtPrice: updates.compareAtPrice
          }]
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('변형 재고가 업데이트되었습니다');
        
        // Invalidate cache
        queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, brandId || contextBrandId] });
        queryClient.invalidateQueries({ queryKey: [...PRODUCT_DETAIL_QUERY_KEY, selectedVariant.productId] });
        
        // Close modal
        setShowVariantEditModal(false);
        setSelectedVariant(null);
      } else {
        toast.error(data.message || '변형 업데이트에 실패했습니다');
      }
    } catch (error) {
      console.error('❌ Variant update error:', error);
      toast.error('변형 업데이트 중 오류가 발생했습니다');
    } finally {
      setIsSavingVariant(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">오류 발생</h3>
              <p className="text-gray-500">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상품 재고관리</h1>
          <p className="text-gray-600 mt-1">
            상품별 변형의 재고를 관리하세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="상품명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            필터
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {/* Header */}
            <div className="flex items-center py-3 px-4 bg-gray-50 rounded-t-lg font-medium text-xs text-gray-600 border-b border-gray-200">
              <div className="w-20 text-center">SKU</div>
              <div className="w-20 text-center border-l border-gray-300 pl-2">이미지</div>
              <div className="w-32 text-center border-l border-gray-300 pl-2">상품명</div>
              <div className="w-24 text-center border-l border-gray-300 pl-2">레벨</div>
              <div className="flex-1 text-center border-l border-gray-300 pl-2">옵션</div>
              <div className="flex-1 text-center border-l border-gray-300 pl-2">재고</div>
              <div className="flex-1 text-center border-l border-gray-300 pl-2">가격</div>
              <div className="flex-1 text-center border-l border-gray-300 pl-2">비교가격</div>
              <div className="w-24 text-center border-l border-gray-300 pl-2">액션</div>
            </div>
            
            {/* Product + Variant Rows - v2.0: Show product first, then variants */}
            {filteredProducts.flatMap((product) => {
              const rows = [];
              
              // 1. ALWAYS show product-level row first
              rows.push(
                <div key={`${product.id}-product`} className="border-b border-gray-200 bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex items-center py-3 px-4">
                    {/* SKU */}
                    <div className="w-20 text-center">
                      <p className="text-xs font-mono text-gray-600 truncate">{product.sku}</p>
                    </div>
                    
                    {/* 이미지 */}
                    <div className="w-20 flex justify-center border-l border-gray-300 pl-2">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                        {product.thumbUrl ? (
                          <Image 
                            src={product.thumbUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                            width={48}
                            height={48}
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* 상품명 */}
                    <div className="w-32 text-center border-l border-gray-300 pl-2">
                      <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    </div>
                    
                    {/* 레벨 */}
                    <div className="w-24 text-center border-l border-gray-300 pl-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        상품
                      </span>
                    </div>
                    
                    {/* 옵션 */}
                    <div className="flex-1 text-center border-l border-gray-300 pl-2">
                      <div className="text-xs text-gray-600 font-medium">
                        {product.variants && product.variants.length > 0 
                          ? `${product.variants.length}개`
                          : '0개'}
                      </div>
                    </div>
                    
                    {/* 재고 */}
                    <div className="flex-1 text-center border-l border-gray-300 pl-2">
                      <p className="text-sm font-semibold text-blue-900">
                        {product.variants && product.variants.length > 0 
                          ? `${product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0)}개`
                          : (product.quantity === null ? '무제한' : `${product.quantity}개`)}
                      </p>
                    </div>
                    
                    {/* 가격 */}
                    <div className="flex-1 text-center border-l border-gray-300 pl-2">
                      <p className="text-sm font-medium">{product.basePrice.toLocaleString()}원</p>
                    </div>
                    
                    {/* 비교가격 */}
                    <div className="flex-1 text-center border-l border-gray-300 pl-2">
                      {product.baseCompareAtPrice ? (
                        <p className="text-sm text-gray-400 line-through">
                          {product.baseCompareAtPrice.toLocaleString()}원
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">-</p>
                      )}
                    </div>
                    
                    {/* 액션 */}
                    <div className="w-24 flex justify-center gap-1 border-l border-gray-300 pl-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-6"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
              
              // 2. Then show variant rows if they exist
              if (product.variants && product.variants.length > 0) {
                product.variants.forEach((variant, variantIndex) => {
                  rows.push(
                    <div key={`${product.id}-${variant.id || variantIndex}`} className="border-b border-gray-200 bg-green-50 hover:bg-green-100 transition-colors">
                      <div className="flex items-center py-3 px-4 pl-8">
                        {/* SKU */}
                        <div className="w-20 text-center">
                          <p className="text-xs font-mono text-gray-400 truncate">↳ {product.sku}</p>
                        </div>
                        
                        {/* 이미지 */}
                        <div className="w-20 flex justify-center border-l border-gray-300 pl-2">
                          <div className="w-12 h-12 bg-white rounded flex items-center justify-center border border-gray-200">
                            {product.thumbUrl ? (
                              <Image 
                                src={product.thumbUrl} 
                                alt={product.name}
                                className="w-full h-full object-cover rounded opacity-60"
                                width={48}
                                height={48}
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-300" />
                            )}
                          </div>
                        </div>
                        
                        {/* 상품명 */}
                        <div className="w-32 text-center border-l border-gray-300 pl-2">
                          <h3 className="font-normal text-xs text-gray-500 truncate">{product.name}</h3>
                        </div>
                        
                        {/* 레벨 */}
                        <div className="w-24 text-center border-l border-gray-300 pl-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            변형
                          </span>
                        </div>
                        
                        {/* 옵션 */}
                        <div className="flex-1 text-center border-l border-gray-300 pl-2">
                        <div className="text-xs text-gray-600">
                          {variant.optionsJson ? (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {(() => {
                                const options = JSON.parse(variant.optionsJson);
                                return options.map((opt: Record<string, string>, index: number) => {
                                  // Parse option object like {"색상": "빨강"} or {"사이즈": "L"}
                                  const entries = Object.entries(opt as Record<string, string>);
                                  return entries.map(([key, value], entryIndex) => (
                                    <span key={`${index}-${entryIndex}`} className="inline-flex items-center">
                                      <span className="text-gray-500">{key}:</span>
                                      <span className="ml-1 font-medium text-gray-700">{value as string}</span>
                                      {index < options.length - 1 && entryIndex === entries.length - 1 && <span className="mx-1">·</span>}
                                    </span>
                                  ));
                                });
                              })()}
                            </div>
                          ) : (
                            <span className="text-gray-400">기본 변형</span>
                          )}
                        </div>
                      </div>
                      
                      {/* 재고 */}
                      <div className="flex-1 text-center border-l border-gray-300 pl-2">
                        <p className="text-sm font-medium">{variant.quantity || 0}개</p>
                      </div>
                      
                      {/* 가격 */}
                      <div className="flex-1 text-center border-l border-gray-300 pl-2">
                        <p className="text-sm font-medium">{variant.price?.toLocaleString()}원</p>
                      </div>
                      
                      {/* 비교가격 */}
                      <div className="flex-1 text-center border-l border-gray-300 pl-2">
                        {variant.compareAtPrice ? (
                          <p className="text-sm text-gray-400 line-through">
                            {variant.compareAtPrice.toLocaleString()}원
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </div>
                      
                      {/* 액션 */}
                      <div className="w-24 flex justify-center gap-1 border-l border-gray-300 pl-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1 h-6"
                          onClick={() => {
                            setSelectedVariant({
                              variant,
                              productName: product.name,
                              productId: product.id
                            });
                            setShowVariantEditModal(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1 h-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    </div>
                  );
                });
              }
              
              return rows;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {debouncedSearchTerm ? "검색 결과가 없습니다" : "상품이 없습니다"}
              </h3>
              <p className="text-gray-500">
                {debouncedSearchTerm 
                  ? `"${debouncedSearchTerm}"에 대한 검색 결과가 없습니다.`
                  : "새로운 상품을 등록해보세요"}
              </p>
              {debouncedSearchTerm && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  검색 초기화
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination - Always show */}
      <div className="flex justify-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
            disabled={pageNumber === 1}
          >
            이전
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">페이지</span>
            <span className="font-semibold text-gray-900">{pageNumber}</span>
            <span className="text-gray-600">/</span>
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))}
            disabled={pageNumber === totalPages}
          >
            다음
          </Button>
        </div>
      </div>

      {/* Variant Edit Modal */}
      <VariantEditModal
        variant={selectedVariant?.variant || null}
        productName={selectedVariant?.productName || ""}
        productId={selectedVariant?.productId || ""}
        open={showVariantEditModal}
        onOpenChange={setShowVariantEditModal}
        onSave={handleSaveVariant}
        isSaving={isSavingVariant}
      />
    </div>
  );
}
