"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateBrandDto } from "@/types/brand";
import { ImageUploader } from "@/components/ui/imageUploader";
import { useCreateBrand } from "@/hooks/useBrands";

interface BrandRegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  applicationId?: string;
}

export default function BrandRegister({ isOpen, onClose, onSuccess, applicationId }: BrandRegisterProps) {
  const createBrandMutation = useCreateBrand();
  const [formData, setFormData] = useState<CreateBrandDto>({
    applicationId: applicationId || "",
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    coverUrl: "",
    contactEmail: "",
    contactPhone: "",
    paymentMode: "platform"
  });
  
  const isLoading = createBrandMutation.isPending;
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update applicationId when prop changes
  useEffect(() => {
    if (applicationId) {
      setFormData(prev => ({ ...prev, applicationId }));
    }
  }, [applicationId]);

  const handleInputChange = (field: keyof CreateBrandDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.applicationId) {
      newErrors.applicationId = "신청서 ID는 필수입니다";
    }

    if (!formData.name) {
      newErrors.name = "브랜드명은 필수입니다";
    } else if (formData.name.length > 255) {
      newErrors.name = "브랜드명은 255자를 초과할 수 없습니다";
    }

    if (!formData.slug) {
      newErrors.slug = "슬러그는 필수입니다";
    } else if (formData.slug.length > 255) {
      newErrors.slug = "슬러그는 255자를 초과할 수 없습니다";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "슬러그는 소문자, 숫자, 하이픈만 포함할 수 있습니다";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "설명은 1000자를 초과할 수 없습니다";
    }

    // Logo and Cover URL validations removed - now handled by ImageUploader

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "유효하지 않은 연락처 이메일입니다";
    } else if (formData.contactEmail && formData.contactEmail.length > 255) {
      newErrors.contactEmail = "연락처 이메일은 255자를 초과할 수 없습니다";
    }

    if (formData.contactPhone && formData.contactPhone.length > 20) {
      newErrors.contactPhone = "연락처 전화번호는 20자를 초과할 수 없습니다";
    }

    if (!formData.paymentMode) {
      newErrors.paymentMode = "결제 모드는 필수입니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});
    
    try {
      await createBrandMutation.mutateAsync(formData);
      
      // Success - reset form
      setFormData({
        applicationId: applicationId || "",
        name: "",
        slug: "",
        description: "",
        logoUrl: "",
        coverUrl: "",
        contactEmail: "",
        contactPhone: "",
        paymentMode: "platform"
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Brand creation error:", error);
      setErrors({ submit: error instanceof Error ? error.message : "브랜드 등록에 실패했습니다" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[50vw] max-h-[90vh] overflow-y-auto" 
        style={{ 
          width: '35vw', 
          maxWidth: '45vw',
          minWidth: '450px'
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">브랜드 등록</DialogTitle>
          <p className="text-gray-600">새로운 브랜드를 등록하세요</p>
        </DialogHeader>
        
        <div className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="name">브랜드명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="브랜드명을 입력하세요"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">슬러그 *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="brand-slug"
                  className={errors.slug ? "border-red-500" : ""}
                />
                <p className="text-sm text-gray-500">
                  URL에 사용될 고유한 식별자입니다. 소문자, 숫자, 하이픈만 사용 가능합니다.
                </p>
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="브랜드에 대한 설명을 입력하세요"
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                <p className="text-sm text-gray-500">
                  {formData.description?.length || 0}/1000자
                </p>
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl">브랜드 로고</Label>
                <ImageUploader
                  value={formData.logoUrl || undefined}
                  onChange={(url) => handleInputChange("logoUrl", (url as string) || "")}
                  single={true}
                  folder="brands"
                  height="200px"
                  previewSize="md"
                  disabled={isLoading}
                  onError={(err) => setErrors(prev => ({ ...prev, logoUrl: err }))}
                />
                <p className="text-sm text-gray-500">
                  브랜드 로고를 업로드하세요 (정사각형 권장, 최대 5MB)
                </p>
                {errors.logoUrl && (
                  <p className="text-sm text-red-500">{errors.logoUrl}</p>
                )}
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="coverUrl">커버 이미지</Label>
                <ImageUploader
                  value={formData.coverUrl || undefined}
                  onChange={(url) => handleInputChange("coverUrl", (url as string) || "")}
                  single={true}
                  folder="brands"
                  height="200px"
                  previewSize="lg"
                  disabled={isLoading}
                  onError={(err) => setErrors(prev => ({ ...prev, coverUrl: err }))}
                />
                <p className="text-sm text-gray-500">
                  브랜드 커버 이미지를 업로드하세요 (가로형 권장, 최대 5MB)
                </p>
                {errors.coverUrl && (
                  <p className="text-sm text-red-500">{errors.coverUrl}</p>
                )}
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">연락처 이메일</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="contact@brand.com"
                  className={errors.contactEmail ? "border-red-500" : ""}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-500">{errors.contactEmail}</p>
                )}
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contactPhone">연락처 전화번호</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="010-1234-5678"
                  className={errors.contactPhone ? "border-red-500" : ""}
                />
                {errors.contactPhone && (
                  <p className="text-sm text-red-500">{errors.contactPhone}</p>
                )}
              </div>

              {/* Payment Mode */}
              <div className="space-y-2">
                <Label htmlFor="paymentMode">결제 모드 *</Label>
                <Select
                  value={formData.paymentMode}
                  onValueChange={(value) => handleInputChange("paymentMode", value)}
                >
                  <SelectTrigger className={errors.paymentMode ? "border-red-500" : ""}>
                    <SelectValue placeholder="결제 모드를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">플랫폼 결제</SelectItem>
                    <SelectItem value="business">사업자 결제</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMode && (
                  <p className="text-sm text-red-500">{errors.paymentMode}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "등록 중..." : "브랜드 등록"}
                </Button>
              </div>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
