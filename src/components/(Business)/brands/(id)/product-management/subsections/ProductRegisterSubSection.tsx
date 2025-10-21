"use client";

import { useState } from "react";
import { ProductForm, ProductVariantForm, VariantOption, convertProductFormToDto } from "@/types/product";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct } from "@/hooks/useProducts";
import { useAIImageGeneration } from "@/hooks/useAIImageGeneration";
import { useImageUpload } from "@/hooks/useImageUpload";
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
import Image from "next/image";

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
    quantity: null, // Product-level inventory (null = unlimited)
    variants: [], // Start with EMPTY array - variants are OPTIONAL
    hasOptions: false
  });
  
  // ✅ Use mutation hook for product creation (handles toast & cache automatically)
  const createProduct = useCreateProduct(brandId || "");
  
  // ✅ AI Image Generation hook
  const { generateImage, isGenerating: isAIGenerating } = useAIImageGeneration();
  
  // ✅ Image Upload hook (for uploading AI-generated images to S3)
  const { uploadImage } = useImageUpload();
  
  // ✅ AI Generated image preview state
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [isUploadingToS3, setIsUploadingToS3] = useState(false);
  
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
    
    // Validate inventory based on hasOptions
    if (formData.hasOptions) {
      // Has variants - validate each variant
      if (formData.variants.length === 0) {
        errors.push("변형 사용이 켜져 있습니다. 최소 1개의 변형을 추가해주세요");
      }
      
      formData.variants.forEach((variant, index) => {
        // Validate quantity
        if (variant.quantity === undefined || variant.quantity === null || variant.quantity < 0) {
          errors.push(`변형 ${index + 1}: 수량을 입력해주세요`);
        }
        
        // Options are now optional - only validate if provided
        if (variant.options && variant.options.length > 0) {
          variant.options.forEach((option, optionIndex) => {
            if (!option.key?.trim() || !option.value?.trim()) {
              errors.push(`변형 ${index + 1} 옵션 ${optionIndex + 1}: 옵션명과 옵션값을 입력해주세요`);
            }
          });
        }
      });
    } else {
      // No variants - product-level inventory validation
      if (formData.quantity !== null && formData.quantity !== undefined && formData.quantity < 0) {
        errors.push("상품 수량은 0 이상이어야 합니다");
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

  // ✅ AI Image Generation handler
  const handleAIGenerate = async () => {
    if (!formData.thumbUrl) {
      toast.error("먼저 대표 이미지를 업로드해주세요");
      return;
    }

    try {
      // Convert image URL to base64
      const response = await fetch(formData.thumbUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const result = await generateImage({
        baseImage: base64.split(',')[1], // Remove data:image/...;base64, prefix
        prompt: `Create a professional product photo for "${formData.name}" that closely follows the original image composition, angle, and framing. Maintain the same perspective and product positioning. Enhance with clean background, professional lighting, and high quality. Output as 512x512 square format.`,
        productName: formData.name
      });

      if (result.success && result.imageUrl) {
        // Show preview instead of directly adding
        setAiGeneratedImage(result.imageUrl);
        setShowAiPreview(true);
        toast.success("AI 이미지가 생성되었습니다! 미리보기를 확인하세요.");
      } else {
        toast.error(result.error || "AI 이미지 생성에 실패했습니다");
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      toast.error("AI 이미지 생성 중 오류가 발생했습니다");
    }
  };

  // ✅ Accept AI generated image - Upload to S3 first
  const handleAcceptAiImage = async () => {
    if (!aiGeneratedImage) return;
    
    try {
      setIsUploadingToS3(true);
      toast.info("AI 이미지를 S3에 업로드 중...");
      console.log('📤 Starting S3 upload for AI image...');
      
      // Convert data URL to Blob
      const response = await fetch(aiGeneratedImage);
      const blob = await response.blob();
      console.log('📦 Blob created:', blob.size, 'bytes');
      
      // Create File object
      const file = new File([blob], `ai-generated-${Date.now()}.png`, { type: 'image/png' });
      console.log('📄 File created:', file.name, file.size, 'bytes');
      
      // Upload to S3 using existing hook
      const s3Url = await uploadImage(file, 'products');
      console.log('📥 Upload result:', s3Url);
      
      if (s3Url) {
        console.log('✅ AI image uploaded to S3:', s3Url);
        
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), s3Url]
        }));
        toast.success("AI 이미지가 S3에 업로드되고 추가되었습니다!");
        setShowAiPreview(false);
        setAiGeneratedImage(null);
      } else {
        console.error('❌ Upload failed: No URL returned');
        toast.error("S3 업로드 실패");
      }
    } catch (error) {
      console.error('❌ S3 upload error:', error);
      toast.error("AI 이미지 업로드 중 오류가 발생했습니다");
    } finally {
      setIsUploadingToS3(false);
    }
  };

  // ✅ Reject AI generated image
  const handleRejectAiImage = () => {
    setShowAiPreview(false);
    setAiGeneratedImage(null);
    toast.info("AI 이미지가 거부되었습니다.");
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
                <p className="text-sm text-gray-600 mb-2">
                  AI 생성 이미지도 여기에 추가됩니다. 각 이미지를 클릭하여 삭제할 수 있습니다.
                </p>
                <ImageUploader
                  value={formData.images}
                  onChange={(urls) => setFormData(prev => ({ ...prev, images: Array.isArray(urls) ? urls : urls ? [urls] : [] }))}
                  single={false}
                  maxFiles={10}
                />
                
                {/* ✅ AI Image Generation */}
                {formData.thumbUrl && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900">AI 이미지 생성</span>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">
                      대표 이미지를 기반으로 AI가 전문적인 상품 사진을 생성합니다 (512x512, 원본 구성 유지)
                    </p>
                    <Button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={isAIGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {isAIGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          AI 생성 중...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          AI 이미지 생성
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Inventory Section - v2.0: Product + Variants */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('variants')}>
          <CardTitle className="flex items-center justify-between">
            <span>재고 관리 *</span>
            {openSections.variants ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {openSections.variants && (
          <CardContent className="space-y-6">
            {/* 1. Product-level Inventory */}
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
                <p className="text-sm text-gray-600 mt-2">
                  상품 자체의 재고 수량입니다. 비워두면 무제한 재고로 설정됩니다.
                </p>
              </div>
            </div>

            {/* 2. Variants Toggle & Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base font-medium">변형 사용</Label>
                  <p className="text-sm text-gray-600">
                    {formData.hasOptions 
                      ? "변형별로 재고를 관리합니다 (색상, 사이즈 등)"
                      : "변형 없이 상품 재고만 사용합니다"
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
                  <Label className="text-base font-semibold text-green-900">변형 재고 (Variant Level)</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {formData.variants.map((variant, index) => (
                    <Card key={index} className="border-2 border-green-200">
                      <CardHeader className="pb-3 bg-green-50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-900">변형 {index + 1}</span>
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
                            <Label>수량 *</Label>
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
                          <Label>옵션 (선택사항)</Label>
                          <p className="text-sm text-gray-500 mb-2">
                            변형의 특성을 나타내는 옵션입니다. 예: 색상, 사이즈 등
                          </p>
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
              </div>
            )}
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
          취소
        </Button>
        <Button type="submit" disabled={createProduct.isPending}>
          {createProduct.isPending ? "등록 중..." : "상품 등록"}
        </Button>
      </div>
        </form>
      </div>

      {/* ✅ AI Generated Image Preview Modal */}
      {showAiPreview && aiGeneratedImage && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI 생성 이미지 미리보기 (512x512)
              </h3>
              <button
                onClick={handleRejectAiImage}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 flex justify-center">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96">
                <Image
                  src={aiGeneratedImage}
                  alt="AI Generated Product Image"
                  fill
                  className="object-contain rounded-lg border-2 border-gray-200"
                  sizes="(max-width: 640px) 320px, 384px"
                />
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-2">
                💡 <strong>팁:</strong> 이미지를 추가하면 S3 클라우드 스토리지에 자동으로 업로드됩니다.
              </p>
              <p className="text-sm text-blue-600">
                업로드 후 &quot;상세 이미지&quot; 섹션에서 언제든지 삭제할 수 있습니다.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleRejectAiImage}
                disabled={isUploadingToS3}
                className="px-6"
              >
                거부
              </Button>
              <Button
                type="button"
                onClick={handleAcceptAiImage}
                disabled={isUploadingToS3}
                className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isUploadingToS3 ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    S3 업로드 중...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    이미지 추가
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
