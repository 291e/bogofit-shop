"use client";

import { useState } from "react";
import { usePromotions } from "@/hooks/usePromotions";
// import { Promotion, PromotionFilters } from "@/types/promotion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { PromotionFilters } from "@/types/promotion";
// import { PromotionFilterOptions } from "@/types/promotion";

interface AllPromotionsSubSectionProps {
    brandId: string;
}

export default function AllPromotionsSubSection({ brandId }: AllPromotionsSubSectionProps) {
    const [filters, setFilters] = useState<PromotionFilters>({});
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const { promotions, loading, error, totalPages, refetch } = usePromotions({
        brandId,
        filters,
        page,
        pageSize: 10,
        autoFetch: true
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === "all" ? undefined : value
        }));
        setPage(1);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: "대기중", className: "bg-yellow-100 text-yellow-800" },
            approved: { label: "승인됨", className: "bg-green-100 text-green-800" },
            rejected: { label: "거부됨", className: "bg-red-100 text-red-800" },
            banned: { label: "금지됨", className: "bg-red-100 text-red-800" }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const getTypeLabel = (type: string) => {
        const typeLabels = {
            percentage: "퍼센트 할인",
            fixed_amount: "고정 금액 할인",
            free_shipping: "무료 배송"
        };
        return typeLabels[type as keyof typeof typeLabels] || type;
    };

    if (loading) {
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
                <Button onClick={() => refetch()}>다시 시도</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">전체 프로모션</h1>
                    <p className="text-gray-600">브랜드의 모든 프로모션을 관리하세요</p>
                </div>
                <Button asChild>
                    <Link href={`/business/brands/${brandId}/promotions/create`}>
                        <Plus className="h-4 w-4 mr-2" />
                        프로모션 생성
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        필터
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">검색</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="프로모션명 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">상태</label>
                            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="모든 상태" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">모든 상태</SelectItem>
                                    <SelectItem value="pending">대기중</SelectItem>
                                    <SelectItem value="approved">승인됨</SelectItem>
                                    <SelectItem value="rejected">거부됨</SelectItem>
                                    <SelectItem value="banned">금지됨</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">타입</label>
                            <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange('type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="모든 타입" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">모든 타입</SelectItem>
                                    <SelectItem value="percentage">퍼센트 할인</SelectItem>
                                    <SelectItem value="fixed_amount">고정 금액 할인</SelectItem>
                                    <SelectItem value="free_shipping">무료 배송</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">활성 상태</label>
                            <Select value={filters.isActive?.toString() || "all"} onValueChange={(value) => handleFilterChange('isActive', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="모든 상태" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">모든 상태</SelectItem>
                                    <SelectItem value="true">활성</SelectItem>
                                    <SelectItem value="false">비활성</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Promotions List */}
            <div className="grid gap-4">
                {(!promotions || promotions.length === 0) ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-gray-500 mb-4">프로모션이 없습니다</p>
                            <Button asChild>
                                <Link href={`/business/brands/${brandId}/promotions/create`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    첫 번째 프로모션 생성
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    (promotions || []).map((promotion) => (
                        <Card key={promotion.id}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{promotion.name}</h3>
                                            {getStatusBadge(promotion.status)}
                                            {promotion.isActive && (
                                                <Badge className="bg-blue-100 text-blue-800">활성</Badge>
                                            )}
                                        </div>

                                        {promotion.description && (
                                            <p className="text-gray-600 mb-3">{promotion.description}</p>
                                        )}

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">타입:</span>
                                                <span className="ml-2 font-medium">{getTypeLabel(promotion.type)}</span>
                                            </div>
                                            {promotion.value && (
                                                <div>
                                                    <span className="text-gray-500">값:</span>
                                                    <span className="ml-2 font-medium">
                                                        {promotion.type === 'percentage' ? `${promotion.value}%` : `${promotion.value.toLocaleString()}원`}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-gray-500">시작일:</span>
                                                <span className="ml-2 font-medium">{new Date(promotion.startDate).toLocaleDateString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">종료일:</span>
                                                <span className="ml-2 font-medium">{new Date(promotion.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/business/brands/${brandId}/promotions/${promotion.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        {promotion.status === 'pending' && (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/business/brands/${brandId}/promotions/${promotion.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                        {promotion.status === 'pending' && (
                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                    >
                        이전
                    </Button>
                    <span className="text-sm text-gray-600">
                        {page} / {totalPages} 페이지
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                    >
                        다음
                    </Button>
                </div>
            )}
        </div>
    );
}
