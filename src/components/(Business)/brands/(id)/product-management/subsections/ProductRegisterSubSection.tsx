"use client";

import { useState } from "react";
import { ProductForm, ProductVariantForm, VariantOption, convertProductFormToDto } from "@/types/product";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CategoryDropdown from "@/components/ui/category-dropdown";
import { ImageUploader } from "@/components/ui/imageUploader";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductRegisterFormProps {
  brandId?: string;
  className?: string;
}

export default function ProductRegisterSubSection({ 
  brandId,
  className 
}: ProductRegisterFormProps) {
  // ✅ All hooks must be called before any early returns
  const router = useRouter();
  
  // ✅ Use React Query for categories with caching
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const categories = categoriesData?.data || [];
  
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
    variants: [{
      price: 0,
      compareAtPrice: 0,
      quantity: 0,
      weightGrams: 0,
      status: "active",
      options: []
    }],
    hasOptions: false
    
  });
  
  // ✅ Use mutation hook for product creation (handles toast & cache automatically)
  const createProduct = useCreateProduct(brandId || "");
  
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
    if (!formData.name.trim()) errors.push("상품명을 입력해주세요");
    if (!formData.slug.trim()) errors.push("슬러그를 입력해주세요");
    if (!formData.sku?.trim()) errors.push("SKU를 입력해주세요");
    if (!formData.categoryId) errors.push("카테고리를 선택해주세요");
    if (formData.basePrice <= 0) errors.push("기본 가격을 입력해주세요");
    if (!formData.thumbUrl) errors.push("대표 이미지를 업로드해주세요");
    
    // Validate variants - no longer need to check for default variant
    
    formData.variants.forEach((variant, index) => {
      // Validate quantity
      if (variant.quantity === undefined || variant.quantity === null || variant.quantity < 0) {
        errors.push(`변형 ${index + 1}: 수량을 입력해주세요`);
      }
      
      // Validate options
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
    
    if (errors.length > 0) {
      // Show validation errors
      toast.error(errors.join(", "));
      return;
    }

    try {
      // ✅ Use mutation hook - handles API call, toast, and cache update
      const dto = convertProductFormToDto(formData);
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

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">상품 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-6">


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
                  onChange={(urls) => setFormData(prev => ({ ...prev, images: Array.isArray(urls) ? urls : urls ? [urls] : [] }))}
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
                  {/* 1. 수량 và 기본 변형 - 1 hàng 2 cột */}
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

            <Button
              type="button"
              variant="outline"
              onClick={addVariant}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              변형 추가
            </Button>
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
        <Button type="submit" disabled={createProduct.isPending}>
          {createProduct.isPending ? "등록 중..." : "상품 등록"}
        </Button>
      </div>
        </form>
      </div>
    </div>
  );
}
