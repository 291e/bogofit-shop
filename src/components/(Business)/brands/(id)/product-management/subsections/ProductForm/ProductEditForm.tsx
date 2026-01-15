"use client";

import { useState, useEffect } from "react";
import { ProductForm, ProductVariantForm, VariantOption, UpdateProductDto, UpdateProductVariantDto, CreateProductVariantDto } from "@/types/product";
import { useCategories } from "@/hooks/useCategories";
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useActivePromotions } from "@/hooks/usePromotions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/imageUploader";
import { ChevronDown, ChevronUp, Plus, Trash2, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryDropdown from "@/components/ui/category-dropdown";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/providers/languageProvider";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ProductEditFormProps {
  brandId: string;
  productId: string;
  className?: string;
}

export default function ProductEditForm({
  brandId,
  productId,
  className
}: ProductEditFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { uploadImage } = useImageUpload();

  // ✅ Use React Query for categories with caching
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const categories = categoriesData?.data || [];

  // ✅ Use React Query for product with caching
  const { data: productData, isLoading: isLoadingProduct, error: productError } = useProduct(productId);

  // ✅ Fetch active promotions for this brand
  const { promotions: activePromotions, loading: isLoadingPromotions } = useActivePromotions(brandId || "");

  // ✅ Use mutation hook for product update
  const [actualProductId, setActualProductId] = useState<string>(productId);
  const updateProductMutation = useUpdateProduct(brandId, actualProductId);

  // Section collapse states
  const [openSections, setOpenSections] = useState({
    basic: true,
    category: true,
    pricing: true,
    promotion: true,
    images: true,
    variants: true,
    sizeChart: true,
  });

  // Form data
  const [formData, setFormData] = useState<ProductForm>({
    brandId,
    name: "",
    slug: "",
    sku: "",
    isActive: true,
    description: "",
    categoryId: "",
    thumbUrl: "",
    images: [],
    detailImages: [],
    basePrice: 0,
    baseCompareAtPrice: 0,
    quantity: null,
    promotionId: null,
    variants: [],
    hasOptions: false
  });

  // Track variant IDs and deleted variants
  const [variantIds, setVariantIds] = useState<(string | undefined)[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);

  // Size Chart State
  const [measurementColumns, setMeasurementColumns] = useState<string[]>(["가슴단면", "총장", "어깨너비", "소매길이"]);
  const [measurementRows, setMeasurementRows] = useState<{ size: string; values: Record<string, string> }[]>([
    { size: "S", values: { "가슴단면": "", "총장": "", "어깨너비": "", "소매길이": "" } },
    { size: "M", values: { "가슴단면": "", "총장": "", "어깨너비": "", "소매길이": "" } },
    { size: "L", values: { "가슴단면": "", "총장": "", "어깨너비": "", "소매길이": "" } },
    { size: "XL", values: { "가슴단면": "", "총장": "", "어깨너비": "", "소매길이": "" } },
    { size: "FREE", values: { "가슴단면": "", "총장": "", "어깨너비": "", "소매길이": "" } }
  ]);

  // AI Generation State
  const [aiBaseImage, setAiBaseImage] = useState<string>("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedSet, setGeneratedSet] = useState<{
    main: string;
    gallery: string[];
    detail: string[];
  } | null>(null);
  const [selectedGalleryItems, setSelectedGalleryItems] = useState<string[]>([]);

  // ✅ Load product data from React Query
  useEffect(() => {
    let product;

    if (productData?.data && !Array.isArray(productData.data)) {
      product = productData.data;
    } else if (productData?.product && !Array.isArray(productData.product)) {
      product = productData.product;
    } else if (productData?.product && Array.isArray(productData.product)) {
      product = productData.product.find(p => p.slug === productId || p.id === productId);
    }

    if (product) {
      if (product.id) {
        setActualProductId(product.id);
      }

      setFormData({
        brandId: product.brandId,
        name: product.name,
        slug: product.slug,
        sku: product.sku || "",
        isActive: product.isActive ?? true,
        description: product.description || "",
        categoryId: product.categoryId || "",
        thumbUrl: product.thumbUrl || "",
        images: product.images || [],
        detailImages: product.detail_Images || [],
        basePrice: product.basePrice || 0,
        baseCompareAtPrice: product.baseCompareAtPrice || 0,
        quantity: product.quantity ?? null,
        promotionId: product.promotionId ?? null,
        variants: product.variants?.map((variant: any) => ({
          price: variant.price || 0,
          compareAtPrice: variant.compareAtPrice || 0,
          quantity: variant.quantity || 0,
          weightGrams: variant.weightGrams || 0,
          status: (variant.status as "active" | "paused" | "archived") || "active",
          options: variant.optionsJson ? JSON.parse(variant.optionsJson).map((opt: Record<string, string | number>) => {
            const entries = Object.entries(opt);
            return entries.length > 0 ? { key: entries[0][0], value: String(entries[0][1]) } : { key: '', value: '' };
          }) : []
        })) || [],
        hasOptions: (product.variants && product.variants.length > 0) || false
      });

      // Initialize Size Chart Data
      if (product.product_Details && product.product_Details.length > 0) {
        try {
          // Parse JSON strings back to objects
          const parsedRows = product.product_Details.map((row: string) => {
            // Handle case where row might be an object if already parsed logic exists, otherwise parse string
            return typeof row === 'string' ? JSON.parse(row) : row;
          });

          if (parsedRows.length > 0) {
            setMeasurementRows(parsedRows);
            // Extract all unique columns from all rows
            const allKeys = new Set<string>();
            parsedRows.forEach((row: any) => {
              if (row.values) {
                Object.keys(row.values).forEach(k => allKeys.add(k));
              }
            });
            if (allKeys.size > 0) {
              setMeasurementColumns(Array.from(allKeys));
            }
          }
        } catch (e) {
          console.error("Failed to parse size chart data:", e);
        }
      }

      setVariantIds(product.variants?.map((v: { id?: string }) => v.id) || []);
    } else if (productError) {
      toast.error(t("header.business.brandDetail.products.edit.errorLoading"));
      router.push(`/business/brands/${brandId}/products`);
    }
  }, [productData, productError, brandId, router, productId, t]);

  const handleSlugChange = (slug: string) => {
    const sanitized = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9가-힣-]/g, '').replace(/-+/g, '-').trim();
    setFormData(prev => ({ ...prev, slug: sanitized }));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariantForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => i === index ? { ...variant, [field]: value } : variant)
    }));
  };

  const addVariant = () => {
    setFormData(prev => {
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
    setVariantIds(prev => [...prev, undefined]);
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 0) {
      const variantId = variantIds[index];
      if (variantId) {
        setDeletedVariantIds(prev => [...prev, variantId]);
      }
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
      setVariantIds(prev => prev.filter((_, i) => i !== index));
    }
  };

  // AI Helper Functions
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

  const toggleGallerySelection = (url: string) => {
    setSelectedGalleryItems(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  };

  const handleGenerateMainImage = async () => {
    if (!aiBaseImage) {
      toast.error("Please upload a reference image first");
      return;
    }
    setIsGeneratingAI(true);
    setGeneratedSet(null);
    setSelectedGalleryItems([]);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseImage: aiBaseImage, productName: formData.name || "Product", aspectRatio: 'hero' })
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedSet({ main: data.imageUrl, gallery: [], detail: [] });
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

  const handleGenerateRestImages = async () => {
    if (!aiBaseImage) return;
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseImage: generatedSet?.main || aiBaseImage, productName: formData.name || "Product", generateRest: true })
      });
      const data = await response.json();
      if (data.success) {
        const newImages = data.galleryImages || [];
        setGeneratedSet(prev => ({
          main: prev?.main || "",
          gallery: [...(prev?.gallery || []), ...newImages],
          detail: []
        }));
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

  const handleApplyAIImages = async () => {
    if (!generatedSet) return;
    const galleryToApply = selectedGalleryItems.length > 0 ? selectedGalleryItems : generatedSet.gallery;
    if (!generatedSet.main && galleryToApply.length === 0) {
      toast.error("No images to apply!");
      return;
    }

    setIsGeneratingAI(true);
    const toastId = toast.loading("Uploading AI images to S3...");

    try {
      const timestamp = Date.now();
      let newThumbUrl = formData.thumbUrl;

      if (generatedSet.main && generatedSet.main.startsWith('data:')) {
        const mainFile = base64ToFile(generatedSet.main, `ai-main-${timestamp}.png`);
        const url = await uploadImage(mainFile, 'products');
        if (url) newThumbUrl = url;
      }

      const newGalleryUrls: string[] = [];
      for (let i = 0; i < galleryToApply.length; i++) {
        const imgData = galleryToApply[i];
        if (imgData.startsWith('data:')) {
          const file = base64ToFile(imgData, `ai-gallery-${timestamp}-${i}.png`);
          const url = await uploadImage(file, 'products');
          if (url) newGalleryUrls.push(url);
        } else {
          newGalleryUrls.push(imgData);
        }
      }

      setFormData(prev => ({
        ...prev,
        thumbUrl: newThumbUrl,
        images: [...(prev.images || []), ...newGalleryUrls]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];
    if (!formData.name.trim()) errors.push(t("header.business.brandDetail.products.register.validationErrors.productNameRequired"));
    if (!formData.slug.trim()) errors.push(t("header.business.brandDetail.products.register.validationErrors.slugRequired"));
    if (!formData.sku?.trim()) errors.push(t("header.business.brandDetail.products.register.validationErrors.skuRequired"));
    if (!formData.categoryId) errors.push(t("header.business.brandDetail.products.register.validationErrors.categoryRequired"));
    if (formData.basePrice <= 0) errors.push(t("header.business.brandDetail.products.register.validationErrors.basePriceRequired"));
    if (!formData.thumbUrl) errors.push(t("header.business.brandDetail.products.register.validationErrors.mainImageRequired"));

    if (formData.hasOptions) {
      if (formData.variants.length === 0) {
        errors.push(t("header.business.brandDetail.products.register.validationErrors.variantRequired"));
      }
      formData.variants.forEach((variant, index) => {
        if (variant.quantity === undefined || variant.quantity === null || variant.quantity < 0) {
          errors.push(t("header.business.brandDetail.products.register.validationErrors.variantQuantityRequired", { index: index + 1 }));
        }
        if (!variant.options || variant.options.length === 0) {
          errors.push(t("header.business.brandDetail.products.register.validationErrors.variantOptionRequired", { index: index + 1 }));
        }
      });
    } else {
      if (formData.quantity !== null && (formData.quantity ?? -1) < 0) {
        errors.push(t("header.business.brandDetail.products.register.validationErrors.quantityInvalid"));
      }
    }

    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    try {
      const updateVariants = formData.variants
        .map((variant, index) => {
          const id = variantIds[index];
          if (!id) return null;
          return {
            id,
            price: variant.price ?? 0,
            compareAtPrice: variant.compareAtPrice ?? 0,
            quantity: variant.quantity ?? 0,
            weightGrams: variant.weightGrams ?? 0,
            status: variant.status || "active",
            optionsJson: variant.options.length > 0 ? JSON.stringify(variant.options.map(opt => ({ [opt.key]: opt.value }))) : undefined
          };
        })
        .filter(Boolean) as UpdateProductVariantDto[];

      const newVariants = formData.variants
        .map((variant, index) => {
          const id = variantIds[index];
          if (id) return null;
          return {
            price: variant.price ?? 0,
            compareAtPrice: variant.compareAtPrice ?? 0,
            quantity: variant.quantity ?? 0,
            weightGrams: variant.weightGrams ?? 0,
            status: variant.status || "active",
            optionsJson: variant.options.length > 0 ? JSON.stringify(variant.options.map(opt => ({ [opt.key]: opt.value }))) : undefined
          };
        })
        .filter(Boolean) as CreateProductVariantDto[];

      let promotionIdToSend: string | undefined = undefined;
      const originalPromotionId = productData?.data?.promotionId || productData?.product?.promotionId;

      if (formData.promotionId !== originalPromotionId) {
        if (formData.promotionId === null) {
          promotionIdToSend = "00000000-0000-0000-0000-000000000000";
        } else {
          promotionIdToSend = formData.promotionId || undefined;
        }
      }

      // Prepare Size Chart Data
      let productDetailsToSend: string[] | undefined = undefined;
      if (measurementRows && measurementRows.length > 0) {
        productDetailsToSend = measurementRows.map(row => JSON.stringify(row));
      }

      const dto: UpdateProductDto = {
        name: formData.name || undefined,
        slug: formData.slug || undefined,
        sku: formData.sku || undefined,
        isActive: formData.isActive,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        thumbUrl: formData.thumbUrl || undefined,
        images: formData.images,
        detail_Images: formData.detailImages, // Updated to include detail images
        product_Details: productDetailsToSend, // Updated to include Size Chart
        basePrice: formData.basePrice,
        baseCompareAtPrice: formData.baseCompareAtPrice,
        quantity: formData.hasOptions ? undefined : (formData.quantity ?? null),
        promotionId: promotionIdToSend,
        updateVariants: updateVariants.length > 0 ? updateVariants : undefined,
        newVariants: newVariants.length > 0 ? newVariants : undefined,
        deleteVariants: deletedVariantIds.length > 0 ? deletedVariantIds : undefined
      };

      await updateProductMutation.mutateAsync(dto);
      setTimeout(() => {
        router.push(`/business/brands/${brandId}/products`);
      }, 500);
    } catch (error) {
      console.error('Product update error:', error);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t("header.business.brandDetail.products.edit.loading") || "상품 정보를 불러오는 중..."}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">{t("header.business.brandDetail.products.register.slug")}</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
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
            </div>
          </CardContent>
        )}
      </Card>

      {/* Dynamic Size Chart Builder */}
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

      {/* AI Image Studio */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50 cursor-pointer" onClick={() => toggleSection('images')}>
          <CardTitle className="flex items-center justify-between text-gray-900">
            <div className="flex items-center gap-2">
              <span>이미지 생성 (AI Studio)</span>
            </div>
            {openSections.images ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {openSections.images && (
          <CardContent className="space-y-6 pt-6">
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
                    원본 이미지를 업로드해주세요. AI가 대표 및 갤러리 이미지를 생성합니다.
                  </p>
                  {!generatedSet?.main && (
                    <Button
                      type="button"
                      onClick={handleGenerateMainImage}
                      disabled={!aiBaseImage || isGeneratingAI}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-fit px-8"
                    >
                      {isGeneratingAI ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />생성 중...</> : <><Wand2 className="mr-2 h-4 w-4" />Step 1 생성</>}
                    </Button>
                  )}
                  {generatedSet?.main && (
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={handleGenerateRestImages}
                        disabled={isGeneratingAI}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      >
                        {isGeneratingAI ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />생성 중...</> : <><Sparkles className="mr-2 h-4 w-4" />Step 2 생성</>}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleGenerateMainImage} disabled={isGeneratingAI}>
                        Step 1 재생성
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {generatedSet && (
              <div className="space-y-4 border-t pt-6 animation-fade-in">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">생성 결과</Label>
                  <Button type="button" onClick={handleApplyAIImages} className="bg-green-600 hover:bg-green-700 text-white" disabled={isGeneratingAI}>
                    AI 이미지 적용하기
                  </Button>
                </div>
                <div className="flex flex-wrap items-start gap-8">
                  <div className="space-y-2 w-80 shrink-0">
                    <span className="text-xs font-bold uppercase text-gray-500">대표 이미지</span>
                    <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden relative bg-gray-50">
                      {generatedSet?.main ? <img src={generatedSet.main} alt="AI Main" className="object-contain w-full h-full" /> : <div className="flex items-center justify-center h-full text-gray-400 text-xs">Waiting...</div>}
                    </div>
                  </div>
                  <div className="space-y-2 flex-1 min-w-[300px]">
                    <span className="text-xs font-bold uppercase text-gray-500">갤러리 이미지</span>
                    <div className="grid grid-cols-6 gap-2">
                      {generatedSet?.gallery && generatedSet.gallery.length > 0 ? (
                        generatedSet.gallery.map((img, idx) => (
                          <div key={idx} className={`aspect-square rounded border overflow-hidden relative cursor-pointer ${selectedGalleryItems.includes(img) ? 'ring-2 ring-blue-500' : ''}`} onClick={() => toggleGallerySelection(img)}>
                            <img src={img} alt={`AI Gallery ${idx}`} className="w-full h-full object-contain" />
                            {selectedGalleryItems.includes(img) && <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm">✓</div>}
                          </div>
                        ))
                      ) : <div className="col-span-4 border border-dashed rounded bg-gray-50 text-gray-400 text-sm p-4 h-32 flex items-center justify-center">Step 2 생성 중...</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Images Upload Section */}
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
              <div>
                <Label>{t("header.business.brandDetail.products.register.mainImage")}</Label>
                <ImageUploader
                  value={formData.thumbUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbUrl: Array.isArray(url) ? url[0] : url || "" }))}
                  maxFiles={1}
                />
              </div>
              <div>
                <Label>추가 갤러리 이미지</Label>
                <ImageUploader
                  value={formData.images || []}
                  onChange={(urls) => setFormData(prev => ({ ...prev, images: Array.isArray(urls) ? urls : urls ? [urls] : [] }))}
                  single={false}
                  maxFiles={10}
                />
              </div>
              <div className="pt-4 border-t">
                <Label>{t("header.business.brandDetail.products.register.detailImages")}</Label>
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

      {/* Variants Section */}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value === '' ? null : Number(e.target.value) }))}
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
                    {formData.hasOptions ? t("header.business.brandDetail.products.register.useVariantsDescription") : t("header.business.brandDetail.products.register.noVariantsDescription")}
                  </p>
                </div>
                <Switch
                  checked={formData.hasOptions}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      const existingVariantIds = variantIds.filter((id): id is string => !!id);
                      if (existingVariantIds.length > 0) setDeletedVariantIds(prev => [...prev, ...existingVariantIds]);
                      setVariantIds([]);
                    }
                    setFormData(prev => ({
                      ...prev,
                      hasOptions: checked,
                      variants: checked && prev.variants.length === 0 ? [{
                        price: prev.basePrice,
                        compareAtPrice: prev.baseCompareAtPrice,
                        quantity: 0,
                        weightGrams: 0,
                        status: "active",
                        options: [{ key: "사이즈", value: "" }, { key: "색깔", value: "" }]
                      }] : (checked ? prev.variants : [])
                    }));
                    if (checked && variantIds.length === 0) setVariantIds([undefined]);
                  }}
                />
              </div>

              {formData.hasOptions && (
                <div className="grid grid-cols-4 gap-4">
                  {formData.variants.map((variant, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardHeader className="pb-3 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t("header.business.brandDetail.products.register.variant", { index: index + 1 })}</span>
                          {formData.variants.length > 1 && (
                            <Button type="button" size="sm" variant="destructive" onClick={() => removeVariant(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>{t("header.business.brandDetail.products.register.quantity")}</Label>
                            <Input type="number" value={variant.quantity} onChange={(e) => handleVariantChange(index, 'quantity', Number(e.target.value))} required />
                          </div>
                        </div>
                        <div>
                          <Label>{t("header.business.brandDetail.products.register.options")}</Label>
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
                                <Button type="button" size="sm" variant="outline" onClick={() => {
                                  const newOptions = variant.options.filter((_, i) => i !== optionIndex);
                                  handleVariantChange(index, 'options', newOptions);
                                }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button type="button" size="sm" variant="outline" onClick={() => {
                              const newOptions = [...variant.options, { key: '', value: '' }];
                              handleVariantChange(index, 'options', newOptions);
                            }}>
                              <Plus className="h-4 w-4 mr-2" />
                              {t("header.business.brandDetail.products.register.addOption")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={addVariant} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("header.business.brandDetail.products.register.addVariant")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/business/brands/${brandId}/products`)}
        >
          {t("header.business.brandDetail.products.register.cancel")}
        </Button>
        <Button type="submit" disabled={updateProductMutation.isPending}>
          {updateProductMutation.isPending ? t("header.business.brandDetail.products.register.registering") : t("header.business.brandDetail.products.edit.update")}
        </Button>
      </div>
    </form>
  );
}
