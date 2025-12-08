"use client";

import { useState } from "react";
import { ProductForm, ProductVariantForm, VariantOption, convertProductFormToDto } from "@/types/product";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct } from "@/hooks/useProducts";
import { useAIImageGeneration } from "@/hooks/useAIImageGeneration";
import { useActivePromotions } from "@/hooks/usePromotions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CategoryDropdown from "@/components/ui/category-dropdown";
import { ImageUploader } from "@/components/ui/imageUploader";
import { ChevronDown, ChevronUp, Plus, Trash2, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/providers/languageProvider";

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

  // ✅ Section collapse states - must be called before early returns
  const [openSections, setOpenSections] = useState({
    basic: true,
    category: true,
    pricing: true,
    images: true,
    variants: true,
  });

  // ✅ Form data - must be called before early returns
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
    basePrice: 0,
    baseCompareAtPrice: 0,
    quantity: null, // Product-level inventory (null = unlimited)
    variants: [], // Start with EMPTY array - variants are OPTIONAL
    hasOptions: false
  });

  // ✅ Use mutation hook for product creation (handles toast & cache automatically)
  const createProduct = useCreateProduct(brandId || "");

  // ✅ AI Image Generation hook
  const { generateImage } = useAIImageGeneration();

  // ✅ Detail Images Generator state (4 images: Hero, Features, Lifestyle, Info)
  const [generatedDetailImages, setGeneratedDetailImages] = useState<{ type: string, url: string }[]>([]);
  const [selectedDetailImages, setSelectedDetailImages] = useState<Set<string>>(new Set());
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);

  // ✅ AI Auto Fill state
  const [isAnalyzingProduct, setIsAnalyzingProduct] = useState(false);

  // Early return if no brandId
  if (!brandId) {
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

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setFormData(prev => ({ ...prev, name, slug }));
  };

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
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        price: prev.basePrice,
        compareAtPrice: prev.baseCompareAtPrice,
        quantity: 0,
        weightGrams: 0,
        status: "active",
        options: []
      }]
    }));
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
      // Has variants - validate each variant
      if (formData.variants.length === 0) {
        errors.push(t("header.business.brandDetail.products.register.validationErrors.variantRequired"));
      }

      formData.variants.forEach((variant, index) => {
        // Validate quantity
        if (variant.quantity === undefined || variant.quantity === null || variant.quantity < 0) {
          errors.push(t("header.business.brandDetail.products.register.validationErrors.variantQuantityRequired", { index: index + 1 }));
        }

        // Options are now optional - only validate if provided
        if (variant.options && variant.options.length > 0) {
          variant.options.forEach((option, optionIndex) => {
            if (!option.key?.trim() || !option.value?.trim()) {
              errors.push(t("header.business.brandDetail.products.register.validationErrors.variantOptionRequired", { index: index + 1, optionIndex: optionIndex + 1 }));
            }
          });
        }
      });
    } else {
      // No variants - product-level inventory validation
      if (formData.quantity !== null && formData.quantity !== undefined && formData.quantity < 0) {
        errors.push(t("header.business.brandDetail.products.register.validationErrors.quantityInvalid"));
      }
    }

    if (errors.length > 0) {
      // Show validation errors
      toast.error(errors.join(", "));
      return;
    }

    try {
      // ✅ Use mutation hook - handles API call, toast, and cache update
      const dto = convertProductFormToDto(formData);

      // 🔍 Log data being sent to backend
      console.log('📤 Sending product data to backend:', {
        ...dto,
        promotionId: dto.promotionId || '(No promotion selected)',
        hasPromotion: !!dto.promotionId
      });

      await createProduct.mutateAsync(dto);

      // ✅ Delay 0.5s for better UX (show toast & cache already updated!)
      setTimeout(() => {
        router.push(`/business/brands/${brandId}/products`);
      }, 500);
    } catch (error) {
      // Error toast already handled in mutation hook
      console.error('Product creation error:', error);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };


  // ✅ Generate Detail Images (4 images: Hero, Features, Lifestyle, Info)
  const handleGenerateDetailImages = async () => {
    if (!formData.thumbUrl) {
      toast.error(t("header.business.brandDetail.products.register.toastMessages.mainImageRequired"));
      return;
    }

    if (!formData.name) {
      toast.error("제품명을 먼저 입력해주세요.");
      return;
    }

    try {
      setIsGeneratingDetails(true);
      setGeneratedDetailImages([]);
      setSelectedDetailImages(new Set());

      toast.info("4장의 상세 이미지 생성 중... (15-20초 소요)");

      // Convert image URL to base64
      const response = await fetch(formData.thumbUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Build info text for Info image (Korean)
      const textSections: string[] = [];
      if (formData.name) textSections.push(`제품명: ${formData.name}`);
      if (formData.description) textSections.push(`설명: ${formData.description}`);

      // Add price information
      if (formData.basePrice) {
        textSections.push(`가격: ₩${formData.basePrice.toLocaleString()}`);
        if (formData.baseCompareAtPrice) {
          textSections.push(`정가: ₩${formData.baseCompareAtPrice.toLocaleString()}`);
        }
      }

      // Add variants information (sizes, colors, etc.)
      if (formData.hasOptions && formData.variants.length > 0) {
        const sizes = new Set<string>();
        const colors = new Set<string>();
        const otherOptions = new Map<string, Set<string>>();

        formData.variants.forEach(variant => {
          variant.options.forEach(option => {
            const key = option.key?.toLowerCase() || '';
            const value = option.value || '';

            if (key.includes('size') || key.includes('사이즈')) {
              sizes.add(value);
            } else if (key.includes('color') || key.includes('색상') || key.includes('컬러')) {
              colors.add(value);
            } else if (key && value) {
              if (!otherOptions.has(option.key!)) {
                otherOptions.set(option.key!, new Set());
              }
              otherOptions.get(option.key!)!.add(value);
            }
          });
        });

        if (sizes.size > 0) {
          textSections.push(`사이즈: ${Array.from(sizes).join(', ')}`);
        }
        if (colors.size > 0) {
          textSections.push(`색상: ${Array.from(colors).join(', ')}`);
        }
        otherOptions.forEach((values, key) => {
          textSections.push(`${key}: ${Array.from(values).join(', ')}`);
        });
      }

      const infoPrompt = textSections.join('\n');

      // Define 4 image types
      const types = [
        { id: 'hero', label: 'Hero Image' },
        { id: 'features', label: 'Features' },
        { id: 'lifestyle', label: 'Lifestyle' },
        { id: 'info', label: 'Info & Size', prompt: infoPrompt }
      ];

      // Fire requests in parallel
      const promises = types.map(async (type) => {
        try {
          const result = await generateImage({
            baseImage: base64.split(',')[1],
            prompt: type.prompt || "",
            productName: formData.name,
            aspectRatio: type.id, // Pass type as aspect ratio to trigger specific prompt
          });

          if (result.success && result.imageUrl) {
            return { type: type.label, url: result.imageUrl };
          }
          return null;
        } catch (error) {
          console.error(`Failed to generate ${type.label}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter((r): r is { type: string, url: string } => r !== null);

      // Sort by fixed order
      const order = ['Hero Image', 'Features', 'Lifestyle', 'Info & Size'];
      validResults.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

      setGeneratedDetailImages(validResults);

      if (validResults.length > 0) {
        toast.success(`${validResults.length}장의 상세 이미지가 생성되었습니다!`);
      } else {
        toast.error("이미지 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error('Detail images generation error:', error);
      toast.error("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  // Toggle image selection
  const toggleImageSelection = (url: string) => {
    setSelectedDetailImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  // Add selected images to product detail images
  const handleAddSelectedImages = () => {
    if (selectedDetailImages.size === 0) {
      toast.error("추가할 이미지를 선택해주세요.");
      return;
    }

    const selectedUrls = Array.from(selectedDetailImages);
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...selectedUrls]
    }));

    toast.success(`${selectedDetailImages.size}장의 이미지가 상세 이미지에 추가되었습니다.`);

    // Clear selection and generated images
    setGeneratedDetailImages([]);
    setSelectedDetailImages(new Set());
  };


  // ✅ AI Auto Fill - Analyze product image and auto-fill form
  const handleAIAutoFill = async () => {
    if (!formData.thumbUrl) {
      toast.error(t("header.business.brandDetail.products.register.toastMessages.mainImageRequiredForFitting"));
      return;
    }

    try {
      setIsAnalyzingProduct(true);
      toast.info(t("header.business.brandDetail.products.register.toastMessages.aiAnalyzing"));

      // Convert image URL to base64
      const response = await fetch(formData.thumbUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Image = (reader.result as string).split(',')[1];

          const analysisResponse = await fetch('/api/ai/analyze-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
          });

          const analysisData = await analysisResponse.json();

          if (analysisData.success && analysisData.data) {
            const { name, description, category, categoryHint } = analysisData.data;

            // Auto-fill form
            setFormData(prev => {
              const updates: Partial<ProductForm> = {};

              // Only update if field is empty
              if (!prev.name && name) {
                updates.name = name;
                // Auto-generate slug from name
                const slug = name
                  .toLowerCase()
                  .replace(/[^a-z0-9가-힣\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim();
                updates.slug = slug;
              }

              if (!prev.description && description) {
                updates.description = description;
              }

              return { ...prev, ...updates };
            });

            // Try to match category - recursive search in nested categories
            if (category && categories.length > 0) {
              const findCategoryRecursive = (cats: typeof categories, searchTerm: string, categoryHint?: string): typeof categories[0] | null => {
                for (const cat of cats) {
                  const catName = cat.name.toLowerCase();

                  // Try to match with category hint first (more specific)
                  if (categoryHint) {
                    const hintLower = categoryHint.toLowerCase();
                    if (catName.includes(hintLower) || hintLower.includes(catName)) {
                      return cat;
                    }
                  }

                  // Match with main category type
                  const matchesMainType =
                    (searchTerm === "상의" && (catName.includes("상의") || catName.includes("top"))) ||
                    (searchTerm === "하의" && (catName.includes("하의") || catName.includes("bottom"))) ||
                    (searchTerm === "원피스" && (catName.includes("원피스") || catName.includes("dress") || catName.includes("onepiece"))) ||
                    (searchTerm === "아우터" && (catName.includes("아우터") || catName.includes("outer") || catName.includes("jacket")));

                  if (matchesMainType) {
                    return cat;
                  }

                  // Search in children recursively
                  if (cat.children && cat.children.length > 0) {
                    const found = findCategoryRecursive(cat.children, searchTerm, categoryHint);
                    if (found) return found;
                  }
                }
                return null;
              };

              // Try to find category using categoryHint first, then category
              let categoryMatch = null;
              if (categoryHint) {
                categoryMatch = findCategoryRecursive(categories, category, categoryHint);
              }

              // If not found with hint, try without hint
              if (!categoryMatch) {
                categoryMatch = findCategoryRecursive(categories, category);
              }

              if (categoryMatch && !formData.categoryId) {
                setFormData(prev => ({ ...prev, categoryId: categoryMatch!.id }));
              }
            }

            toast.success(t("header.business.brandDetail.products.register.toastMessages.aiAutoFilled"));
          } else {
            toast.error(t("header.business.brandDetail.products.register.toastMessages.imageAnalysisFailed"));
          }
        } catch {
          toast.error(t("header.business.brandDetail.products.register.toastMessages.aiAnalysisError"));
        } finally {
          setIsAnalyzingProduct(false);
        }
      };

      reader.readAsDataURL(blob);
    } catch {
      toast.error(t("header.business.brandDetail.products.register.toastMessages.imageLoadError"));
      setIsAnalyzingProduct(false);
    }
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
                {/* 상품명, 슬러그, SKU - 3 cột */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">{t("header.business.brandDetail.products.register.productName")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
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

                {/* 상품 설명 - full width */}
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
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-900">할인 후 가격 (Final Price):</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">₩{finalPrice.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 line-through">₩{formData.basePrice.toLocaleString()}</div>
                          </div>
                        </div>
                        <p className="text-xs text-green-700 mt-2">
                          {selectedPromo.name} 적용됨 ({selectedPromo.type === 'percentage' ? `${selectedPromo.value}% 할인` : `₩${selectedPromo.value?.toLocaleString()} 할인`})
                        </p>
                      </div>
                    );
                  })()}
                </div>

              </CardContent>
            )}
          </Card>

          {/* Inventory Section - v2.0: Product + Variants */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('variants')}>
              <CardTitle className="flex items-center justify-between">
                <span>{t("header.business.brandDetail.products.register.inventoryManagement")}</span>
                {openSections.variants ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
            {openSections.variants && (
              <CardContent className="space-y-6">
                {/* 1. Product-level Inventory */}
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <Label className="text-base font-semibold text-blue-900">{t("header.business.brandDetail.products.register.productLevelStock")}</Label>
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

                {/* 2. Variants Toggle & Management */}
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
                          // If switching to variants, ensure at least one variant
                          variants: checked && prev.variants.length === 0 ? [{
                            price: prev.basePrice,
                            compareAtPrice: prev.baseCompareAtPrice,
                            quantity: 0,
                            weightGrams: 0,
                            status: "active",
                            options: []
                          }] : prev.variants
                        }));
                      }}
                    />
                  </div>
                  {/* Only show variants when hasOptions is true */}
                  {formData.hasOptions && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <Label className="text-base font-semibold text-green-900">{t("header.business.brandDetail.products.register.variantLevelStock")}</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {formData.variants.map((variant, index) => (
                          <Card key={index} className="border-2 border-green-200">
                            <CardHeader className="pb-3 bg-green-50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-green-900">{t("header.business.brandDetail.products.register.variant", { index: index + 1 })}</span>
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
                              {/* 1. 수량 */}
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

                              {/* 2. 옵션 (v2.0: Optional) */}
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

                              {/* 3. 추가 정보 (Collapsible) */}
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
                      {formData.thumbUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAIAutoFill}
                          disabled={isAnalyzingProduct}
                          className="text-xs"
                        >
                          {isAnalyzingProduct ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                              {t("header.business.brandDetail.products.register.analyzingForFitting")}
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              {t("header.business.brandDetail.products.register.aiAutoFill")}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <ImageUploader
                      value={formData.thumbUrl}
                      onChange={(url) => setFormData(prev => ({ ...prev, thumbUrl: Array.isArray(url) ? url[0] : url || "" }))}
                      maxFiles={1}
                    />
                  </div>

                  {/* 상세 이미지 (Detail Images) */}
                  <div>
                    <Label>{t("header.business.brandDetail.products.register.detailImages")}</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      {t("header.business.brandDetail.products.register.aiGeneratedImages")}
                    </p>
                    <ImageUploader
                      value={formData.images}
                      onChange={(urls) => setFormData(prev => ({ ...prev, images: Array.isArray(urls) ? urls : urls ? [urls] : [] }))}
                      single={false}
                      maxFiles={10}
                    />

                    {/* ✅ Detail Images Generator (4 images) */}
                    {formData.thumbUrl && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">상세 이미지 생성 (4장)</span>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">
                          제품 정보를 바탕으로 Hero, Features, Lifestyle, Info 4가지 타입의 상세 이미지를 자동 생성합니다.
                        </p>
                        <Button
                          type="button"
                          onClick={handleGenerateDetailImages}
                          disabled={isGeneratingDetails || !formData.name}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                        >
                          {isGeneratingDetails ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              상세 이미지 생성 중... (15-20초)
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              상세 이미지 4장 생성하기
                            </>
                          )}
                        </Button>

                        {/* Generated Images Grid */}
                        {generatedDetailImages.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                생성된 이미지 ({generatedDetailImages.length}/4)
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleAddSelectedImages}
                                disabled={selectedDetailImages.size === 0}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                선택한 이미지 추가 ({selectedDetailImages.size})
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                              {generatedDetailImages.map((img, index) => (
                                <div key={index} className="relative group">
                                  <div className="relative aspect-[9/16] max-h-[600px] mx-auto rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                                    <img
                                      src={img.url}
                                      alt={img.type}
                                      className="w-full h-full object-contain"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                      {img.type}
                                    </div>
                                    <div className="absolute top-2 right-2">
                                      <input
                                        type="checkbox"
                                        checked={selectedDetailImages.has(img.url)}
                                        onChange={() => toggleImageSelection(img.url)}
                                        className="w-5 h-5 cursor-pointer"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
