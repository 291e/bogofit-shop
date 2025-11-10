"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BrandResponseDto } from "@/types/brand";
import { useAuth } from "@/providers/authProvider";
import BusinessSidebar from "@/components/(Business)/layout/BusinessSidebar";
import { useLanguage } from "@/providers/languageProvider";

// ✅ Brand Context 생성
interface BrandContextType {
  brand: BrandResponseDto;
  token: string;
  brandId: string;
}

const BrandContext = createContext<BrandContextType | null>(null);

export function useBrandContext() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrandContext must be used within BrandProvider');
  }
  return context;
}



export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
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
      setBrandError(t("header.business.brandDetail.authRequired"));
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
        throw new Error(data.message || t("header.business.brandDetail.cannotGetBrand"));
      }

      // ✅ API 응답 구조에 맞게 수정
      if (!data.success || !data.brand) {
        console.log('🔍 Brand data validation failed:', { success: data.success, hasBrand: !!data.brand });
        setBrandError(data.message || t("header.business.brandDetail.brandNotFound"));
        return;
      }

      const brandData: BrandResponseDto = data.brand;

      if (!brandData || !brandData.id) {
        setBrandError(t("header.business.brandDetail.brandNotFound"));
        return;
      }

      // Check if brand is approved
      if (brandData.status !== "approved") {
        setBrandError(t("header.business.brandDetail.approvedOnly"));
        return;
      }

      setBrand(brandData);
    } catch (error: unknown) {
      console.error('Brand access check error:', error);
      setBrandError((error as Error).message || t("header.business.brandDetail.errorCheckingBrand"));
    } finally {
      setIsLoadingBrand(false);
    }
  }, [brandId, token, t]);

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
          <p className="mt-4 text-gray-600">{t("header.business.brandDetail.checkingBrand")}</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("header.business.brandDetail.accessDenied")}</h2>
          <p className="text-gray-600 mb-6">
            {brandError || t("header.business.brandDetail.brandNotFound")}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/business/brands")}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("header.business.brandDetail.backToBrandList")}
            </Button>
            <Button
              onClick={() => checkBrandAccess()}
              variant="outline"
              className="w-full"
            >
              {t("header.business.brandDetail.retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrandContext.Provider value={{ brand: brand!, token: token!, brandId }}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <BusinessSidebar brandId={brandId} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
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
                            <span className="text-gray-500">{t("header.business.brandDetail.home")}</span>
                            <span className="text-gray-400">{'>'}</span>
                            <span className="text-gray-500">{t("header.business.brandDetail.business")}</span>
                            <span className="text-gray-400">{'>'}</span>
                            <span className="text-gray-900 font-medium">
                              {pathname.includes('/products/register') && t("header.business.brandDetail.breadcrumb.productRegister")}
                              {pathname.includes('/products/inventory') && t("header.business.brandDetail.breadcrumb.productInventory")}
                              {pathname.includes('/products') && !pathname.includes('/register') && !pathname.includes('/inventory') && t("header.business.brandDetail.breadcrumb.allProducts")}
                              {pathname.includes('/orders/completed') && t("header.business.brandDetail.breadcrumb.orderCompleted")}
                              {pathname.includes('/orders') && !pathname.includes('/completed') && t("header.business.brandDetail.breadcrumb.allOrders")}
                              {pathname.includes('/settings/shipping') && t("header.business.brandDetail.breadcrumb.shippingPolicy")}
                              {pathname.includes('/settings') && !pathname.includes('/shipping') && t("header.business.brandDetail.breadcrumb.companyInfo")}
                              {pathname.includes('/returns/cancel') && t("header.business.brandDetail.breadcrumb.cancelBeforePayment")}
                              {pathname.includes('/returns/refund') && t("header.business.brandDetail.breadcrumb.refundBeforeShipping")}
                              {pathname.includes('/settlement/analysis') && t("header.business.brandDetail.breadcrumb.orderAnalysis")}
                              {pathname.includes('/settlement/pending') && t("header.business.brandDetail.breadcrumb.settlementPending")}
                              {pathname.includes('/settlement/completed') && t("header.business.brandDetail.breadcrumb.settlementCompleted")}
                              {pathname.includes('/settlement/announcements') && t("header.business.brandDetail.breadcrumb.announcements")}
                              {pathname.includes('/settlement/faq') && t("header.business.brandDetail.breadcrumb.faq")}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/business/brands")}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            {t("header.business.brandDetail.brandList")}
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
