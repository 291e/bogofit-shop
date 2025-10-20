"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BrandResponseDto } from "@/types/brand";
import { useAuth } from "@/providers/authProvider";
import BusinessSidebar from "@/components/(Business)/layout/BusinessSidebar";

// ✅ Brand Context 생성
interface BrandContextType {
  brand: BrandResponseDto;
  token: string;
  brandId: string;
}

const BrandContext = createContext<BrandContextType | null>(null);

export const useBrandContext = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrandContext must be used within BrandProvider');
  }
  return context;
};


export default function BrandLayout({
  children, 
}: {
  children: React.ReactNode;  
}) {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const brandId = params.id as string;

  // Brand status check
  const [brand, setBrand] = useState<BrandResponseDto | null>(null);
  const [isLoadingBrand, setIsLoadingBrand] = useState(true);
  const [brandError, setBrandError] = useState<string | null>(null);


  const checkBrandAccess = useCallback(async () => {
    if (!token) {
      setBrandError("인증이 필요합니다.");
      setIsLoadingBrand(false);
      return;
    }

    try {
      const response = await fetch(`/api/brand/${brandId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🔍 Brand API Response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.message || '브랜드 정보를 가져올 수 없습니다.');
      }

      // ✅ API 응답 구조에 맞게 수정
      if (!data.success || !data.brand) {
        console.log('🔍 Brand data validation failed:', { success: data.success, hasBrand: !!data.brand });
        setBrandError(data.message || "브랜드 정보를 찾을 수 없습니다.");
        return;
      }

      const brandData: BrandResponseDto = data.brand;

      if (!brandData || !brandData.id) {
        setBrandError("브랜드 정보를 찾을 수 없습니다.");
        return;
      }

      // Check if brand is approved
      if (brandData.status !== "approved") {
        setBrandError("승인된 브랜드만 접근할 수 있습니다.");
        return;
      }

      setBrand(brandData);
            } catch (error: unknown) {
      console.error('Brand access check error:', error);
      setBrandError((error as Error).message || "브랜드 정보를 확인하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingBrand(false);
    }
  }, [brandId, token]);

  // Check brand access on mount and when token changes
  useEffect(() => {
    console.log('🔍 Layout useEffect triggered - brandId:', brandId, 'token:', !!token);
    if (brandId) {
      checkBrandAccess();
    }
  }, [brandId, token, checkBrandAccess]);

  // Show loading state while checking brand access
  if (isLoadingBrand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">브랜드 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // Show error state if brand access is denied
  if (brandError || !brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 불가</h2>
          <p className="text-gray-600 mb-6">
            {brandError || "브랜드 정보를 찾을 수 없습니다."}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/business/brands")}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              브랜드 목록으로 돌아가기
            </Button>
            <Button
              onClick={() => checkBrandAccess()}
              variant="outline"
              className="w-full"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrandContext.Provider value={{ brand: brand!, token: token!, brandId }}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <BusinessSidebar brandId={brandId} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Content Frame */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="max-w-full mx-auto">
                {/* Breadcrumb */}
                {pathname !== `/business/brands/${brandId}` && (
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="border-b border-red-200">
                    <div className="px-6 py-4">
                      <nav className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-500">HOME</span>
                          <span className="text-gray-400">{'>'}</span>
                          <span className="text-gray-500">비즈니스</span>
                          <span className="text-gray-400">{'>'}</span>
                          <span className="text-gray-900 font-medium">
                            {pathname.includes('/products/register') && '상품 등록'}
                            {pathname.includes('/products/inventory') && '상품 재고관리'}
                            {pathname.includes('/products') && !pathname.includes('/register') && !pathname.includes('/inventory') && '전체 상품관리'}
                            {pathname.includes('/orders/completed') && '입금완료(배송요청)'}
                            {pathname.includes('/orders') && !pathname.includes('/completed') && '주문리스트(전체)'}
                            {pathname.includes('/settings/shipping') && '업체 배송정책'}
                            {pathname.includes('/settings') && !pathname.includes('/shipping') && '업체 정보관리'}
                            {pathname.includes('/returns/cancel') && '입금전 취소'}
                            {pathname.includes('/returns/refund') && '배송전 환불'}
                            {pathname.includes('/settlement/pending') && '정산대기목록'}
                            {pathname.includes('/settlement') && !pathname.includes('/pending') && '주문통계분석'}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push("/business/brands")}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          브랜드 목록
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}

                {/* Dynamic Content */}
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrandContext.Provider>
  );
}
