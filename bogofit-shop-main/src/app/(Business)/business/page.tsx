"use client";

import { useState } from "react";
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
  BookOpen,
  CheckCircle,
  ArrowRight,
  Settings,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

export default function BusinessDashboard() {
  const { stats, loading: statsLoading } = useBusinessStats();
  const { orders, loading: ordersLoading } = useBusinessOrders();
  const [isGuideExpanded, setIsGuideExpanded] = useState(true);

  // 최근 주문 (최대 5개)
  const recentOrders = orders?.slice(0, 5) || [];

  // 가이드 단계 데이터
  const guideSteps = [
    {
      id: 1,
      title: "업체 정보 설정",
      description: "업체명, 로고, 사업자 정보를 입력하세요",
      icon: Settings,
      href: "/business/settings/brand",
      isCompleted: false, // 실제로는 API에서 확인 필요
      details: [
        "업체명과 업체 소개를 입력하세요",
        "업체 로고를 업로드하세요 (권장: 300x300px)",
        "사업자번호와 정산 계좌 정보를 입력하세요",
      ],
    },
    {
      id: 2,
      title: "첫 번째 상품 등록",
      description: "판매할 상품을 등록해보세요",
      icon: Package,
      href: "/business/products/new",
      isCompleted: false,
      details: [
        "상품 이미지를 업로드하세요 (최소 3장 권장)",
        "상품명, 가격, 상세 설명을 입력하세요",
        "카테고리와 배송 정보를 설정하세요",
        "상품을 활성화하여 판매를 시작하세요",
      ],
    },
    {
      id: 3,
      title: "주문 관리 확인",
      description: "들어온 주문을 확인하고 처리하세요",
      icon: ShoppingCart,
      href: "/business/orders",
      isCompleted: false,
      details: [
        "새로운 주문 알림을 확인하세요",
        "주문 상태를 업데이트하세요",
        "배송 정보를 입력하세요",
        "고객과의 소통을 관리하세요",
      ],
    },
    {
      id: 4,
      title: "매출 분석 활용",
      description: "매출 데이터를 분석하여 사업을 개선하세요",
      icon: BarChart3,
      href: "/business/analytics",
      isCompleted: false,
      details: [
        "일별/월별 매출 현황을 확인하세요",
        "인기 상품과 트렌드를 분석하세요",
        "고객 구매 패턴을 파악하세요",
        "마케팅 전략을 수립하세요",
      ],
    },
  ];

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

      {/* 시작하기 가이드 */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900">
                  시작하기 가이드
                </CardTitle>
                <p className="text-blue-700 text-sm">
                  단계별로 따라하며 비즈니스를 시작해보세요
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsGuideExpanded(!isGuideExpanded)}
              className="text-blue-600 hover:text-blue-800"
            >
              {isGuideExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {isGuideExpanded && (
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {guideSteps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={step.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`
                          w-12 h-12 rounded-lg flex items-center justify-center
                          ${
                            step.isCompleted
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }
                        `}
                        >
                          {step.isCompleted ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <IconComponent className="h-6 w-6" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-500">
                            STEP {step.id}
                          </span>
                          {step.isCompleted && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              완료
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {step.description}
                        </p>
                        <ul className="space-y-1 mb-4">
                          {step.details.map((detail, detailIndex) => (
                            <li
                              key={detailIndex}
                              className="flex items-start gap-2 text-xs text-gray-500"
                            >
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              {detail}
                            </li>
                          ))}
                        </ul>
                        <Button asChild size="sm" className="w-full">
                          <Link href={step.href}>
                            {step.isCompleted ? "다시 확인하기" : "시작하기"}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900 mb-1">
                    💡 성공적인 비즈니스를 위한 팁
                  </p>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>
                      • <strong>업체 정보</strong>는 고객에게 신뢰감을 주는 첫
                      번째 단계입니다
                    </li>
                    <li>
                      • <strong>상품 이미지</strong>는 판매에 가장 큰 영향을
                      미칩니다
                    </li>
                    <li>
                      • <strong>빠른 주문 처리</strong>는 고객 만족도를 높입니다
                    </li>
                    <li>
                      • <strong>정기적인 분석</strong>으로 매출을 개선할 수
                      있습니다
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

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
