"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useActivePromotions } from "@/hooks/usePromotions";
import { Promotion } from "@/types/promotion";

interface PromotionDropdownProps {
    brandId: string;
    selectedPromotionId?: string | null;
    currentPromotion?: Promotion | null;
    onPromotionSelect: (promotionId: string | null) => void;
    className?: string;
    compactMode?: boolean;
}

export default function PromotionDropdown({
    brandId,
    selectedPromotionId,
    currentPromotion,
    onPromotionSelect,
    className = "",
    compactMode = false
}: PromotionDropdownProps) {
    const { promotions, loading: isLoading } = useActivePromotions(brandId);

    const getPromotionTypeLabel = (type: string) => {
        const labels = {
            percentage: '퍼센트 할인',
            fixed_amount: '고정 금액 할인',
            free_shipping: '무료 배송'
        };
        return labels[type as keyof typeof labels] || type;
    };

    const formatValue = (promotion: Promotion) => {
        if (promotion.type === 'percentage') {
            return `${promotion.value}%`;
        } else if (promotion.type === 'fixed_amount') {
            return `${new Intl.NumberFormat('ko-KR').format(promotion.value || 0)}원`;
        }
        return '';
    };

    const handleRemovePromotion = () => {
        onPromotionSelect(null);
    };

    if (isLoading) {
        return (
            <div className={`border rounded-lg bg-white p-4 ${className}`}>
                <div className="text-center py-4 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm">프로모션을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // Compact mode rendering (for Edit form)
    if (compactMode) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Select
                    value={selectedPromotionId || ""}
                    onValueChange={onPromotionSelect}
                >
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder="프로모션을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                        {promotions.length === 0 ? (
                            <div className="p-2 text-center text-sm text-gray-500">
                                활성화된 프로모션이 없습니다
                            </div>
                        ) : (
                            promotions.map((promotion) => (
                                <SelectItem key={promotion.id} value={promotion.id}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{promotion.name}</span>
                                        <span className="text-xs text-gray-500">
                                            ({getPromotionTypeLabel(promotion.type)}
                                            {promotion.value && ` - ${formatValue(promotion)}`})
                                        </span>
                                    </div>
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>

                {/* Remove Button */}
                {selectedPromotionId && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemovePromotion}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <X className="h-4 w-4 mr-1" />
                        제거
                    </Button>
                )}
            </div>
        );
    }

    // Full mode rendering
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Current Promotion Display */}
            {currentPromotion && (
                <div className="border border-purple-200 rounded-lg bg-purple-50 p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="bg-purple-600 text-white">
                                    적용중
                                </Badge>
                                <span className="font-semibold text-gray-900">{currentPromotion.name}</span>
                            </div>
                            {currentPromotion.description && (
                                <p className="text-sm text-gray-600 mb-2">{currentPromotion.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                {getPromotionTypeLabel(currentPromotion.type)}
                                {currentPromotion.value && ` - ${formatValue(currentPromotion)}`}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemovePromotion}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Promotion Selector */}
            <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    프로모션 선택 {!currentPromotion && <span className="text-gray-400">(선택사항)</span>}
                </label>
                <Select
                    value={selectedPromotionId || ""}
                    onValueChange={onPromotionSelect}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="프로모션을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                        {promotions.length === 0 ? (
                            <div className="p-2 text-center text-sm text-gray-500">
                                활성화된 프로모션이 없습니다
                            </div>
                        ) : (
                            promotions.map((promotion) => (
                                <SelectItem key={promotion.id} value={promotion.id}>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{promotion.name}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {getPromotionTypeLabel(promotion.type)}
                                            {promotion.value && ` - ${formatValue(promotion)}`}
                                        </div>
                                    </div>
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>


        </div>
    );
}

