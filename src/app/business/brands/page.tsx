
"use client";
import { useAuth } from "@/providers/authProvider";
import { BrandResponseDto } from "@/types/brand";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { useBrands } from "@/hooks/useBrands";
import ApplicationRegister from "@/components/(Business)/brands/components/ApplicationRegister";
import ApplicationView from "@/components/(Business)/brands/components/ApplicationView";
import BrandRegister from "@/components/(Business)/brands/components/BrandRegister";
import DashboardSection from "@/components/(Business)/brands/components/DashboardSection";
import BrandListSection from "@/components/(Business)/brands/components/BrandListSection";


export default function BrandsPage() {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showApplicationView, setShowApplicationView] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [isEditingApplication, setIsEditingApplication] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // ✅ Use React Query for application data
  const { data: applicationData, isLoading: isCheckingApplication } = useApplication();
  
  // ✅ Use React Query for brands data
  const { data: brandsData, isLoading: isLoadingBrands, error: brandsError, refetch: refetchBrands } = useBrands(applicationData?.application?.id);

  // ✅ Hydration 체크
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check authentication and show appropriate modals
  useEffect(() => {
    if (!isHydrated) return; // ✅ Hydration 완료 후에만 실행
        
    // ✅ Chỉ check auth khi AuthProvider đã load xong
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      router.replace("/business");
      return;
    }

    // ✅ Chỉ run khi đã load xong data (không loading và có data hoặc error)
    if (isCheckingApplication) return;

    // ✅ Chỉ bật modal khi đã có kết quả từ API
    if (applicationData) {
      // ✅ Thêm delay nhỏ để user thấy loading state
      const timer = setTimeout(() => {
        if (!applicationData.application) {
          // No application → Show register form
          setShowApplicationModal(true);
        } else if (applicationData.application.status === "rejected") {
          // Rejected → Show view to see reason
          setShowApplicationView(true);
        } else if (applicationData.application.status === "banned") {
          // Banned → Show register form
          setShowApplicationModal(true);
        }
        // If status is "approved" or "pending" → Don't show modal
      }, 500); // 500ms delay

      return () => clearTimeout(timer);
    }
  }, [isHydrated, isCheckingApplication, applicationData, router, isAuthenticated, authLoading]);

  const handleApplicationSuccess = () => {
    setShowApplicationModal(false);
    // ✅ No need to refetch - data is already updated via optimistic update
    // React Query cache is automatically updated
  };

  const handleCreateBrand = () => {
    setShowBrandModal(prev => !prev);
  };

  const handleBrandSuccess = () => {
    setShowBrandModal(false);
    // ✅ No need to manual refetch - React Query handles it automatically
  };

  const handleViewBrand = (brand: BrandResponseDto) => {
    // Only allow viewing approved brands
    if (brand.status !== "approved") {
      return;
    }
    // Navigate to brand detail page
    router.push(`/business/brands/${brand.id}`);
  };


  // ✅ Hydration 완료 전에는 기본 구조로 렌더링
  if (!isHydrated || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {!isHydrated ? "로딩 중..." : "인증 확인 중..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ 인증되지 않은 사용자는 리다이렉트 중
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">리다이렉트 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isCheckingApplication) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">애플리케이션 상태 확인 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <DashboardSection
          applicationData={applicationData || null}
          onShowApplicationView={() => setShowApplicationView(prev => !prev)}
          onShowApplicationModal={() => setShowApplicationModal(true)}
          onCreateBrand={handleCreateBrand}
        />
        
        {/* Brand List Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              브랜드 목록
            </h2>
            <p className="text-lg text-gray-600">
              등록된 브랜드들을 확인하세요
            </p>
          </div>
          
          {isLoadingBrands ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">브랜드 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : brandsError ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 text-xl mb-4">❌</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
                <p className="text-gray-600 mb-4">{brandsError.message}</p>
                <button 
                  onClick={() => refetchBrands()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  다시 시도
                </button>
              </div>
            </div>
          ) : (
            <BrandListSection 
              brands={brandsData?.brands || []}
              onViewBrand={handleViewBrand} 
            />
          )}
        </div>
      </main>

      <ApplicationRegister 
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setIsEditingApplication(false);
        }}
        onSuccess={handleApplicationSuccess}
        applicationStatus={applicationData?.application ? 
          (applicationData.application.status === "rejected" ? "rejected" : 
           applicationData.application.status === "banned" ? "banned" : "none") : "none"}
        existingApplication={isEditingApplication ? applicationData : null}
      />

      <ApplicationView 
        isOpen={showApplicationView}
        onClose={() => setShowApplicationView(false)}
        application={applicationData || null}
        onEdit={() => {
          setShowApplicationView(false);
          setIsEditingApplication(true);
          setShowApplicationModal(true);
        }}
      />

      <BrandRegister 
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSuccess={handleBrandSuccess}
        applicationId={applicationData?.application?.id}
      />
    </div>
  );
}
