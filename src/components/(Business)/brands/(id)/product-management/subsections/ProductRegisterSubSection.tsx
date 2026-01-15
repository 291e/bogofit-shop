"use client";

import { useState } from "react";
import { ProductForm, ProductVariantForm, VariantOption, convertProductFormToDto } from "@/types/product";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct } from "@/hooks/useProducts";
import { useActivePromotions } from "@/hooks/usePromotions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CategoryDropdown from "@/components/ui/category-dropdown";
import { ImageUploader } from "@/components/ui/imageUploader";
import { ChevronDown, ChevronUp, Plus, Trash2, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/providers/languageProvider";
import { useImageUpload } from "@/hooks/useImageUpload"; // ✅ Import Hook

interface ProductRegisterFormProps {
  brandId?: string;
  className?: string;
}

export default function ProductRegisterSubSection({
  brandId,
  className
}: ProductRegisterFormProps) {
  // ✅ All hooks must be called before any early returns
  const { t } = useLanguage();
  const router = useRouter();

  // ✅ Use React Query for categories with caching
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const categories = categoriesData?.data || [];

  // ✅ Fetch active promotions for this brand
  const { promotions: activePromotions, loading: isLoadingPromotions } = useActivePromotions(brandId || "");

  const { uploadImage } = useImageUpload(); // ✅ Use Hook

  // ✅ Section collapse states
  const [openSections, setOpenSections] = useState({
    basic: true,
    category: true,
    pricing: true,
    images: true,
    variants: true,
    sizeChart: true,
  });

  // ✅ Form data
  const [formData, setFormData] = useState<ProductForm>({
    brandId: brandId || "",
    name: "",
    slug: "",
    sku: "",
    isActive: false,
    description: "",
    categoryId: "",
    thumbUrl: "",
    images: [],
    detailImages: [],
    basePrice: 0,
    baseCompareAtPrice: 0,
    quantity: null, // Product-level inventory (null = unlimited)
    variants: [], // Start with EMPTY array - variants are OPTIONAL
    hasOptions: false
  });

  // ✅ Use mutation hook for product creation
  const createProduct = useCreateProduct(brandId || "");

  const [measurementColumns, setMeasurementColumns] = useState<string[]>(["가슴단면", "총장", "어깨너비", "소매길이"]);
  const [measurementRows, setMeasurementRows] = useState<{ size: string; values: Record<string, string> }[]>([
    { size: "S", values: { "가슴단면": "", "총장": "", "어깨너비": "", "소매길이": "" } },
    { size: "M", values: { "가슴단면": "", "총장": "", "어깨너비": "", "소매길이": "" } },
    { size: "L", values: { "가슴단면": "", "총장": "", "어깨너비": "", "소매길이": "" } },
    { size: "XL", values: { "가슴단면": "", "총장": "", "어깨너비": "", "소매길이": "" } },
    { size: "FREE", values: { "가슴단면": "", "총장": "", "어깨너비": "", "소매길이": "" } }
  ]);

  // ✅ AI Generation State
  // ✅ AI Generation State
  const [aiBaseImage, setAiBaseImage] = useState<string>("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedSet, setGeneratedSet] = useState<{
    main: string;
    gallery: string[];
    detail: string[];
  } | null>(null);

  // ✅ Selection State for Gallery Candidates
  const [selectedGalleryItems, setSelectedGalleryItems] = useState<string[]>([]);

  const toggleGallerySelection = (url: string) => {
    setSelectedGalleryItems(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  // Step 1: Generate Main Image
  const handleGenerateMainImage = async () => {
    if (!aiBaseImage) {
      toast.error("Please upload a reference image first");
      return;
    }
    setIsGeneratingAI(true);
    setGeneratedSet(null); // Clear previous results
    setSelectedGalleryItems([]); // Clear selection
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImage: aiBaseImage,
          productName: formData.name || "Product",
          aspectRatio: 'hero', // Generate only Main Image
        })
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedSet({
          main: data.imageUrl,
          gallery: [],
          detail: []
        });
        toast.success("Main Image Generated! Review it and proceed to Step 2.");
      } else {
        toast.error(data.message || "Failed to generate main image");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error generating image");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Step 2: Generate Rest of the Set (Accumulates Images)
  const handleGenerateRestImages = async () => {
    if (!aiBaseImage) return;
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImage: generatedSet?.main || aiBaseImage, // Use generated main image if available
          productName: formData.name || "Product",
          generateRest: true // Trigger remaining 3 images
        })
      });
      const data = await response.json();
      if (data.success) {
        const newImages = data.galleryImages || [];

        // Append new images to the list
        setGeneratedSet(prev => ({
          main: prev?.main || "",
          gallery: [...(prev?.gallery || []), ...newImages],
          detail: [] // Not using distinct detail field anymore
        }));

        // Auto-select the newly generated images
        setSelectedGalleryItems(prev => [...prev, ...newImages]);

        toast.success(`Generated ${newImages.length} new gallery images!`);
      } else {
        toast.error(data.message || "Failed to generate remaining images");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error generating images");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // ✅ Helper: Convert Base64 to File
  const base64ToFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleApplyAIImages = async () => {
    if (!generatedSet) return;

    // Use selection or all gallery images
    const galleryToApply = selectedGalleryItems.length > 0
      ? selectedGalleryItems
      : generatedSet.gallery;

    if (!generatedSet.main && galleryToApply.length === 0) {
      toast.error("No images to apply!");
      return;
    }

    setIsGeneratingAI(true);
    const toastId = toast.loading("Uploading AI images to S3...");

    try {
      const timestamp = Date.now();
      let newThumbUrl = formData.thumbUrl;

      // 1. Upload Main Image
      if (generatedSet.main && generatedSet.main.startsWith('data:')) {
        const mainFile = base64ToFile(generatedSet.main, `ai-main-${timestamp}.png`);
        // ✅ Use hook's uploadImage
        const url = await uploadImage(mainFile, 'products');
        if (url) newThumbUrl = url;
      }

      // 2. Upload Gallery Images
      const newGalleryUrls: string[] = [];
      for (let i = 0; i < galleryToApply.length; i++) {
        const imgData = galleryToApply[i];
        if (imgData.startsWith('data:')) {
          const file = base64ToFile(imgData, `ai-gallery-${timestamp}-${i}.png`);
          // ✅ Use hook's uploadImage
          const url = await uploadImage(file, 'products');
          if (url) newGalleryUrls.push(url);
        } else {
          newGalleryUrls.push(imgData); // Already a URL (rare but possible)
        }
      }

      // 3. Update Form Data
      setFormData(prev => ({
        ...prev,
        thumbUrl: newThumbUrl,
        images: [...(prev.images || []), ...newGalleryUrls],
        detailImages: [] // Clear detail images if merged
      }));

      toast.success("AI Images uploaded & applied successfully!", { id: toastId });
      setOpenSections(prev => ({ ...prev, images: true }));

    } catch (error) {
      console.error("Failed to upload AI images:", error);
      toast.error("Failed to upload images. Please try again.", { id: toastId });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (!brandId) {
    // ... (Render UI updates below)
    // I will update the buttons in the render section in a separate or larger chunk if needed, 
    // but for cleaner diff, I will target the handlers first, then the JSX.
    // Wait, I should do it in one go if they are close, but they are far apart in file (handlers at top, JSX at bottom).
    // I will split. This step updates Handlers.

    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6">
          <div className="text-center text-red-500">
            Brand ID is required
          </div>
        </div>
      </div>
    );
  }

  // Handle variant changes
  const handleVariantChange = (
    index: number,
    field: keyof ProductVariantForm,
    value: string | number | boolean | VariantOption[]
  ) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => {
        if (i === index) {
          return { ...variant, [field]: value };
        }
        return variant;
      })
    }));
  };

  // Add new variant
  const addVariant = () => {
    setFormData(prev => {
      // Get options from the first variant if available to keep consistency
      const defaultOptions = prev.variants.length > 0
        ? prev.variants[0].options.map(opt => ({ key: opt.key, value: "" }))
        : [
          { key: "사이즈", value: "" },
          { key: "색깔", value: "" }
        ];

      return {
        ...prev,
        variants: [...prev.variants, {
          price: prev.basePrice,
          compareAtPrice: prev.baseCompareAtPrice,
          quantity: 0,
          weightGrams: 0,
          status: "active",
          options: defaultOptions
        }]
      };
    });
  };

  // Remove variant
  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push(t("header.business.brandDetail.products.register.validationErrors.productNameRequired"));
    if (!formData.slug.trim()) errors.push(t("header.business.brandDetail.products.register.validationErrors.slugRequired"));
    if (!formData.sku?.trim()) errors.push(t("header.business.brandDetail.products.register.validationErrors.skuRequired"));
    if (!formData.categoryId) errors.push(t("header.business.brandDetail.products.register.validationErrors.categoryRequired"));
    if (formData.basePrice <= 0) errors.push(t("header.business.brandDetail.products.register.validationErrors.basePriceRequired"));
    if (!formData.thumbUrl) errors.push(t("header.business.brandDetail.products.register.validationErrors.mainImageRequired"));

    // Validate inventory based on hasOptions
    if (formData.hasOptions) {
      if (formData.variants.length === 0) {
        errors.push(t("header.business.brandDetail.products.register.validationErrors.variantRequired"));
      }
      formData.variants.forEach((variant, index) => {
        if (variant.quantity === undefined || variant.quantity === null || variant.quantity < 0) {
          errors.push(t("header.business.brandDetail.products.register.validationErrors.variantQuantityRequired", { index: index + 1 }));
        }
        if (variant.options && variant.options.length > 0) {
          variant.options.forEach((option, optionIndex) => {
            if (!option.key?.trim() || !option.value?.trim()) {
              errors.push(t("header.business.brandDetail.products.register.validationErrors.variantOptionRequired", { index: index + 1, optionIndex: optionIndex + 1 }));
            }
          });
        }
      });
    } else {
      if (formData.quantity !== null && formData.quantity !== undefined && formData.quantity < 0) {
        errors.push(t("header.business.brandDetail.products.register.validationErrors.quantityInvalid"));
      }
    }

    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    try {
      const dto = convertProductFormToDto(formData);

      // ✅ [Auto-Fix] If no variants exist (Simple Product), create a Default Variant
      // This prevents "Product variant not found" error in Cart API which requires at least one variant.
      if (!dto.variants || dto.variants.length === 0) {
        dto.variants = [{
          price: dto.basePrice,
          compareAtPrice: dto.baseCompareAtPrice,
          quantity: typeof dto.quantity === 'number' ? dto.quantity : 0,
          weightGrams: 0,
          status: 'active',
          optionsJson: undefined // No options indicates default variant
        }];
      }

      // ✅ Add Size Chart data to product_Details (Send as JSON string array to match Backend's List<string>)
      if (measurementRows && measurementRows.length > 0) {
        dto.product_Details = measurementRows.map(row => JSON.stringify(row));
      }

      console.log('📤 Sending product data to backend:', {
        ...dto,
        promotionId: dto.promotionId || '(No promotion selected)',
        hasPromotion: !!dto.promotionId
      });

      await createProduct.mutateAsync(dto);

      setTimeout(() => {
        router.push(`/business/brands/${brandId}/products`);
      }, 500);
    } catch (error) {
      console.error('Product creation error:', error);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">{t("header.business.brandDetail.products.register.title")}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Category Section */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('category')}>
              <CardTitle className="flex items-center justify-between">
                <span>{t("header.business.brandDetail.products.register.category")}</span>
                {openSections.category ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
            {openSections.category && (
              <CardContent>
                <CategoryDropdown
                  categories={categories}
                  selectedCategoryId={formData.categoryId}
                  onCategorySelect={(id: string) => setFormData(prev => ({ ...prev, categoryId: id }))}
                  isLoading={isLoadingCategories}
                  compactMode={true}
                />
              </CardContent>
            )}
          </Card>

          {/* Basic Info Section */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('basic')}>
              <CardTitle className="flex items-center justify-between">
                <span>{t("header.business.brandDetail.products.register.basicInfo")}</span>
                {openSections.basic ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
            {openSections.basic && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">{t("header.business.brandDetail.products.register.productName")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t("header.business.brandDetail.products.register.productNamePlaceholder")}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">{t("header.business.brandDetail.products.register.slug")}</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="product-slug"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="PROD-001"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">{t("header.business.brandDetail.products.register.description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t("header.business.brandDetail.products.register.descriptionPlaceholder")}
                    rows={4}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Pricing Section */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('pricing')}>
              <CardTitle className="flex items-center justify-between">
                <span>{t("header.business.brandDetail.products.register.priceInfo")}</span>
                {openSections.pricing ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
            {openSections.pricing && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="basePrice">{t("header.business.brandDetail.products.register.basePrice")}</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="baseCompareAtPrice">{t("header.business.brandDetail.products.register.comparePrice")}</Label>
                    <Input
                      id="baseCompareAtPrice"
                      type="number"
                      value={formData.baseCompareAtPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseCompareAtPrice: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Promotion Selection */}
                <div className="border-t pt-4">
                  <Label htmlFor="promotion">Promotion (선택사항)</Label>
                  <select
                    id="promotion"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.promotionId || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, promotionId: e.target.value || null }))}
                    disabled={isLoadingPromotions}
                  >
                    <option value="">선택 안함 (No Promotion)</option>
                    {activePromotions.map((promo) => {
                      const now = new Date();
                      const isActive = new Date(promo.startDate) <= now && now <= new Date(promo.endDate);
                      return (
                        <option key={promo.id} value={promo.id}>
                          {promo.name} ({promo.type === 'percentage' ? `${promo.value}%` : `₩${promo.value}`} OFF)
                          {!isActive && ' - 비활성'}
                        </option>
                      );
                    })}
                  </select>
                  {isLoadingPromotions && (
                    <p className="text-sm text-gray-500 mt-1">프로모션 로딩 중...</p>
                  )}

                  {/* Final Price Preview */}
                  {formData.promotionId && (() => {
                    const selectedPromo = activePromotions.find(p => p.id === formData.promotionId);
                    if (!selectedPromo || !formData.basePrice) return null;

                    let finalPrice = formData.basePrice;
                    if (selectedPromo.type === 'percentage' && selectedPromo.value) {
                      finalPrice = formData.basePrice * (1 - selectedPromo.value / 100);
                    } else if (selectedPromo.type === 'fixed_amount' && selectedPromo.value) {
                      finalPrice = Math.max(0, formData.basePrice - selectedPromo.value);
                    }

                    return (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">할인 후 가격 (Final Price):</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">₩{finalPrice.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 line-through">₩{formData.basePrice.toLocaleString()}</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {selectedPromo.name} 적용됨 ({selectedPromo.type === 'percentage' ? `${selectedPromo.value}% 할인` : `₩${selectedPromo.value?.toLocaleString()} 할인`})
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Inventory Section */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('variants')}>
              <CardTitle className="flex items-center justify-between">
                <span>{t("header.business.brandDetail.products.register.inventoryManagement")}</span>
                {openSections.variants ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
            {openSections.variants && (
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Label className="text-base font-semibold">{t("header.business.brandDetail.products.register.productLevelStock")}</Label>
                  </div>
                  <div>
                    <Label htmlFor="quantity">{t("header.business.brandDetail.products.register.productQuantity")}</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity ?? ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        quantity: e.target.value === '' ? null : Number(e.target.value)
                      }))}
                      placeholder={t("header.business.brandDetail.products.register.productQuantityPlaceholder")}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      {t("header.business.brandDetail.products.register.productQuantityDescription")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-base font-medium">{t("header.business.brandDetail.products.register.useVariants")}</Label>
                      <p className="text-sm text-gray-600">
                        {formData.hasOptions
                          ? t("header.business.brandDetail.products.register.useVariantsDescription")
                          : t("header.business.brandDetail.products.register.noVariantsDescription")
                        }
                      </p>
                    </div>
                    <Switch
                      checked={formData.hasOptions}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          hasOptions: checked,
                          variants: checked && prev.variants.length === 0 ? [{
                            price: prev.basePrice,
                            compareAtPrice: prev.baseCompareAtPrice,
                            quantity: 0,
                            weightGrams: 0,
                            status: "active",
                            options: [
                              { key: "사이즈", value: "" },
                              { key: "색깔", value: "" }
                            ]
                          }] : prev.variants
                        }));
                      }}
                    />
                  </div>
                  {formData.hasOptions && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-base font-semibold">{t("header.business.brandDetail.products.register.variantLevelStock")}</Label>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {formData.variants.map((variant, index) => (
                          <Card key={index} className="border border-gray-200">
                            <CardHeader className="pb-3 bg-gray-50/50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{t("header.business.brandDetail.products.register.variant", { index: index + 1 })}</span>
                                {formData.variants.length > 1 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeVariant(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>{t("header.business.brandDetail.products.register.quantity")}</Label>
                                  <Input
                                    type="number"
                                    value={variant.quantity}
                                    onChange={(e) => handleVariantChange(index, 'quantity', Number(e.target.value))}
                                    required
                                  />
                                </div>
                              </div>

                              <div>
                                <Label>{t("header.business.brandDetail.products.register.options")}</Label>
                                <p className="text-sm text-gray-500 mb-2">
                                  {t("header.business.brandDetail.products.register.optionsDescription")}
                                </p>
                                <div className="space-y-2">
                                  {variant.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex gap-2 items-center">
                                      <Input
                                        placeholder={t("header.business.brandDetail.products.register.optionNamePlaceholder")}
                                        value={option.key || ''}
                                        onChange={(e) => {
                                          const newOptions = [...variant.options];
                                          newOptions[optionIndex] = { ...newOptions[optionIndex], key: e.target.value };
                                          handleVariantChange(index, 'options', newOptions);
                                        }}
                                        className="flex-1"
                                      />
                                      <Input
                                        placeholder={t("header.business.brandDetail.products.register.optionValuePlaceholder")}
                                        value={option.value || ''}
                                        onChange={(e) => {
                                          const newOptions = [...variant.options];
                                          newOptions[optionIndex] = { ...newOptions[optionIndex], value: e.target.value };
                                          handleVariantChange(index, 'options', newOptions);
                                        }}
                                        className="flex-1"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          const newOptions = variant.options.filter((_, i) => i !== optionIndex);
                                          handleVariantChange(index, 'options', newOptions);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newOptions = [...variant.options, { key: '', value: '' }];
                                      handleVariantChange(index, 'options', newOptions);
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t("header.business.brandDetail.products.register.addOption")}
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <div
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() => {
                                    const newVariants = [...formData.variants];
                                    const currentVariant = newVariants[index] as ProductVariantForm & { showAdditionalInfo?: boolean };
                                    newVariants[index] = { ...currentVariant, showAdditionalInfo: !currentVariant.showAdditionalInfo } as ProductVariantForm & { showAdditionalInfo?: boolean };
                                    setFormData(prev => ({ ...prev, variants: newVariants }));
                                  }}
                                >
                                  <ChevronDown className={`h-4 w-4 transition-transform ${(variant as ProductVariantForm & { showAdditionalInfo?: boolean }).showAdditionalInfo ? 'rotate-180' : ''}`} />
                                  <Label className="text-sm font-medium cursor-pointer">{t("header.business.brandDetail.products.register.additionalInfo")}</Label>
                                </div>
                                {(variant as ProductVariantForm & { showAdditionalInfo?: boolean }).showAdditionalInfo && (
                                  <div className="mt-3 grid grid-cols-3 gap-4">
                                    <div>
                                      <Label>{t("header.business.brandDetail.products.register.price")}</Label>
                                      <Input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                                      />
                                    </div>
                                    <div>
                                      <Label>{t("header.business.brandDetail.products.register.variantComparePrice")}</Label>
                                      <Input
                                        type="number"
                                        value={variant.compareAtPrice}
                                        onChange={(e) => handleVariantChange(index, 'compareAtPrice', Number(e.target.value))}
                                      />
                                    </div>
                                    <div>
                                      <Label>{t("header.business.brandDetail.products.register.weight")}</Label>
                                      <Input
                                        type="number"
                                        value={variant.weightGrams}
                                        onChange={(e) => handleVariantChange(index, 'weightGrams', Number(e.target.value))}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addVariant}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("header.business.brandDetail.products.register.addVariant")}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* ✅ Dynamic Size Chart Builder (UI Moved Here) */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 cursor-pointer" onClick={() => toggleSection('sizeChart')}>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>상세 사이즈표 설정</span>
                {openSections.sizeChart ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
              <p className="text-sm text-gray-500 font-normal">
                상세 페이지에 포함될 사이즈표입니다. 행(사이즈)과 열(측정 부위)을 자유롭게 구성하세요.
              </p>
            </CardHeader>
            {openSections.sizeChart && (
              <CardContent className="p-6">
                {/* 1. 컬럼(측정 부위) 관리 */}
                <div className="mb-6">
                  <Label className="mb-2 block text-sm font-medium text-gray-700">측정 부위 (가로 열)</Label>
                  <div className="flex flex-wrap gap-2">
                    {measurementColumns.map((col, idx) => (
                      <div key={idx} className="flex items-center bg-blue-50 border border-blue-100 rounded-md pl-3 pr-1 py-1">
                        <span className="text-sm text-blue-700 font-medium mr-2">{col}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newCols = measurementColumns.filter((_, i) => i !== idx);
                            setMeasurementColumns(newCols);
                          }}
                          className="text-blue-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-1">
                      <Input
                        id="new-column-input"
                        placeholder="예: 허리둘레"
                        className="h-8 w-32 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val && !measurementColumns.includes(val)) {
                              setMeasurementColumns([...measurementColumns, val]);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById('new-column-input') as HTMLInputElement;
                          if (input && input.value.trim() && !measurementColumns.includes(input.value.trim())) {
                            setMeasurementColumns([...measurementColumns, input.value.trim()]);
                            input.value = '';
                          }
                        }}
                        className="h-8"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 2. 그리드 테이블 */}
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                      <tr>
                        <th className="px-4 py-3 min-w-[100px]">Size / 구분</th>
                        {measurementColumns.map((col, idx) => (
                          <th key={idx} className="px-4 py-3 min-w-[100px]">{col}</th>
                        ))}
                        <th className="px-4 py-3 w-[50px]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {measurementRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50/50">
                          {/* 사이즈 이름 입력 */}
                          <td className="p-2">
                            <Input
                              value={row.size}
                              onChange={(e) => {
                                const newRows = [...measurementRows];
                                newRows[rowIdx].size = e.target.value;
                                setMeasurementRows(newRows);
                              }}
                              className="font-bold bg-transparent border-transparent hover:border-gray-200 focus:bg-white h-8"
                              placeholder="Size"
                            />
                          </td>
                          {/* 각 컬럼별 값 입력 */}
                          {measurementColumns.map((col, colIdx) => (
                            <td key={colIdx} className="p-2">
                              <Input
                                value={row.values[col] || ''}
                                onChange={(e) => {
                                  const newRows = [...measurementRows];
                                  newRows[rowIdx].values = { ...newRows[rowIdx].values, [col]: e.target.value };
                                  setMeasurementRows(newRows);
                                }}
                                className="text-center h-8"
                                placeholder="0"
                              />
                            </td>
                          ))}
                          {/* 행 삭제 버튼 */}
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setMeasurementRows(measurementRows.filter((_, i) => i !== rowIdx));
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 3. 행 추가 버튼 */}
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMeasurementRows([...measurementRows, { size: "Free", values: {} }]);
                    }}
                    className="w-full border-dashed text-gray-500 hover:text-blue-600 hover:border-blue-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    새로운 사이즈 행 추가
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 🤖 AI Image Studio */}
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50 cursor-pointer" onClick={() => toggleSection('images')}>
              <CardTitle className="flex items-center justify-between text-gray-900">
                <div className="flex items-center gap-2">
                  <span>이미지 생성</span>
                </div>
                {openSections.images ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
            {openSections.images && (
              <CardContent className="space-y-6 pt-6">
                {/* 1. Reference Image Upload */}
                <div className="flex flex-col gap-4">
                  <Label className="text-base font-semibold">원본 이미지</Label>
                  <div className="flex gap-4 items-start">
                    <div className="w-1/3 min-w-[200px]">
                      <ImageUploader
                        value={aiBaseImage}
                        onChange={(url) => setAiBaseImage(Array.isArray(url) ? url[0] : url || "")}
                        maxFiles={1}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-4 pt-4">
                      <p className="text-sm text-gray-500">
                        원본 이미지를 업로드해주세요.
                        <br />
                        <strong>Step 1:</strong> AI가 대표 이미지를 생성합니다.
                        <br />
                        <strong>Step 2:</strong> AI가 갤러리 이미지와 상세 이미지를 생성합니다.
                      </p>

                      {/* Step 1 Button: Generate Main */}
                      {!generatedSet?.main && (
                        <Button
                          type="button"
                          onClick={handleGenerateMainImage}
                          disabled={!aiBaseImage || isGeneratingAI}
                          className="bg-purple-600 hover:bg-purple-700 text-white w-fit px-8"
                        >
                          {isGeneratingAI ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Step 1 생성 중...
                            </>
                          ) : (
                            <>
                              <Wand2 className="mr-2 h-4 w-4" />
                              Step 1 생성
                            </>
                          )}
                        </Button>
                      )}

                      {/* Step 2 Button: Generate Rest */}
                      {generatedSet?.main && (
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            onClick={handleGenerateRestImages}
                            disabled={isGeneratingAI}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                          >
                            {isGeneratingAI ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Step 2 생성 중...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Step 2 생성
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleGenerateMainImage}
                            disabled={isGeneratingAI}
                          >
                            Step 1 재생성
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Generation Results */}
                {generatedSet && (
                  <div className="space-y-4 border-t pt-6 animation-fade-in">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">생성 결과</Label>

                      {/* Show 'Apply' button only if full set is generated or at least main exists */}
                      <Button
                        type="button"
                        onClick={handleApplyAIImages}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={isGeneratingAI}
                      >
                        AI 이미지 적용하기
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-start gap-8">
                      {/* Main Image Result - Prominent */}
                      <div className="space-y-2 w-80 shrink-0">
                        <span className="text-xs font-bold uppercase text-gray-500">대표 이미지</span>
                        <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden relative group bg-gray-50">
                          {generatedSet?.main ? (
                            <img src={generatedSet.main} alt="AI Main" className="object-contain w-full h-full" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs">Waiting for Step 1...</div>
                          )}
                        </div>
                      </div>

                      {/* Gallery Images Result - Small Thumbnails */}
                      <div className="space-y-2 flex-1 min-w-[300px]">
                        <span className="text-xs font-bold uppercase text-gray-500">갤러리 이미지</span>
                        <div className="grid grid-cols-6 gap-2">
                          {generatedSet?.gallery && generatedSet.gallery.length > 0 ? (
                            generatedSet.gallery.map((img, idx) => {
                              const isSelected = selectedGalleryItems.includes(img);
                              return (
                                <div
                                  key={idx}
                                  className={`aspect-square rounded border overflow-hidden relative cursor-pointer hover:opacity-90 transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'}`}
                                  onClick={() => toggleGallerySelection(img)}
                                >
                                  <img src={img} alt={`AI Gallery ${idx}`} className="w-full h-full object-contain" />
                                  {isSelected && (
                                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">
                                      ✓
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="col-span-4 flex items-center justify-center border border-dashed rounded bg-gray-50 text-gray-400 text-sm p-4 h-32">
                              Step 2 생성 중...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Images Section */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('images')}>
              <CardTitle className="flex items-center justify-between">
                <span>{t("header.business.brandDetail.products.register.images")}</span>
                {openSections.images ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
            {openSections.images && (
              <CardContent>
                <div className="space-y-6">
                  {/* 대표 이미지 (Main Image) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>{t("header.business.brandDetail.products.register.mainImage")}</Label>
                    </div>
                    <ImageUploader
                      value={formData.thumbUrl}
                      onChange={(url) => setFormData(prev => ({ ...prev, thumbUrl: Array.isArray(url) ? url[0] : url || "" }))}
                      maxFiles={1}
                    />
                  </div>

                  {/* 추가 갤러리 이미지 (Gallery Images) */}
                  <div>
                    <Label>추가 갤러리 이미지 (Gallery Images)</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      상품 목록이나 갤러리에서 보여질 추가 이미지들입니다.
                    </p>
                    <ImageUploader
                      value={formData.images || []}
                      onChange={(urls) => setFormData(prev => ({ ...prev, images: Array.isArray(urls) ? urls : urls ? [urls] : [] }))}
                      single={false}
                      maxFiles={10}
                    />
                  </div>

                  {/* 상세 설명 이미지 (Detail Images) */}
                  <div className="pt-4 border-t">
                    <Label>{t("header.business.brandDetail.products.register.detailImages")}</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      상품 상세 페이지 본문에 들어갈 긴 설명 이미지들입니다.
                    </p>
                    <ImageUploader
                      value={formData.detailImages || []}
                      onChange={(urls) => setFormData(prev => ({ ...prev, detailImages: Array.isArray(urls) ? urls : urls ? [urls] : [] }))}
                      single={false}
                      maxFiles={10}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/business/brands/${brandId}/products`)}
            >
              {t("header.business.brandDetail.products.register.cancel")}
            </Button>
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending ? t("header.business.brandDetail.products.register.registering") : t("header.business.brandDetail.products.register.register")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
