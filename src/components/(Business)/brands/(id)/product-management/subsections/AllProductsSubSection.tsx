"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ProductResponseDto } from "@/types/product";
// import { useBrandContext } from "@/app/business/brands/[id]/layout"; // Unused
import { usePublicProducts } from "@/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import { PRODUCTS_QUERY_KEY, PRODUCT_DETAIL_QUERY_KEY } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/providers/authProvider";
import { useLanguage } from "@/providers/languageProvider";
import ProductDeleteConfirmModal from "./ProductForm/ProductDeleteConfirmModal";
import ProductDetailModal from "./ProductDetailModal";
import BulkPromotionAssign from "../components/BulkPromotionAssign";

import { BrandResponseDto } from "@/types/brand";

interface AllProductsSubSectionProps {
  brandId?: string;
  brand?: BrandResponseDto;
}

export default function AllProductsSubSection({
  brandId,
  brand
}: AllProductsSubSectionProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { getToken } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingProducts, setTogglingProducts] = useState<Set<string>>(new Set());
  const [deletingProducts, setDeletingProducts] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<ProductResponseDto | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductResponseDto | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Bulk promotion assign state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showBulkPromotionModal, setShowBulkPromotionModal] = useState(false);

  // Debounce search term to avoid spamming API
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setPageNumber(1);
    }
  }, [debouncedSearchTerm]);

  // ✅ Use public products API for consistent pagination/total
  const { data, isLoading, error } = usePublicProducts({
    pageNumber,
    pageSize: 10,
    brandId: brandId as string,
    isActive: true,
    reviews: true,
    searchKeyword: debouncedSearchTerm || undefined,
  });

  // ✅ Use query client for cache invalidation
  const queryClient = useQueryClient();

  // Extract products and pagination from response
  const products: ProductResponseDto[] = useMemo(() => {
    return Array.isArray(data?.data?.data)
      ? data.data.data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.products)
          ? data.products
          : [];
  }, [data]);

  // ✅ Debug: Log first product to see data structure
  useEffect(() => {
    if (products.length > 0) {
      console.log('🔍 First product data:', products[0]);
      console.log('🔍 Product status:', products[0].status);
      console.log('🔍 Product isActive:', products[0].isActive);
      console.log('🔍 Product promotion:', products[0].promotion);
      console.log('🔍 Product promotionId:', products[0].promotionId);
    }
  }, [products]);

  // Pagination is inside data.data, NOT data.pagination
  const totalPages = data?.data?.totalPages || data?.pagination?.totalPages || data?.totalPages || 1;
  const totalProducts = data?.data?.totalCount || data?.pagination?.totalCount || products.length;
  const currentPage = data?.data?.page || data?.pagination?.currentPage || pageNumber;

  // Debug logging
  console.log('🔍 AllProducts - pageNumber:', pageNumber, 'brandId:', brandId);
  console.log('📊 AllProducts - Pagination:', {
    totalPages,
    totalProducts,
    currentPage,
    productsCount: products.length
  });

  // No need for client-side filtering anymore - backend handles search
  const filteredProducts = products;

  const handleViewProduct = (product: ProductResponseDto) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleEditProduct = (product: ProductResponseDto) => {
    // Navigate to edit page with brand slug and product slug
    router.push(`/business/brands/${brand?.slug || brandId}/products/${product.slug || product.id}/edit`);
  };

  const handleRegisterClick = () => {
    router.push(`/business/brands/${brand?.slug || brandId}/products/register`);
  };

  // Bulk promotion handlers
  const handleSelectProduct = (productId: string) => {
    setSelectedProductIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleBulkPromotionSuccess = () => {
    setSelectedProductIds(new Set());
    queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, brandId] });
  };

  // ✅ Handle toggle isActive using custom mutation
  const handleToggleActive = async (productId: string, isActive: boolean) => {
    // Add to toggling set for loading state
    setTogglingProducts(prev => new Set(prev).add(productId));

    try {
      const token = getToken();
      if (!token) {
        toast.error(t("header.business.brandDetail.products.allProducts.loginRequired"));
        return;
      }

      // ✅ Use the same logic as useUpdateProduct hook
      const response = await fetch(`/api/product/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: 'Unknown error'
        }));

        // ✅ Debug: Log error response from backend
        console.log('🔍 Product Update Error Response:', {
          status: response.status,
          statusText: response.statusText,
          success: errorData.success,
          message: errorData.message,
          errorType: errorData.errorType,
          fullErrorData: errorData
        });

        // ✅ Check backend response format first
        if (errorData.success === false && errorData.message) {
          // Backend returned proper error format
          toast.error(errorData.message);
          return;
        }

        // ✅ Fallback to status code based errors
        if (response.status === 401) {
          toast.error('Invalid token - Please login again');
          return;
        }
        if (response.status === 403) {
          toast.error('Access denied - Contact administrator');
          return;
        }
        if (response.status === 404) {
          toast.error('Product not found');
          return;
        }
        if (response.status === 500) {
          toast.error('Server error - Please try again later');
          return;
        }

        // ✅ Generic error with backend message
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        toast.error(`Product status update failed: ${errorMessage}`);
        return;
      }

      const responseData = await response.json();

      // ✅ Debug: Log actual response from backend
      console.log('🔍 Product Update Response:', {
        success: responseData.success,
        message: responseData.message,
        data: responseData.data,
        fullResponse: responseData
      });

      // ✅ Check backend response format
      if (!responseData.success) {
        toast.error(responseData.message || 'Product status update failed');
        return;
      }

      // ✅ Use the same cache update logic as useUpdateProduct
      if (responseData.success && responseData.data) {
        // ✅ Invalidate and refetch the products query to get fresh data
        queryClient.invalidateQueries({
          queryKey: [...PRODUCTS_QUERY_KEY, brandId]
        });

        // ✅ Also invalidate the specific product detail query
        queryClient.invalidateQueries({
          queryKey: [...PRODUCT_DETAIL_QUERY_KEY, productId]
        });
      }

      // ✅ Show success toast
      toast.success(isActive
        ? t("header.business.brandDetail.products.allProducts.productActivated")
        : t("header.business.brandDetail.products.allProducts.productDeactivated"));

    } catch (error) {
      console.error('Error toggling product active status:', error);

      // ✅ Show specific error messages based on error type
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network connection error - Please check your connection');
      } else if (error instanceof Error) {
        if (error.message.includes('Authentication') || error.message.includes('token')) {
          toast.error('Invalid token - Please login again');
        } else if (error.message.includes('Access denied') || error.message.includes('권한')) {
          toast.error(t("header.business.brandDetail.products.allProducts.loginRequired"));
        } else {
          toast.error(`Product status update failed: ${error.message}`);
        }
      } else {
        toast.error('Unknown error occurred');
      }
    } finally {
      // Remove from toggling set
      setTogglingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleDeleteProduct = (product: ProductResponseDto) => {
    // Show delete confirmation modal instead of window.confirm
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    // Add to deleting set for loading state
    setDeletingProducts(prev => new Set(prev).add(productToDelete.id));

    try {
      const token = getToken();
      const response = await fetch(`/api/product/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(t("header.business.brandDetail.products.allProducts.productDeleted"));

        // ✅ Invalidate products list and product detail caches
        queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, brandId] });
        queryClient.invalidateQueries({ queryKey: [...PRODUCT_DETAIL_QUERY_KEY, productToDelete.id] });

        // Close modal
        setShowDeleteModal(false);
        setProductToDelete(null);
      } else {
        toast.error(data.message || t("header.business.brandDetail.products.allProducts.deleteFailed"));
      }
    } catch (error) {
      console.error('❌ Delete product error:', error);
      toast.error(t("header.business.brandDetail.products.allProducts.deleteFailed"));
    } finally {
      // Remove from deleting set
      setDeletingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productToDelete.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow`}>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">{t("header.business.brandDetail.products.allProducts.loading")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow`}>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="text-red-500 mb-2">{t("header.business.brandDetail.products.allProducts.error")}</div>
              <p className="text-gray-600 text-sm">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow`}>
      <div className="p-6">

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("header.business.brandDetail.products.allProducts.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="text-sm text-gray-600">
                {t("header.business.brandDetail.products.allProducts.totalProducts", { count: totalProducts })}
                {selectedProductIds.size > 0 && (
                  <span className="ml-2 text-purple-600 font-semibold">
                    ({selectedProductIds.size} {t("header.business.brandDetail.products.allProducts.selected")})
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {selectedProductIds.size > 0 && (
                <Button
                  onClick={() => setShowBulkPromotionModal(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {t("header.business.brandDetail.products.allProducts.bulkPromotion")} ({selectedProductIds.size})
                </Button>
              )}
              <Button onClick={handleRegisterClick}>{t("header.business.brandDetail.products.allProducts.register")}</Button>
            </div>
          </div>

          {!filteredProducts || filteredProducts.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-gray-500">
                {debouncedSearchTerm
                  ? t("header.business.brandDetail.products.allProducts.noSearchResults", { searchTerm: debouncedSearchTerm })
                  : t("header.business.brandDetail.products.allProducts.noProducts")}
              </p>
              {debouncedSearchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  {t("header.business.brandDetail.products.allProducts.resetSearch")}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {/* 헤더 */}
              <div className="flex items-center py-3 px-4 bg-gray-50 rounded-t-lg font-medium text-xs text-gray-600 border-2 border-gray-200">
                <div className="w-12 text-center border-r border-gray-300 pr-2">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer"
                  />
                </div>
                <div className="flex-1 text-center border-r border-gray-300 pr-2">{t("header.business.brandDetail.products.allProducts.sku")}</div>
                <div className="w-16 text-center border-r border-gray-300 pr-2">{t("header.business.brandDetail.products.allProducts.image")}</div>
                <div className="flex-[2] text-center border-r border-gray-300 pr-2">{t("header.business.brandDetail.products.allProducts.productName")}</div>
                <div className="w-24 text-center border-r border-gray-300 pr-2">{t("header.business.brandDetail.products.allProducts.status")}</div>
                <div className="w-20 text-center border-r border-gray-300 pr-2">{t("header.business.brandDetail.products.allProducts.active")}</div>
                <div className="w-32 text-center border-r border-gray-300 pr-2">{t("header.business.brandDetail.products.allProducts.promotion")}</div>
                <div className="w-28 text-center border-r border-gray-300 pr-2">{t("header.business.brandDetail.products.allProducts.basePrice")}</div>
                <div className="w-28 text-center border-r border-gray-300 pr-2">{t("header.business.brandDetail.products.allProducts.comparePrice")}</div>
                <div className="w-20 text-center border-r border-gray-300 pr-2">{t("header.business.brandDetail.products.allProducts.variants")}</div>
                <div className="w-32 text-center pl-2">{t("header.business.brandDetail.products.allProducts.actions")}</div>
              </div>

              {filteredProducts?.map((product, index) => (
                <div key={product.id} className={`border-l-2 border-r-2 border-b-2 border-gray-200 ${index === filteredProducts.length - 1 ? 'rounded-b-lg' : ''} hover:bg-gray-50 transition-colors cursor-pointer`} onClick={() => handleViewProduct(product)}>
                  <div className="flex items-center py-3 px-4">
                    {/* Checkbox */}
                    <div className="w-12 text-center border-r border-gray-300 pr-2">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer"
                      />
                    </div>
                    {/* 상품 SKU */}
                    <div className="flex-1 text-center border-r border-gray-300 pr-2">
                      <p className="text-xs font-mono text-gray-600 truncate">{product.sku}</p>
                    </div>

                    {/* 상품 이미지 */}
                    <div className="w-16 flex justify-center border-r border-gray-300 pr-2">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                        {product.thumbUrl ? (
                          <Image
                            src={product.thumbUrl}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="text-gray-400 text-xs">-</div>
                        )}
                      </div>
                    </div>

                    {/* 상품명 */}
                    <div className="flex-[2] text-center min-w-0 border-r border-gray-300 pr-2">
                      <h3 className="font-semibold text-xs truncate">{product.name}</h3>
                    </div>

                    {/* 상태 (Status) - READ ONLY */}
                    <div className="w-24 text-center border-r border-gray-300 pr-2">
                      {(() => {
                        const status = product.status;
                        console.log(`🔍 Product ${product.name} status:`, status, typeof status);

                        // Handle backend status: pending, approved, rejected, banned
                        if (status === 'approved') {
                          return (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                              {t("header.business.brandDetail.products.allProducts.statusApproved")}
                            </Badge>
                          );
                        }
                        if (status === 'pending') {
                          return (
                            <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                              {t("header.business.brandDetail.products.allProducts.statusPending")}
                            </Badge>
                          );
                        }
                        if (status === 'rejected') {
                          return (
                            <Badge variant="destructive" className="text-xs">
                              {t("header.business.brandDetail.products.allProducts.statusRejected")}
                            </Badge>
                          );
                        }
                        if (status === 'banned') {
                          return (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300 text-xs">
                              {t("header.business.brandDetail.products.allProducts.statusBanned")}
                            </Badge>
                          );
                        }

                        // Show actual status value if it exists but doesn't match expected values
                        if (status && status !== '') {
                          return (
                            <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                              {String(status)}
                            </Badge>
                          );
                        }

                        // Default case - no status
                        return (
                          <Badge variant="outline" className="text-gray-500 text-xs">
                            -
                          </Badge>
                        );
                      })()}
                    </div>

                    {/* 활성 (Active) - EDITABLE */}
                    <div className="w-20 text-center border-r border-gray-300 pr-2" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={product.isActive ?? true}
                        onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                        disabled={togglingProducts.has(product.id)}
                      />
                    </div>

                    {/* 프로모션 */}
                    <div className="w-32 text-center border-r border-gray-300 pr-2">
                      {product.promotion ? (
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5">
                            {product.promotion.name}
                          </Badge>
                          <span className="text-xs font-semibold text-purple-600">
                            {product.promotion.type === 'percentage'
                              ? `-${product.promotion.value}%`
                              : product.promotion.type === 'fixed_amount'
                                ? `-${product.promotion.value?.toLocaleString()}${t("header.business.brandDetail.products.allProducts.currency")}`
                                : t("header.business.brandDetail.products.allProducts.freeShipping")
                            }
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">{t("header.business.brandDetail.products.allProducts.none")}</span>
                      )}
                    </div>

                    {/* 기본 가격 */}
                    <div className="w-28 text-center border-r border-gray-300 pr-2">
                      {product.finalPrice && product.finalPrice < product.basePrice ? (
                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-purple-600">{product.finalPrice.toLocaleString()}{t("header.business.brandDetail.products.allProducts.currency")}</p>
                          <p className="text-[10px] text-gray-400 line-through">{product.basePrice.toLocaleString()}{t("header.business.brandDetail.products.allProducts.currency")}</p>
                        </div>
                      ) : (
                        <p className="text-xs font-medium">{product.basePrice.toLocaleString()}{t("header.business.brandDetail.products.allProducts.currency")}</p>
                      )}
                    </div>

                    {/* 비교 가격 */}
                    <div className="w-28 text-center border-r border-gray-300 pr-2">
                      {product.baseCompareAtPrice ? (
                        <p className="text-xs text-gray-400 line-through">
                          {product.baseCompareAtPrice.toLocaleString()}{t("header.business.brandDetail.products.allProducts.currency")}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">-</p>
                      )}
                    </div>

                    {/* 변형 수 */}
                    <div className="w-20 text-center border-r border-gray-300 pr-2">
                      <p className="text-xs">{product.variants?.length || 0} {t("header.business.brandDetail.products.allProducts.items")}</p>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="w-32 flex justify-center gap-1 pl-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                      >
                        {t("header.business.brandDetail.products.allProducts.edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product);
                        }}
                        disabled={deletingProducts.has(product.id)}
                      >
                        {deletingProducts.has(product.id) ? t("header.business.brandDetail.products.allProducts.deleting") : t("header.business.brandDetail.products.allProducts.delete")}
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6">
                        {t("header.business.brandDetail.products.allProducts.copy")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination - Always show */}
          <div className="flex justify-center mt-6 border-t pt-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('⬅️ Prev clicked, current page:', pageNumber);
                  setPageNumber(prev => {
                    const newPage = Math.max(1, prev - 1);
                    console.log('⬅️ New page:', newPage);
                    return newPage;
                  });
                }}
                disabled={pageNumber === 1}
              >
                {t("header.business.brandDetail.products.allProducts.previous")}
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">{t("header.business.brandDetail.products.allProducts.page")}</span>
                <span className="font-semibold text-gray-900">{pageNumber}</span>
                <span className="text-gray-600">/</span>
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('➡️ Next clicked, current page:', pageNumber);
                  setPageNumber(prev => {
                    const newPage = Math.min(totalPages, prev + 1);
                    console.log('➡️ New page:', newPage);
                    return newPage;
                  });
                }}
                disabled={pageNumber === totalPages}
              >
                {t("header.business.brandDetail.products.allProducts.next")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Delete Confirmation Modal */}
      <ProductDeleteConfirmModal
        product={productToDelete}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={confirmDeleteProduct}
        isDeleting={productToDelete ? deletingProducts.has(productToDelete.id) : false}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        brandId={brandId}
        brand={brand}
      />

      {/* Bulk Promotion Assign Modal */}
      {showBulkPromotionModal && (
        <BulkPromotionAssign
          selectedProductIds={Array.from(selectedProductIds)}
          brandId={brandId || ""}
          onClose={() => setShowBulkPromotionModal(false)}
          onSuccess={handleBulkPromotionSuccess}
        />
      )}
    </div>
  );
}
