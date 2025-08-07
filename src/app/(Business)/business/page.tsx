"use client";

import { useBusinessStats, useBusinessOrders } from "@/hooks/useBusiness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Eye,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function BusinessDashboard() {
  const { stats, loading: statsLoading } = useBusinessStats();
  const { orders, loading: ordersLoading } = useBusinessOrders();

  // 최근 주문 (최대 5개)
  const recentOrders = orders?.slice(0, 5) || [];

  if (statsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">비즈니스 현황을 한눈에 확인하세요</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/business/products/new">
              <Plus className="h-4 w-4 mr-2" />
              상품 등록
            </Link>
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{stats?.totalRevenue?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              이번 달: ₩{stats?.monthlyRevenue?.toLocaleString() || "0"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 주문</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              이번 달: {stats?.monthlyOrders || 0}건
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">등록 상품</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground">활성 상품</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 주문</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">처리 필요</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 주문 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>최근 주문</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/business/orders">
                <Eye className="h-4 w-4 mr-2" />
                전체 보기
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{order.businessOrderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₩{order.totalAmount.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "SHIPPED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status === "PENDING" && "주문접수"}
                        {order.status === "CONFIRMED" && "주문확인"}
                        {order.status === "PROCESSING" && "상품준비중"}
                        {order.status === "SHIPPED" && "발송완료"}
                        {order.status === "DELIVERED" && "배송완료"}
                        {order.status === "CANCELLED" && "취소"}
                        {order.status === "RETURNED" && "반품"}
                        {order.status === "REFUNDED" && "환불완료"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  아직 주문이 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/business/products/new">
                  <Package className="h-6 w-6" />
                  상품 등록
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/business/orders">
                  <ShoppingCart className="h-6 w-6" />
                  주문 관리
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/business/analytics">
                  <BarChart3 className="h-6 w-6" />
                  매출 분석
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/business/settings">
                  <TrendingUp className="h-6 w-6" />
                  설정
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 알림 및 공지사항 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 및 공지사항</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  새로운 상품 승인 가이드라인
                </p>
                <p className="text-sm text-blue-700">
                  상품 등록 시 새로운 가이드라인이 적용됩니다. 자세한 내용을
                  확인해보세요.
                </p>
                <p className="text-xs text-blue-600 mt-1">2시간 전</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">
                  정산 시스템 업데이트
                </p>
                <p className="text-sm text-green-700">
                  정산 시스템이 업데이트되어 더욱 빠르고 정확한 정산이
                  가능합니다.
                </p>
                <p className="text-xs text-green-600 mt-1">1일 전</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
