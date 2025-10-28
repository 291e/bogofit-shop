"use client";

// import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Clock,
    DollarSign,
    Download,
    Filter,
    CalendarDays
} from "lucide-react";

interface SettlementPendingSubSectionProps {
    brandId: string;
}

export default function SettlementPendingSubSection({ }: SettlementPendingSubSectionProps) {
    // const [loading, setLoading] = useState(false);

    const handleExport = () => {
        console.log("Exporting settlement pending data...");
        // TODO: Implement export functionality
    };

    const handleFilter = () => {
        console.log("Applying filters...");
        // TODO: Implement filter functionality
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Clock className="h-6 w-6 text-yellow-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">정산대기목록</h1>
                                <p className="text-sm text-gray-600">정산 대기 중인 주문들을 확인하세요</p>
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

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">대기 중인 정산</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12건</div>
                                <p className="text-xs text-muted-foreground">정산 대기 중</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">예정 금액</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₩2,450,000</div>
                                <p className="text-xs text-muted-foreground">정산 예정 금액</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">다음 정산일</CardTitle>
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">2025-01-25</div>
                                <p className="text-xs text-muted-foreground">정산 예정일</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Development Notice */}
                    <div className="border rounded-lg p-8 text-center">
                        <div className="text-6xl mb-4">🚧</div>
                        <h2 className="text-2xl font-bold mb-4">정산대기목록 기능 개발 중</h2>
                        <p className="text-gray-600 mb-6">
                            이 기능은 현재 개발 중입니다. 곧 사용하실 수 있습니다.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-800 mb-2">예정 기능:</h3>
                            <ul className="text-left text-yellow-700 space-y-1">
                                <li>• 정산 대기 중인 주문 목록</li>
                                <li>• 정산 예정일 및 금액</li>
                                <li>• 정산 상태 추적</li>
                                <li>• 정산 요청 기능</li>
                                <li>• 정산 내역 다운로드</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}