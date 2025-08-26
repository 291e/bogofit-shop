"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, TrendingUp } from "lucide-react";

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

interface AdminDashboardProps {
  dashboardStats: DashboardStats;
}

export default function AdminDashboard({
  dashboardStats,
}: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.summary.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              최근 7일: +{dashboardStats.summary.recentUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 상품</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.summary.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              승인 대기: {dashboardStats.productStats.pending}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 주문</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.summary.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              최근 7일: +{dashboardStats.summary.recentOrders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{dashboardStats.orderStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              브랜드: {dashboardStats.summary.totalBrands}개
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 상태별 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>사용자 유형별</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>일반 사용자</span>
              <span className="font-medium">
                {dashboardStats.userStats.regular}
              </span>
            </div>
            <div className="flex justify-between">
              <span>사업자</span>
              <span className="font-medium">
                {dashboardStats.userStats.business}
              </span>
            </div>
            <div className="flex justify-between">
              <span>관리자</span>
              <span className="font-medium">
                {dashboardStats.userStats.admin}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>상품 상태별</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>승인 대기</span>
              <span className="font-medium">
                {dashboardStats.productStats.pending}
              </span>
            </div>
            <div className="flex justify-between">
              <span>승인 완료</span>
              <span className="font-medium">
                {dashboardStats.productStats.approved}
              </span>
            </div>
            <div className="flex justify-between">
              <span>거부</span>
              <span className="font-medium">
                {dashboardStats.productStats.rejected}
              </span>
            </div>
            <div className="flex justify-between">
              <span>임시 저장</span>
              <span className="font-medium">
                {dashboardStats.productStats.draft}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주문 상태별</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>결제 대기</span>
              <span className="font-medium">
                {dashboardStats.orderStats.pending}
              </span>
            </div>
            <div className="flex justify-between">
              <span>결제 완료</span>
              <span className="font-medium">
                {dashboardStats.orderStats.paid}
              </span>
            </div>
            <div className="flex justify-between">
              <span>배송 중</span>
              <span className="font-medium">
                {dashboardStats.orderStats.shipping}
              </span>
            </div>
            <div className="flex justify-between">
              <span>완료</span>
              <span className="font-medium">
                {dashboardStats.orderStats.completed}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
