"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Percent, Eye, Plus } from "lucide-react";
import { usePromotions } from "@/hooks/usePromotions";
import { Promotion } from "@/types/promotion";
import Link from "next/link";

interface ActivePromotionsSubSectionProps {
    brandId: string;
}

export default function ActivePromotionsSubSection({ brandId }: ActivePromotionsSubSectionProps) {
    const { promotions = [], loading: isLoading, error } = usePromotions({
        brandId,
        filters: { onlyActive: true },  // ✅ Get only active promotions
        page: 1,
        pageSize: 100,  // Get all active promotions
        autoFetch: true
    });

    const formatValue = (type: string, value?: number | null) => {
        if (!value) return "무료배송";
        if (type === 'percentage') return `${value}%`;
        if (type === 'fixed_amount') return `${value.toLocaleString()}원`;
        return "-";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">프로모션을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 mb-4">오류가 발생했습니다: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">활성 프로모션</h2>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {promotions.length}개 활성
                </Badge>
            </div>

            {promotions.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">활성 프로모션이 없습니다</h3>
                        <p className="text-gray-500 text-center mb-4">
                            현재 진행 중인 프로모션이 없습니다.<br />
                            새로운 프로모션을 생성해보세요.
                        </p>
                        <Button asChild>
                            <Link href={`/business/brands/${brandId}/promotions/create`}>
                                <Plus className="h-4 w-4 mr-2" />
                                프로모션 생성하기
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {promotions.map((promotion: Promotion) => (
                        <Card key={promotion.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{promotion.name}</CardTitle>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        활성
                                    </Badge>
                                </div>
                                {promotion.description && (
                                    <p className="text-gray-600">{promotion.description}</p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <Percent className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">할인</p>
                                            <p className="font-medium">
                                                {formatValue(promotion.type, promotion.value)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">기간</p>
                                            <p className="font-medium text-sm">
                                                {new Date(promotion.startDate).toLocaleDateString()} ~ {new Date(promotion.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Eye className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">상태</p>
                                            <p className="font-medium text-green-600">진행중</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
