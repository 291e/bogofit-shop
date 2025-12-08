"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BrandResponseDto } from "@/types/brand";
import { useAuth } from "@/providers/authProvider";
import BusinessSidebar from "@/components/(Business)/layout/BusinessSidebar";
import BusinessHeader from "@/components/(Business)/layout/BusinessHeader";
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
  const paramValue = params.slug as string;

  // Brand status check
  const [brand, setBrand] = useState<BrandResponseDto | null>(null);
  const [isLoadingBrand, setIsLoadingBrand] = useState(true);
  const [brandError, setBrandError] = useState<string | null>(null);

  // Helper function to check if param is UUID (ID) or slug
  const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const checkBrandAccess = useCallback(async () => {
    if (!token) {
      setBrandError(t("header.business.brandDetail.authRequired"));
      setIsLoadingBrand(false);
      return;
    }

    try {
      // Determine if we're using ID or slug
      const isId = isUUID(paramValue);
      const apiUrl = isId
        ? `/api/brand?id=${paramValue}`
        : `/api/brand?slug=${paramValue}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🔍 Brand API Response:', { status: response.status, data, isId });

      if (!response.ok) {
        throw new Error(data.message || t("header.business.brandDetail.cannotGetBrand"));
      }

      // Handle response - both ID and Slug now return { brand: ... }

      if (!data.success || !data.brand) {
        console.log('🔍 Brand data validation failed:', { success: data.success, hasBrand: !!data.brand });
        setBrandError(data.message || t("header.business.brandDetail.brandNotFound"));
        return;
      }
      const brandData = data.brand;

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
  }, [paramValue, token, t]);

  // Check brand access on mount and when token changes
  useEffect(() => {
    console.log('🔍 Layout useEffect triggered - paramValue:', paramValue, 'token:', !!token);
    if (paramValue) {
      checkBrandAccess();
    }
  }, [paramValue, token, checkBrandAccess]);

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
    <BrandContext.Provider value={{ brand: brand!, token: token!, brandId: brand.id }}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <BusinessSidebar brandSlug={brand.slug} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <BusinessHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </BrandContext.Provider>
  );
}
