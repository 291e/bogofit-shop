"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ProductResponseDto } from "@/types/product";
// import { useBrandContext } from "@/app/business/brands/[id]/layout"; // Unused
import { useProducts } from "@/hooks/useProducts";
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

interface AllProductsSubSectionProps {
  brandId?: string;
}

export default function AllProductsSubSection({ 
  brandId 
}: AllProductsSubSectionProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingProducts, setTogglingProducts] = useState<Set<string>>(new Set());
  
  // Debounce search term to avoid spamming API
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Reset to page 1 when search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setPageNumber(1);
    }
  }, [debouncedSearchTerm]);
  
  // ✅ Use React Query for products with backend search
  const { data, isLoading, error } = useProducts(brandId, pageNumber, debouncedSearchTerm);
  
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

  const handleEditProduct = (product: ProductResponseDto) => {
    // Navigate to edit page with product ID
    router.push(`/business/brands/${brandId}/products/${product.id}/edit`);
  };

  const handleRegisterClick = () => {
    router.push(`/business/brands/${brandId}/products/register`);
  };

  // ✅ Handle toggle isActive using custom mutation
  const handleToggleActive = async (productId: string, isActive: boolean) => {
    // Add to toggling set for loading state
    setTogglingProducts(prev => new Set(prev).add(productId));
    
    try {
      const token = getToken();
      if (!token) {
        toast.error('로그인이 필요합니다.');
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
      toast.success(`상품이 ${isActive ? '활성화' : '비활성화'}되었습니다.`);
      
    } catch (error) {
      console.error('Error toggling product active status:', error);
      
      // ✅ Show specific error messages based on error type
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network connection error - Please check your connection');
      } else if (error instanceof Error) {
        if (error.message.includes('Authentication') || error.message.includes('token')) {
          toast.error('Invalid token - Please login again');
        } else if (error.message.includes('Access denied') || error.message.includes('권한')) {
          toast.error('Access denied - Contact administrator');
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
    // Navigate to delete confirmation page
    router.push(`/business/brands/${brandId}/products/${product.id}/delete`);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow`}>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">상품 목록을 불러오는 중...</p>
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
              <div className="text-red-500 mb-2">오류가 발생했습니다</div>
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
                  placeholder="상품명, SKU, 슬러그로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="text-sm text-gray-600">
                총 <span className="font-semibold text-gray-900">{totalProducts}</span>개 상품
              </div>
            </div>
            <Button onClick={handleRegisterClick}>상품 등록</Button>
          </div>
          
          {!filteredProducts || filteredProducts.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-gray-500">
                {debouncedSearchTerm 
                  ? `"${debouncedSearchTerm}"에 대한 검색 결과가 없습니다.` 
                  : "등록된 상품이 없습니다."}
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
          ) : (
            <div className="space-y-0">
              {/* 헤더 */}
              <div className="flex items-center py-3 px-4 bg-gray-50 rounded-t-lg font-medium text-xs text-gray-600 border-2 border-gray-200">
                <div className="flex-1 text-center border-r border-gray-300 pr-2">상품 SKU</div>
                <div className="w-16 text-center border-r border-gray-300 pr-2">이미지</div>
                <div className="flex-[2] text-center border-r border-gray-300 pr-2">상품명</div>
                <div className="w-24 text-center border-r border-gray-300 pr-2">상태</div>
                <div className="w-20 text-center border-r border-gray-300 pr-2">활성</div>
                <div className="w-28 text-center border-r border-gray-300 pr-2">기본 가격</div>
                <div className="w-28 text-center border-r border-gray-300 pr-2">비교 가격</div>
                <div className="w-20 text-center border-r border-gray-300 pr-2">변형 수</div>
                <div className="w-32 text-center pl-2">액션</div>
              </div>
              
              {filteredProducts?.map((product, index) => (
                <div key={product.id} className={`border-l-2 border-r-2 border-b-2 border-gray-200 ${index === filteredProducts.length - 1 ? 'rounded-b-lg' : ''} hover:bg-gray-50 transition-colors`}>
                  <div className="flex items-center py-3 px-4">
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
                              승인완료
                            </Badge>
                          );
                        }
                        if (status === 'pending') {
                          return (
                            <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                              대기중
                            </Badge>
                          );
                        }
                        if (status === 'rejected') {
                          return (
                            <Badge variant="destructive" className="text-xs">
                              거부됨
                            </Badge>
                          );
                        }
                        if (status === 'banned') {
                          return (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300 text-xs">
                              차단됨
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
                    <div className="w-20 text-center border-r border-gray-300 pr-2">
                      <Switch
                        checked={product.isActive ?? true}
                        onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                        disabled={togglingProducts.has(product.id)}
                      />
                    </div>
                    
                    {/* 기본 가격 */}
                    <div className="w-28 text-center border-r border-gray-300 pr-2">
                      <p className="text-xs font-medium">{product.basePrice.toLocaleString()}원</p>
                    </div>
                    
                    {/* 비교 가격 */}
                    <div className="w-28 text-center border-r border-gray-300 pr-2">
                      {product.baseCompareAtPrice ? (
                        <p className="text-xs text-gray-400 line-through">
                          {product.baseCompareAtPrice.toLocaleString()}원
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">-</p>
                      )}
                    </div>
                    
                    {/* 변형 수 */}
                    <div className="w-20 text-center border-r border-gray-300 pr-2">
                      <p className="text-xs">{product.variants?.length || 0}개</p>
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="w-32 flex justify-center gap-1 pl-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs px-2 py-1 h-6"
                        onClick={() => handleEditProduct(product)}
                      >
                        편집
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs px-2 py-1 h-6"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        삭제
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6">
                        복사
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
                다음
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
