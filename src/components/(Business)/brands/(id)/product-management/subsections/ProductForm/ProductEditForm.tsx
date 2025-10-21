"use client";

import { useState, useEffect } from "react";
import { ProductForm, ProductVariantForm, VariantOption, UpdateProductDto, UpdateProductVariantDto, CreateProductVariantDto } from "@/types/product";
import { useCategories } from "@/hooks/useCategories";
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/imageUploader";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryDropdown from "@/components/ui/category-dropdown";
import { Switch } from "@/components/ui/switch";
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
  
  // 🔍 Debug: Log props
  console.log('🔍 ProductEditForm mounted with props:', { brandId, productId });
  
  // const { token } = useBrandContext(); // Unused - using React Query
  
  // ✅ Use React Query for categories with caching
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const categories = categoriesData?.data || [];
  
  // ✅ Use React Query for product with caching
  const { data: productData, isLoading: isLoadingProduct, error: productError } = useProduct(productId);
  
  // 🔍 Debug: Log productData state
  console.log('🔍 useProduct result:', {
    productId,
    hasData: !!productData,
    isLoading: isLoadingProduct,
    hasError: !!productError,
    productData
  });
  
  // ✅ Use mutation hook for product update (handles toast & cache automatically)
  const updateProductMutation = useUpdateProduct(brandId, productId);

  // Section collapse states
  const [openSections, setOpenSections] = useState({
    basic: true,
    category: true,
    pricing: true,
    images: true,
    variants: true,
  });

  // Form data
  const [formData, setFormData] = useState<ProductForm>({
    brandId,
    name: "",
    slug: "",
    sku: "",
    isActive: true,  // ✅ Default active khi tạo mới
    description: "",
    categoryId: "",
    thumbUrl: "",
    images: [],
    basePrice: 0,
    baseCompareAtPrice: 0,
    quantity: null,
    variants: [],
    hasOptions: false
  });

  // Track variant IDs and deleted variants
  const [variantIds, setVariantIds] = useState<(string | undefined)[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);

  // ✅ Load product data from React Query
  useEffect(() => {
    // ✅ FIX: API returns productData.product, not productData.data
    const product = productData?.data || productData?.product;
    
    if (productData?.success && product) {
      console.log('📝 Loading product data for edit:', product);
      console.log('  - Name:', product.name);
      console.log('  - ThumbUrl:', product.thumbUrl);
      console.log('  - Images:', product.images);
      console.log('  - BasePrice:', product.basePrice);
      console.log('  - Variants:', product.variants);
      
      setFormData({
        brandId: product.brandId,
        name: product.name,
        slug: product.slug,
        sku: product.sku || "",
        isActive: product.isActive ?? true,  // ✅ Load isActive from product
        description: product.description || "",
        categoryId: product.categoryId || "",
        thumbUrl: product.thumbUrl || "",
        images: product.images || [],
        basePrice: product.basePrice || 0,
        baseCompareAtPrice: product.baseCompareAtPrice || 0,
        quantity: product.quantity ?? null,
        variants: product.variants?.map((variant: { id?: string; price?: number; compareAtPrice?: number; quantity?: number; weightGrams?: number; status?: string; optionsJson?: string }) => ({
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
      
      // Store variant IDs
      setVariantIds(product.variants?.map((v: { id?: string }) => v.id) || []);
      
      console.log('✅ Form data set successfully');
    } else if (productError) {
      console.error("❌ Failed to load product:", productError);
      toast.error("상품 정보를 불러올 수 없습니다.");
      router.push(`/business/brands/${brandId}/products`);
    }
  }, [productData, productError, brandId, router]);

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
    // Add undefined ID for new variant
    setVariantIds(prev => [...prev, undefined]);
  };

  // Remove variant
  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const variantId = variantIds[index];
      
      // If variant has ID, add to deleted list
      if (variantId) {
        setDeletedVariantIds(prev => [...prev, variantId]);
      }
      
      // Remove from UI
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
      setVariantIds(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push("상품명을 입력해주세요");
    if (!formData.slug.trim()) errors.push("슬러그를 입력해주세요");
    if (!formData.sku?.trim()) errors.push("SKU를 입력해주세요");
    if (!formData.categoryId) errors.push("카테고리를 선택해주세요");
    if (formData.basePrice <= 0) errors.push("기본 가격을 입력해주세요");
    if (!formData.thumbUrl) errors.push("대표 이미지를 업로드해주세요");

    // Validate inventory depending on hasOptions
    if (formData.hasOptions) {
      formData.variants.forEach((variant, index) => {
        if (variant.quantity === undefined || variant.quantity === null || variant.quantity < 0) {
          errors.push(`변형 ${index + 1}: 수량을 입력해주세요`);
        }
        if (!variant.options || variant.options.length === 0) {
          errors.push(`변형 ${index + 1}: 옵션을 하나 이상 추가해주세요`);
        } else {
          variant.options.forEach((option, optionIndex) => {
            if (!option.key?.trim() || !option.value?.trim()) {
              errors.push(`변형 ${index + 1} 옵션 ${optionIndex + 1}: 옵션명과 옵션값을 입력해주세요`);
            }
          });
        }
      });
    } else {
      if (formData.quantity !== null && formData.quantity! < 0) {
        errors.push('상품 수량은 0 이상이어야 합니다');
      }
    }
    
    if (errors.length > 0) {
      // Show validation errors
      toast.error(errors.join(", "));
      return;
    }

    try {
      // Separate new variants from existing variants
      const updateVariants = formData.variants
        .map((variant, index) => {
          const id = variantIds[index];
          if (!id) return null; // Skip new variants
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
        .filter(Boolean);

      const newVariants = formData.variants
        .map((variant, index) => {
          const id = variantIds[index];
          if (id) return null; // Skip existing variants
          return {
            price: variant.price ?? 0,
            compareAtPrice: variant.compareAtPrice ?? 0,
            quantity: variant.quantity ?? 0,
            weightGrams: variant.weightGrams ?? 0,
            status: variant.status || "active",
            optionsJson: variant.options.length > 0 ? JSON.stringify(variant.options.map(opt => ({ [opt.key]: opt.value }))) : undefined
          };
        })
        .filter(Boolean);

      const dto: UpdateProductDto = {
        name: formData.name || undefined,
        slug: formData.slug || undefined,
        sku: formData.sku || undefined,
        isActive: formData.isActive,  // ✅ Send isActive instead of status
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        thumbUrl: formData.thumbUrl || undefined,
        images: formData.images,
        basePrice: formData.basePrice,
        baseCompareAtPrice: formData.baseCompareAtPrice,
        quantity: formData.hasOptions ? undefined : (formData.quantity ?? null),
        updateVariants: updateVariants.length > 0 ? updateVariants as UpdateProductVariantDto[] : undefined,
        newVariants: newVariants.length > 0 ? newVariants as CreateProductVariantDto[] : undefined,
        deleteVariants: deletedVariantIds.length > 0 ? deletedVariantIds : undefined
      };

      // 🔍 Debug: Log update payload
      console.log('📤 Submitting product update:', {
        hasOptions: formData.hasOptions,
        updateVariantsCount: updateVariants.length,
        newVariantsCount: newVariants.length,
        deleteVariantsCount: deletedVariantIds.length,
        deleteVariantIds: deletedVariantIds,
        dto
      });

      // ✅ Use mutation hook - handles API call, toast, and cache update
      await updateProductMutation.mutateAsync(dto);
      
      // ✅ Delay 0.5s for better UX (show toast & cache already updated!)
      setTimeout(() => {
        router.push(`/business/brands/${brandId}/products`);
      }, 500);
    } catch (error) {
      // Error toast already handled in mutation hook
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
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Debug: Log current form data before rendering
  console.log('🎨 Rendering form with data:', {
    name: formData.name,
    slug: formData.slug,
    thumbUrl: formData.thumbUrl,
    basePrice: formData.basePrice,
    variantsCount: formData.variants.length
  });

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Category Section */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('category')}>
          <CardTitle className="flex items-center justify-between">
            <span>카테고리 *</span>
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
            <span>기본 정보</span>
            {openSections.basic ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {openSections.basic && (
          <CardContent className="space-y-4">
            {/* 상품명, 슬러그, SKU - 3 cột */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">상품명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="상품명을 입력하세요"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">슬러그 *</Label>
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
              <Label htmlFor="description">상품 설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="상품에 대한 상세 설명"
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
            <span>가격 정보 *</span>
            {openSections.pricing ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {openSections.pricing && (
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">기본 가격 *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="baseCompareAtPrice">비교 가격</Label>
                <Input
                  id="baseCompareAtPrice"
                  type="number"
                  value={formData.baseCompareAtPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseCompareAtPrice: Number(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Images Section */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('images')}>
          <CardTitle className="flex items-center justify-between">
            <span>이미지 *</span>
            {openSections.images ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {openSections.images && (
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <Label className="self-start mb-2">대표 이미지 *</Label>
                <div className="w-full max-w-md flex justify-center">
                  <ImageUploader
                    value={formData.thumbUrl}
                    onChange={(url) => setFormData(prev => ({ ...prev, thumbUrl: Array.isArray(url) ? url[0] : url || "" }))}
                    maxFiles={1}
                  />
                </div>
              </div>
              <div>
                <Label>상세 이미지</Label>
                <ImageUploader
                  value={formData.images}
                  onChange={(urls) => {
                    const newImages = Array.isArray(urls) ? urls : urls ? [urls] : [];
                    setFormData(prev => ({ ...prev, images: newImages }));
                  }}
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
            <span>변형 관리 *</span>
            {openSections.variants ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {openSections.variants && (
          <CardContent className="space-y-4">
            {/* Toggle options or product-level quantity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.hasOptions}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      // ✅ When disabling options, mark all existing variants for deletion
                      const existingVariantIds = variantIds.filter((id): id is string => !!id);
                      if (existingVariantIds.length > 0) {
                        setDeletedVariantIds(prev => [...prev, ...existingVariantIds]);
                        console.log('🗑️ Marking variants for deletion:', existingVariantIds);
                      }
                      setVariantIds([]);
                    }
                    
                    setFormData(prev => ({
                      ...prev,
                      hasOptions: checked,
                      // If disabling options, clear variants; if enabling, ensure at least one variant exists
                      variants: checked && prev.variants.length === 0 ? [{
                        price: prev.basePrice,
                        compareAtPrice: prev.baseCompareAtPrice,
                        quantity: 0,
                        weightGrams: 0,
                        status: "active",
                        options: []
                      }] : (checked ? prev.variants : [])
                    }));
                    
                    if (checked && variantIds.length === 0) {
                      setVariantIds([undefined]);
                    }
                  }}
                />
                <Label className="cursor-pointer">옵션 사용 (사이즈/색상 등)</Label>
              </div>
            </div>

            {/* Product-level quantity - always visible */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <Label className="text-base font-semibold text-blue-900">상품 재고 (Product Level)</Label>
              </div>
              <div>
                <Label htmlFor="quantity">상품 수량</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity ?? ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quantity: e.target.value === '' ? null : Number(e.target.value) 
                  }))}
                  placeholder="무제한 재고는 비워두세요"
                  className="mt-2"
                />
                <p className="text-sm text-blue-700 mt-2">
                  ✅ <strong>v2.1:</strong> 상품 자체의 재고 수량입니다. 비워두면 무제한 재고로 설정됩니다.
                  {formData.hasOptions 
                    ? " (변형이 있어도 상품 레벨 재고를 함께 관리할 수 있습니다)" 
                    : " (변형 없이 이 재고만 사용합니다)"}
                </p>
              </div>
            </div>

            {formData.hasOptions && (
            <div className="grid grid-cols-2 gap-4">
              {formData.variants.map((variant, index) => (
                <Card key={index} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">변형 {index + 1}</span>
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
                    {/* 1. 수량 - 1 hàng 1 cột */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>수량 *</Label>
                        <Input
                          type="number"
                          value={variant.quantity}
                          onChange={(e) => handleVariantChange(index, 'quantity', Number(e.target.value))}
                          required
                        />
                      </div>
                    </div>

                    {/* 2. 옵션 */}
                    <div>
                      <Label>옵션</Label>
                      <div className="space-y-2">
                        {variant.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2 items-center">
                            <Input
                              placeholder="옵션명 (예: 색상)"
                              value={option.key || ''}
                              onChange={(e) => {
                                const newOptions = [...variant.options];
                                newOptions[optionIndex] = { ...newOptions[optionIndex], key: e.target.value };
                                handleVariantChange(index, 'options', newOptions);
                              }}
                              className="flex-1"
                            />
                            <Input
                              placeholder="옵션값 (예: 빨강)"
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
                          옵션 추가
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
                        <Label className="text-sm font-medium cursor-pointer">추가 정보</Label>
                      </div>
                      {(variant as ProductVariantForm & { showAdditionalInfo?: boolean }).showAdditionalInfo && (
                        <div className="mt-3 grid grid-cols-3 gap-4">
                          <div>
                            <Label>가격</Label>
                            <Input
                              type="number"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>비교 가격</Label>
                            <Input
                              type="number"
                              value={variant.compareAtPrice}
                              onChange={(e) => handleVariantChange(index, 'compareAtPrice', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>무게 (g)</Label>
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
            )}

            {formData.hasOptions && (
              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                변형 추가
              </Button>
            )}
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
          취소
        </Button>
        <Button type="submit" disabled={updateProductMutation.isPending}>
          {updateProductMutation.isPending ? "수정 중..." : "상품 수정"}
        </Button>
      </div>
    </form>
  );
}
