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
import { useLanguage } from "@/providers/languageProvider";

interface BrandRegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  applicationId?: string;
}

export default function BrandRegister({ isOpen, onClose, onSuccess, applicationId }: BrandRegisterProps) {
  const { t } = useLanguage();
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
      newErrors.applicationId = t("header.business.brandRegister.errors.applicationIdRequired");
    }

    if (!formData.name) {
      newErrors.name = t("header.business.brandRegister.errors.nameRequired");
    } else if (formData.name.length > 255) {
      newErrors.name = t("header.business.brandRegister.errors.nameMaxLength");
    }

    if (!formData.slug) {
      newErrors.slug = t("header.business.brandRegister.errors.slugRequired");
    } else if (formData.slug.length > 255) {
      newErrors.slug = t("header.business.brandRegister.errors.slugMaxLength");
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = t("header.business.brandRegister.errors.slugInvalid");
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = t("header.business.brandRegister.errors.descriptionMaxLength");
    }

    // Logo and Cover URL validations removed - now handled by ImageUploader

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = t("header.business.brandRegister.errors.contactEmailInvalid");
    } else if (formData.contactEmail && formData.contactEmail.length > 255) {
      newErrors.contactEmail = t("header.business.brandRegister.errors.contactEmailMaxLength");
    }

    if (formData.contactPhone && formData.contactPhone.length > 20) {
      newErrors.contactPhone = t("header.business.brandRegister.errors.contactPhoneMaxLength");
    }

    if (!formData.paymentMode) {
      newErrors.paymentMode = t("header.business.brandRegister.errors.paymentModeRequired");
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
      setErrors({ submit: error instanceof Error ? error.message : t("header.business.brandRegister.errors.registerFailed") });
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
          <DialogTitle className="text-2xl font-bold">{t("header.business.brandRegister.title")}</DialogTitle>
          <p className="text-gray-600">{t("header.business.brandRegister.subtitle")}</p>
        </DialogHeader>
        
        <div className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("header.business.brandRegister.brandName")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t("header.business.brandRegister.brandNamePlaceholder")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">{t("header.business.brandRegister.slug")}</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder={t("header.business.brandRegister.slugPlaceholder")}
                  className={errors.slug ? "border-red-500" : ""}
                />
                <p className="text-sm text-gray-500">
                  {t("header.business.brandRegister.slugDescription")}
                </p>
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t("header.business.brandRegister.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder={t("header.business.brandRegister.descriptionPlaceholder")}
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                <p className="text-sm text-gray-500">
                  {formData.description?.length || 0}/1000{t("header.business.brandRegister.characters")}
                </p>
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl">{t("header.business.brandRegister.logo")}</Label>
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
                  {t("header.business.brandRegister.logoDescription")}
                </p>
                {errors.logoUrl && (
                  <p className="text-sm text-red-500">{errors.logoUrl}</p>
                )}
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="coverUrl">{t("header.business.brandRegister.coverImage")}</Label>
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
                  {t("header.business.brandRegister.coverImageDescription")}
                </p>
                {errors.coverUrl && (
                  <p className="text-sm text-red-500">{errors.coverUrl}</p>
                )}
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">{t("header.business.brandRegister.contactEmail")}</Label>
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
                <Label htmlFor="contactPhone">{t("header.business.brandRegister.contactPhone")}</Label>
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
                <Label htmlFor="paymentMode">{t("header.business.brandRegister.paymentMode")}</Label>
                <Select
                  value={formData.paymentMode}
                  onValueChange={(value) => handleInputChange("paymentMode", value)}
                >
                  <SelectTrigger className={errors.paymentMode ? "border-red-500" : ""}>
                    <SelectValue placeholder={t("header.business.brandRegister.paymentModePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">{t("header.business.brandRegister.paymentPlatform")}</SelectItem>
                    <SelectItem value="business">{t("header.business.brandRegister.paymentBusiness")}</SelectItem>
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
                  {t("header.business.brandRegister.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? t("header.business.brandRegister.registering") : t("header.business.brandRegister.register")}
                </Button>
              </div>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
