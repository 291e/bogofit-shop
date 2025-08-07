"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Store,
  Package,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  mockSalesData,
  mockSalesByStore,
  mockSalesByProduct,
  periodOptions,
  formatCurrency,
  formatNumber,
  formatPercent,
  getGrowthColor,
  getGrowthIcon,
} from "@/contents/Business/analyticsData";

export default function SalesAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // 총 매출 계산
  const totalRevenue = mockSalesData.reduce(
    (sum, data) => sum + data.revenue,
    0
  );
  const totalOrders = mockSalesData.reduce((sum, data) => sum + data.orders, 0);
  const averageOrderValue = totalRevenue / totalOrders;
  const currentPeriodGrowth =
    mockSalesData[mockSalesData.length - 1]?.growth || 0;

  // 최고 성과 매장
  const topStore = mockSalesByStore.reduce((max, store) =>
    store.revenue > max.revenue ? store : max
  );

  // 최고 성과 상품
  const topProduct = mockSalesByProduct.reduce((max, product) =>
    product.revenue > max.revenue ? product : max
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">매출 분석</h1>
          <p className="text-gray-600">매출 현황과 트렌드를 분석하세요</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            기간 설정
          </Button>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p
              className={`text-xs ${getGrowthColor(
                currentPeriodGrowth
              )} flex items-center`}
            >
              <span className="mr-1">{getGrowthIcon(currentPeriodGrowth)}</span>
              {formatPercent(Math.abs(currentPeriodGrowth))} vs 전월
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 주문수</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalOrders)}
            </div>
            <p className="text-xs text-muted-foreground">전 기간 누적</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 주문액</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Math.round(averageOrderValue))}
            </div>
            <p className="text-xs text-muted-foreground">건당 평균</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최고 매장</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{topStore.storeName}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(topStore.revenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기간별 매출 트렌드 */}
        <Card>
          <CardHeader>
            <CardTitle>기간별 매출 트렌드</CardTitle>
            <CardDescription>월별 매출 현황과 성장률</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSalesData.map((data) => (
                <div key={data.period} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{data.period}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {formatCurrency(data.revenue)}
                      </span>
                      <span
                        className={`text-xs ${getGrowthColor(
                          data.growth
                        )} flex items-center`}
                      >
                        {getGrowthIcon(data.growth)}
                        {formatPercent(Math.abs(data.growth))}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      (data.revenue /
                        Math.max(...mockSalesData.map((d) => d.revenue))) *
                      100
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>주문: {formatNumber(data.orders)}건</span>
                    <span>건당: {formatCurrency(data.averageOrderValue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 매장별 성과 */}
        <Card>
          <CardHeader>
            <CardTitle>매장별 성과</CardTitle>
            <CardDescription>매장별 매출 및 목표 달성률</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSalesByStore.map((store) => (
                <div key={store.storeId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {store.storeName}
                    </span>
                    <div className="text-right">
                      <div className="text-sm">
                        {formatCurrency(store.revenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        목표: {formatCurrency(store.target)}
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(store.achievement, 100)}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>주문: {formatNumber(store.orders)}건</span>
                    <span
                      className={`font-medium ${
                        store.achievement >= 100
                          ? "text-green-600"
                          : store.achievement >= 80
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPercent(store.achievement)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상품별 매출 상세 */}
      <Card>
        <CardHeader>
          <CardTitle>상품별 매출 분석</CardTitle>
          <CardDescription>상품별 매출 현황 및 성과</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상품명</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead className="text-right">매출액</TableHead>
                  <TableHead className="text-right">판매량</TableHead>
                  <TableHead className="text-right">평균 단가</TableHead>
                  <TableHead>매출 비중</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSalesByProduct.map((product) => {
                  const totalProductRevenue = mockSalesByProduct.reduce(
                    (sum, p) => sum + p.revenue,
                    0
                  );
                  const revenueShare =
                    (product.revenue / totalProductRevenue) * 100;

                  return (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(product.quantity)}개
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.averagePrice)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={revenueShare}
                            className="flex-1 h-2"
                          />
                          <span className="text-sm text-gray-500 min-w-12">
                            {formatPercent(revenueShare)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 성과 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-center">
            <Package className="h-8 w-8 mx-auto text-blue-600" />
            <CardTitle className="text-lg">최고 성과 상품</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-xl font-bold">{topProduct.productName}</div>
            <div className="text-sm text-gray-500">{topProduct.category}</div>
            <div className="text-lg text-blue-600 mt-2">
              {formatCurrency(topProduct.revenue)}
            </div>
            <div className="text-sm text-gray-500">
              {formatNumber(topProduct.quantity)}개 판매
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-green-600" />
            <CardTitle className="text-lg">성장률</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div
              className={`text-2xl font-bold ${getGrowthColor(
                currentPeriodGrowth
              )}`}
            >
              {getGrowthIcon(currentPeriodGrowth)}{" "}
              {formatPercent(Math.abs(currentPeriodGrowth))}
            </div>
            <div className="text-sm text-gray-500">전월 대비</div>
            <div className="text-sm text-gray-500 mt-2">
              {currentPeriodGrowth > 0
                ? "성장세 지속"
                : currentPeriodGrowth < 0
                ? "성장세 둔화"
                : "현상 유지"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Store className="h-8 w-8 mx-auto text-purple-600" />
            <CardTitle className="text-lg">매장 평균 달성률</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatPercent(
                mockSalesByStore.reduce(
                  (sum, store) => sum + store.achievement,
                  0
                ) / mockSalesByStore.length
              )}
            </div>
            <div className="text-sm text-gray-500">전체 매장 평균</div>
            <div className="text-sm text-gray-500 mt-2">
              {mockSalesByStore.filter((s) => s.achievement >= 100).length}개
              매장이 목표 달성
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
