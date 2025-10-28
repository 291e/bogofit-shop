"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Save } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useCreatePromotion } from "@/hooks/usePromotions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CreatePromotionSubSectionProps {
    brandId: string;
}

export default function CreatePromotionSubSection({ brandId }: CreatePromotionSubSectionProps) {
    const { createPromotion, loading } = useCreatePromotion();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        discountType: "percentage" as "percentage" | "fixed" | "free_shipping",
        discountValue: "",
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
    });

    const handleInputChange = (field: string, value: string | number | Date | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.startDate || !formData.endDate) {
            toast.error("모든 필수 항목을 입력해주세요.");
            return;
        }

        // Validate discount value for non-free-shipping types
        if (formData.discountType !== "free_shipping" && !formData.discountValue) {
            toast.error("할인 값을 입력해주세요.");
            return;
        }

        // Validate percentage range
        if (formData.discountType === "percentage" && formData.discountValue) {
            const value = parseFloat(formData.discountValue);
            if (value <= 0 || value > 100) {
                toast.error("퍼센트 값은 0보다 크고 100 이하여야 합니다.");
                return;
            }
        }

        if (formData.endDate <= formData.startDate!) {
            toast.error("종료 날짜는 시작 날짜보다 이후여야 합니다.");
            return;
        }

        try {
            // Map frontend form to API format
            const promotionData = {
                name: formData.name,
                description: formData.description || undefined,
                type: (formData.discountType === "percentage" ? "percentage" :
                    formData.discountType === "fixed" ? "fixed_amount" : "free_shipping") as "percentage" | "fixed_amount" | "free_shipping",
                value: formData.discountType !== "free_shipping" ? parseFloat(formData.discountValue) : undefined,
                startDate: formData.startDate!.toISOString(),
                endDate: formData.endDate!.toISOString(),
            };

            await createPromotion(brandId, promotionData);

            toast.success("프로모션이 성공적으로 생성되었습니다!");

            // Reset form
            setFormData({
                name: "",
                description: "",
                discountType: "percentage",
                discountValue: "",
                startDate: undefined,
                endDate: undefined,
            });

            // Redirect to promotions list
            router.push(`/business/brands/${brandId}/promotions`);
        } catch (error) {
            console.error("Error creating promotion:", error);
            toast.error(error instanceof Error ? error.message : "프로모션 생성 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">프로모션 생성</h2>
                <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    템플릿 사용
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>새 프로모션 정보</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 기본 정보 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">프로모션 이름 *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="예: 신규 고객 할인"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discountType">할인 유형 *</Label>
                                <Select
                                    value={formData.discountType}
                                    onValueChange={(value) => handleInputChange("discountType", value as "percentage" | "fixed" | "free_shipping")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="할인 유형을 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">퍼센트 할인 (%)</SelectItem>
                                        <SelectItem value="fixed">고정 금액 할인 (원)</SelectItem>
                                        <SelectItem value="free_shipping">무료 배송</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">프로모션 설명</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="프로모션에 대한 자세한 설명을 입력하세요"
                                rows={3}
                            />
                        </div>

                        {/* 할인 설정 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.discountType !== "free_shipping" && (
                                <div className="space-y-2">
                                    <Label htmlFor="discountValue">
                                        할인 값 *
                                        <span className="text-sm text-gray-500 ml-1">
                                            ({formData.discountType === "percentage" ? "%" : "원"})
                                        </span>
                                    </Label>
                                    <Input
                                        id="discountValue"
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => handleInputChange("discountValue", e.target.value)}
                                        placeholder={formData.discountType === "percentage" ? "20" : "5000"}
                                        min="0"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* 기간 설정 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>시작 날짜 *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.startDate ? format(formData.startDate, "PPP", { locale: ko }) : "시작 날짜 선택"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <div className="p-4">
                                            <Input
                                                type="date"
                                                value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleInputChange("startDate", e.target.value ? new Date(e.target.value) : undefined)}
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>종료 날짜 *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.endDate ? format(formData.endDate, "PPP", { locale: ko }) : "종료 날짜 선택"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <div className="p-4">
                                            <Input
                                                type="date"
                                                value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleInputChange("endDate", e.target.value ? new Date(e.target.value) : undefined)}
                                                min={formData.startDate ? formData.startDate.toISOString().split('T')[0] : undefined}
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* 제출 버튼 */}
                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                취소
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        생성 중...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        프로모션 생성
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
