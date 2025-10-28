"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActivePromotions } from "@/hooks/usePromotions";
import { useBulkAssignProductPromotion } from "@/hooks/usePromotions";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Promotion } from "@/types/promotion";

interface BulkPromotionAssignProps {
    selectedProductIds: string[];
    brandId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BulkPromotionAssign({
    selectedProductIds,
    brandId,
    onClose,
    onSuccess
}: BulkPromotionAssignProps) {
    const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
    const { promotions, loading: loadingPromotions } = useActivePromotions(brandId);
    const { bulkAssignPromotion, loading: isAssigning } = useBulkAssignProductPromotion();

    const handleAssign = async () => {
        if (!selectedPromotionId) {
            toast.error("프로모션을 선택해주세요");
            return;
        }

        try {
            await bulkAssignPromotion(selectedProductIds, selectedPromotionId);
            toast.success(`${selectedProductIds.length}개 상품에 프로모션이 적용되었습니다`);
            onSuccess();
            onClose();
        } catch {
            toast.error("프로모션 적용에 실패했습니다");
        }
    };

    const handleRemovePromotion = async () => {
        try {
            await bulkAssignPromotion(selectedProductIds, null);
            toast.success(`${selectedProductIds.length}개 상품에서 프로모션이 제거되었습니다`);
            onSuccess();
            onClose();
        } catch {
            toast.error("프로모션 제거에 실패했습니다");
        }
    };

    const getPromotionTypeLabel = (type: string) => {
        const labels = {
            percentage: "퍼센트 할인",
            fixed_amount: "고정 금액 할인",
            free_shipping: "무료 배송"
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">프로모션 일괄 적용</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Selected count */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                            <span className="font-semibold">{selectedProductIds.length}개</span> 상품 선택됨
                        </p>
                    </div>

                    {/* Promotion select */}
                    {loadingPromotions ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">프로모션을 불러오는 중...</p>
                        </div>
                    ) : promotions.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500">활성화된 프로모션이 없습니다</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {promotions.map((promotion) => (
                                <div
                                    key={promotion.id}
                                    onClick={() => setSelectedPromotionId(promotion.id)}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedPromotionId === promotion.id
                                        ? 'border-purple-600 bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-sm">{promotion.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {getPromotionTypeLabel(promotion.type)}
                                                {promotion.value && ` - ${formatValue(promotion)}`}
                                            </p>
                                        </div>
                                        {selectedPromotionId === promotion.id && (
                                            <Badge variant="secondary" className="bg-purple-600 text-white">
                                                선택됨
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                    <Button
                        variant="outline"
                        onClick={handleRemovePromotion}
                        disabled={isAssigning || loadingPromotions}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        프로모션 제거
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isAssigning}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedPromotionId || isAssigning || loadingPromotions}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isAssigning ? "적용중..." : "적용"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

