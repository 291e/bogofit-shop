"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    DollarSign,
    ShoppingCart,
    Users,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { useSettlementStats } from "@/hooks/useSettlement";

interface OrderAnalysisSubSectionProps {
    brandId: string;
}

export default function OrderAnalysisSubSection({ }: OrderAnalysisSubSectionProps) {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

    // Fetch real settlement statistics
    const { data: stats, isLoading, error } = useSettlementStats(timeRange);

    const handleExport = () => {
        console.log("Exporting order analysis data...");
        // TODO: Implement export functionality
    };

    const handleFilter = () => {
        console.log("Applying filters...");
        // TODO: Implement filter functionality
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatGrowth = (growth: number) => {
        const isPositive = growth >= 0;
        const color = isPositive ? 'text-green-600' : 'text-red-600';
        const icon = isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />;

        return (
            <span className={`text-xs flex items-center gap-1 ${color}`}>
                {icon}
                {isPositive ? '+' : ''}{growth.toFixed(1)}% from last period
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">주문통계분석</h1>
                                <p className="text-sm text-gray-600">주문 데이터를 분석하고 통계를 확인하세요</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleFilter}>
                                <Filter className="h-4 w-4 mr-2" />
                                필터
                            </Button>
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-2" />
                                내보내기
                            </Button>
                        </div>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex justify-end gap-2">
                        {['7d', '30d', '90d', '1y'].map(range => (
                            <Button
                                key={range}
                                variant={timeRange === range ? 'default' : 'outline'}
                                onClick={() => setTimeRange(range as '7d' | '30d' | '90d' | '1y')}
                                size="sm"
                            >
                                {range === '7d' ? '7일' : range === '30d' ? '30일' : range === '90d' ? '90일' : '1년'}
                            </Button>
                        ))}
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-gray-600">통계 데이터를 불러오는 중...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <div className="text-red-500 mb-2">오류가 발생했습니다</div>
                                <p className="text-gray-600 text-sm">{error.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">총 매출</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                                    {formatGrowth(stats.revenueGrowth)}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">총 주문</CardTitle>
                                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}건</div>
                                    {formatGrowth(stats.ordersGrowth)}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">평균 주문 금액</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
                                    {formatGrowth(stats.aovGrowth)}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">신규 고객</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.newCustomers}명</div>
                                    {formatGrowth(stats.customersGrowth)}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Additional Features Notice */}
                    {stats && (
                        <div className="border rounded-lg p-8 text-center">
                            <div className="text-6xl mb-4">📊</div>
                            <h2 className="text-2xl font-bold mb-4">고급 분석 기능</h2>
                            <p className="text-gray-600 mb-6">
                                더 자세한 분석을 위한 추가 기능들이 준비 중입니다.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-800 mb-2">예정 기능:</h3>
                                <ul className="text-left text-blue-700 space-y-1">
                                    <li>• 기간별 매출 및 주문 추이 그래프</li>
                                    <li>• 상품별/카테고리별 판매 분석</li>
                                    <li>• 고객 구매 패턴 분석</li>
                                    <li>• 반품/취소율 통계</li>
                                    <li>• 데이터 내보내기 (Excel, CSV)</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}