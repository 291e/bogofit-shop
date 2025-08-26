"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Shield } from "lucide-react";
import { toast } from "sonner";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminProductManagement from "@/components/admin/AdminProductManagement";
import AdminOrderManagement from "@/components/admin/AdminOrderManagement";
import Link from "next/link";

interface DashboardStats {
  summary: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalBrands: number;
    recentUsers: number;
    recentOrders: number;
  };
  productStats: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
  orderStats: {
    pending: number;
    paid: number;
    shipping: number;
    completed: number;
    canceled: number;
    failed: number;
    totalRevenue: number;
  };
  brandStats: {
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
  userStats: {
    regular: number;
    business: number;
    admin: number;
  };
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("dashboard");

  // 권한 체크
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (!user?.isAdmin) {
      toast.error("관리자 권한이 필요합니다");
      window.location.href = "/";
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("대시보드 데이터 조회 실패");
      }

      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error("대시보드 데이터 조회 오류:", error);
      toast.error("대시보드 데이터를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">관리자 페이지 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Home className="h-5 w-5 text-blue-600" />
          </Link>
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-gray-600">BogoFit 시스템 관리</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-medium">
            {String(user?.name || "사용자")} (관리자)
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">대시보드</TabsTrigger>
          <TabsTrigger value="users">사용자 관리</TabsTrigger>
          <TabsTrigger value="products">상품 관리</TabsTrigger>
          <TabsTrigger value="orders">주문 관리</TabsTrigger>
        </TabsList>

        {/* 대시보드 탭 */}
        <TabsContent value="dashboard" className="space-y-6">
          {dashboardStats && <AdminDashboard dashboardStats={dashboardStats} />}
        </TabsContent>

        {/* 사용자 관리 탭 */}
        <TabsContent value="users" className="space-y-6">
          <AdminUserManagement currentUserId={user?.id} />
        </TabsContent>

        {/* 상품 관리 탭 */}
        <TabsContent value="products" className="space-y-6">
          <AdminProductManagement />
        </TabsContent>

        {/* 주문 관리 탭 */}
        <TabsContent value="orders" className="space-y-6">
          <AdminOrderManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
