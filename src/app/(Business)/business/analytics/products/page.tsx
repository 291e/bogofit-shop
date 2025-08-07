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
import { Badge } from "@/components/ui/badge";
import {
  Package,
  TrendingUp,
  Star,
  RotateCcw,
  DollarSign,
  Target,
  Filter,
} from "lucide-react";
import {
  mockProductPerformance,
  mockCategoryAnalysis,
  periodOptions,
  formatCurrency,
  formatNumber,
  formatPercent,
  getGrowthColor,
  getGrowthIcon,
} from "@/contents/Business/analyticsData";

export default function ProductAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 카테고리 목록
  const categories = [
    "all",
    ...Array.from(new Set(mockProductPerformance.map((p) => p.category))),
  ];

  // 필터링된 상품 데이터
  const filteredProducts =
    selectedCategory === "all"
      ? mockProductPerformance
      : mockProductPerformance.filter((p) => p.category === selectedCategory);

  // 핵심 지표 계산
  const totalProducts = filteredProducts.length;
  const totalSales = filteredProducts.reduce((sum, p) => sum + p.totalSales, 0);
  const totalQuantity = filteredProducts.reduce(
    (sum, p) => sum + p.quantitySold,
    0
  );
  const averageRating =
    filteredProducts.reduce((sum, p) => sum + p.rating, 0) /
    filteredProducts.length;
  const averageStockTurnover =
    filteredProducts.reduce((sum, p) => sum + p.stockTurnover, 0) /
    filteredProducts.length;

  // 최고 성과 상품
  const topProduct = filteredProducts.reduce((max, product) =>
    product.totalSales > max.totalSales ? product : max
  );

  // 재고 회전율이 가장 높은 상품
  const fastestTurnover = filteredProducts.reduce((max, product) =>
    product.stockTurnover > max.stockTurnover ? product : max
  );

  // 수익률이 가장 높은 상품
  const highestMargin = filteredProducts.reduce((max, product) =>
    product.profitMargin > max.profitMargin ? product : max
  );

  // 재고 상태별 분류
  const getStockStatus = (current: number, sold: number) => {
    const turnover = sold / (current + sold);
    if (turnover > 0.8) return "high";
    if (turnover > 0.5) return "medium";
    return "low";
  };

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case "high":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            회전 빠름
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            회전 보통
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            회전 느림
          </Badge>
        );
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  const getPerformanceGrade = (rating: number) => {
    if (rating >= 4.5) return "A+";
    if (rating >= 4.0) return "A";
    if (rating >= 3.5) return "B";
    if (rating >= 3.0) return "C";
    return "D";
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상품 분석</h1>
          <p className="text-gray-600">상품 성과와 트렌드를 분석하세요</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="기간" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "전체" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            필터
          </Button>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">분석 상품수</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {selectedCategory === "all"
                ? "전체 상품"
                : `${selectedCategory} 카테고리`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(totalQuantity)}개 판매
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {averageRating.toFixed(1)}
              <Star className="h-4 w-4 ml-1 text-yellow-500 fill-current" />
            </div>
            <p className="text-xs text-muted-foreground">
              등급: {getPerformanceGrade(averageRating)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 회전율</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageStockTurnover.toFixed(1)}x
            </div>
            <p className="text-xs text-muted-foreground">재고 회전율</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카테고리별 분석 */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 성과</CardTitle>
            <CardDescription>카테고리별 매출 현황과 성장률</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCategoryAnalysis.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {category.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {formatCurrency(category.revenue)}
                      </span>
                      <span
                        className={`text-xs ${getGrowthColor(
                          category.growth
                        )} flex items-center`}
                      >
                        {getGrowthIcon(category.growth)}
                        {formatPercent(Math.abs(category.growth))}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      (category.revenue /
                        Math.max(
                          ...mockCategoryAnalysis.map((c) => c.revenue)
                        )) *
                      100
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>상품: {category.productCount}개</span>
                    <span>판매: {formatNumber(category.quantity)}개</span>
                    <span>평균가: {formatCurrency(category.averagePrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 상위 성과 상품 */}
        <Card>
          <CardHeader>
            <CardTitle>상위 성과 상품</CardTitle>
            <CardDescription>매출 기준 상위 상품들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProducts
                .sort((a, b) => b.totalSales - a.totalSales)
                .slice(0, 5)
                .map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {product.productName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(product.totalSales)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(product.quantitySold)}개 판매
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상품 성과 상세 */}
      <Card>
        <CardHeader>
          <CardTitle>상품 성과 분석</CardTitle>
          <CardDescription>상품별 상세 성과 지표</CardDescription>
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
                  <TableHead className="text-right">재고</TableHead>
                  <TableHead>회전율</TableHead>
                  <TableHead className="text-right">수익률</TableHead>
                  <TableHead>평점</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(
                    product.currentStock,
                    product.quantitySold
                  );

                  return (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.totalSales)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(product.quantitySold)}개
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(product.currentStock)}개
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {product.stockTurnover.toFixed(1)}x
                          </span>
                          <Progress
                            value={Math.min(
                              (product.stockTurnover / 5) * 100,
                              100
                            )}
                            className="w-16 h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-medium ${
                            product.profitMargin >= 40
                              ? "text-green-600"
                              : product.profitMargin >= 30
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercent(product.profitMargin)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-sm">{product.rating}</span>
                          <span className="text-xs text-gray-500">
                            ({product.reviewCount})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStockStatusBadge(stockStatus)}</TableCell>
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
            <Target className="h-8 w-8 mx-auto text-blue-600" />
            <CardTitle className="text-lg">최고 매출 상품</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-xl font-bold">{topProduct.productName}</div>
            <div className="text-sm text-gray-500">{topProduct.category}</div>
            <div className="text-lg text-blue-600 mt-2">
              {formatCurrency(topProduct.totalSales)}
            </div>
            <div className="text-sm text-gray-500">
              수익률: {formatPercent(topProduct.profitMargin)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <RotateCcw className="h-8 w-8 mx-auto text-green-600" />
            <CardTitle className="text-lg">최고 회전율</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-xl font-bold">
              {fastestTurnover.productName}
            </div>
            <div className="text-sm text-gray-500">
              {fastestTurnover.category}
            </div>
            <div className="text-2xl text-green-600 mt-2">
              {fastestTurnover.stockTurnover.toFixed(1)}x
            </div>
            <div className="text-sm text-gray-500">재고 회전율</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-purple-600" />
            <CardTitle className="text-lg">최고 수익률</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-xl font-bold">{highestMargin.productName}</div>
            <div className="text-sm text-gray-500">
              {highestMargin.category}
            </div>
            <div className="text-2xl text-purple-600 mt-2">
              {formatPercent(highestMargin.profitMargin)}
            </div>
            <div className="text-sm text-gray-500">매출 대비 수익률</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
