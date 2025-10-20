"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/authProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderSection from "@/components/(Public)/myPage/components/OrderSection";
import CouponSection from "@/components/(Public)/myPage/components/CouponSection";
import AddressSection from "@/components/(Public)/myPage/components/AddressSection";
import RecentProductsSection from "@/components/(Public)/myPage/components/RecentProductsSection";
import ProfileSection from "@/components/(Public)/myPage/components/ProfileSection";
import { Clock, Ticket, MapPin, User } from "lucide-react";





function MyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("order");

  // Addresses will be loaded by AddressSection component when needed

  useEffect(() => {
    const section = searchParams.get("section");
    if (section) {
      setActiveTab(section);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-16 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Left Sidebar Navigation */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-2">
                  {/* 나의 쇼핑 정보 */}
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      나의 쇼핑 정보
                    </h3>
                  </div>
                  <div className="px-4 py-2">
                    <button
                      onClick={() => setActiveTab("order")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === "order"
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                      <span>주문 내역 조회</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("coupon")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === "coupon"
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Ticket className="w-5 h-5" />
                      <span>쿠폰 내역</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("address")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === "address"
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <MapPin className="w-5 h-5" />
                      <span>배송 주소록 관리</span>
                    </button>
                  </div>

                  {/* 활동 정보 */}
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      활동 정보
                    </h3>
                  </div>
                  <div className="px-4 py-2">
                    <button
                      onClick={() => setActiveTab("recent")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === "recent"
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                      <span>최근 본 상품</span>
                    </button>
                  </div>

                  {/* 나의 정보 */}
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      나의 정보
                    </h3>
                  </div>
                  <div className="px-4 py-2">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === "profile"
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span>회원 정보 수정</span>
                    </button>
                  </div>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {activeTab === "order" && "주문 내역 조회"}
                  {activeTab === "coupon" && "쿠폰 내역"}
                  {activeTab === "address" && "배송 주소록 관리"}
                  {activeTab === "recent" && "최근 본 상품"}
                  {activeTab === "profile" && "회원 정보 수정"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === "order" && <OrderSection />}
                {activeTab === "coupon" && <CouponSection />}
                {activeTab === "address" && <AddressSection />}
                {activeTab === "recent" && <RecentProductsSection />}
                {activeTab === "profile" && <ProfileSection />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <MyPageContent />
    </Suspense>
  );
}

