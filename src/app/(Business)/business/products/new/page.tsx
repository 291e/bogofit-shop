"use client";

// S3 기반 이미지 업로드를 사용하는 상품 등록 페이지

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import TiptapEditor from "@/components/business/TiptapEditor";
import { ArrowLeft, X, Plus, Upload } from "lucide-react";
import { ProductVariant } from "@/types/product";
import {
  productCategories,
  productBadges,
  subCategoryMap,
} from "@/contents/Business/productFormData";

interface ProductFormData {
  // Product 테이블 매핑 필드
  title: string; // Product.title
  detailDescription: string; // Product.detailDescription (간략 설명)
  description: string; // Product.description (Tiptap 에디터 - 상세 설명)
  price: number; // Product.price
  category: string; // Product.category
  subCategory: string; // Product.subCategory (세부 카테고리)
  storeName: string; // Product.storeName
  badge: string; // Product.badge (선택사항)
  isActive: boolean; // Product.isActive

  // 이미지 관련 (파일 업로드)
  mainImage: File | null; // Product.imageUrl (메인 이미지)
  thumbnailImages: File[]; // Product.thumbnailImages (썸네일들)

  // 옵션 관련 (ProductVariant 테이블로 처리)
  hasOptions: boolean;
  variants: ProductVariant[];
}

export default function ProductCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [detailImageUrl, setDetailImageUrl] = useState<string>(""); // TiptapEditor에서 업로드된 이미지 URL

  // 파일 입력 참조
  const mainImageRef = useRef<HTMLInputElement>(null);
  const thumbnailImagesRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    detailDescription: "",
    description: "",
    price: 0,
    category: "",
    subCategory: "",
    storeName: "",
    badge: "",
    isActive: true,
    mainImage: null,
    thumbnailImages: [],
    hasOptions: false,
    variants: [],
  });

  // productCategories, productBadges를 contents에서 import해서 사용

  const handleInputChange = (
    field: keyof ProductFormData,
    value: string | number | boolean | File | null | File[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 이미지 파일 처리
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange("mainImage", file);
  };

  const handleThumbnailImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    handleInputChange("thumbnailImages", [
      ...formData.thumbnailImages,
      ...files,
    ]);
  };

  const removeThumbnailImage = (index: number) => {
    const newThumbnails = formData.thumbnailImages.filter(
      (_, i) => i !== index
    );
    handleInputChange("thumbnailImages", newThumbnails);
  };

  // 옵션 관리 함수들
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now(),
      optionName: "",
      optionValue: "",
      priceDiff: 0,
      stock: 0,
    };

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const removeVariant = (variantId: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((variant) => variant.id !== variantId),
    }));
  };

  const updateVariant = (
    variantId: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  // S3 이미지 업로드 함수 (새로운 API 사용)
  const uploadImageToS3 = async (
    file: File,
    folder?: string
  ): Promise<string> => {
    try {
      // 1. Presigned URL 발급
      const presignedResponse = await fetch(
        "/api/business/upload/presigned-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            folder: folder, // 'product-main', 'product-detail', 'product-thumbnail'
          }),
        }
      );

      if (!presignedResponse.ok) {
        throw new Error("Presigned URL 발급 실패");
      }

      const { data: presignedData } = await presignedResponse.json();
      const { uploadUrl, s3Url } = presignedData;

      // 2. S3에 직접 업로드
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("S3 업로드 실패");
      }

      console.log(`S3 업로드 성공: ${s3Url}`);
      return s3Url;
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      throw error;
    }
  };

  // 상품에 이미지 URL 저장하는 함수
  const saveImageToProduct = async (
    productId: number,
    imageType: "main" | "detail" | "thumbnail",
    s3Url: string
  ): Promise<void> => {
    try {
      const response = await fetch(
        `/api/business/products/${productId}/images`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageType,
            s3Url,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`${imageType} 이미지 저장 실패`);
      }

      console.log(`${imageType} 이미지 저장 성공: ${s3Url}`);
    } catch (error) {
      console.error(`${imageType} 이미지 저장 실패:`, error);
      throw error;
    }
  };

  // 썸네일 배열 일괄 저장하는 함수
  const saveThumbnailsToProduct = async (
    productId: number,
    thumbnailUrls: string[]
  ): Promise<void> => {
    try {
      const response = await fetch(
        `/api/business/products/${productId}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thumbnailUrls,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("썸네일 이미지들 저장 실패");
      }

      console.log(`썸네일 ${thumbnailUrls.length}개 저장 성공`);
    } catch (error) {
      console.error("썸네일 저장 실패:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1단계: 이미지들을 S3에 업로드
      let mainImageUrl = "";
      let thumbnailImageUrls: string[] = [];

      console.log("이미지 업로드 시작...");

      // 메인 이미지 업로드
      if (formData.mainImage) {
        console.log("메인 이미지 업로드 중...");
        mainImageUrl = await uploadImageToS3(
          formData.mainImage,
          "product-main"
        );
      }

      // 썸네일 이미지들 업로드
      if (formData.thumbnailImages.length > 0) {
        console.log(`썸네일 ${formData.thumbnailImages.length}개 업로드 중...`);
        thumbnailImageUrls = await Promise.all(
          formData.thumbnailImages.map((file) =>
            uploadImageToS3(file, "product-thumbnail")
          )
        );
      }

      console.log("모든 이미지 업로드 완료");

      // 2단계: 상품 생성 (이미지 없이 먼저 생성)
      const productData = {
        title: formData.title,
        detailDescription: formData.detailDescription || null,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        subCategory: formData.subCategory || null,
        storeName: formData.storeName,
        badge: formData.badge || null,
        isActive: formData.isActive,
        imageUrl: "", // 일단 빈 문자열로 생성
        detailImage: detailImageUrl || null, // TiptapEditor에서 업로드된 이미지 URL
        variants: formData.hasOptions ? formData.variants : [],
      };

      console.log("상품 생성 중...");
      const productResponse = await fetch("/api/business/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!productResponse.ok) {
        throw new Error("상품 생성 실패");
      }

      const productResult = await productResponse.json();
      const productId = productResult.data.product.id;
      console.log(`상품 생성 성공: ID ${productId}`);

      // 3단계: 업로드된 이미지 URL들을 상품에 연결
      if (mainImageUrl) {
        console.log("메인 이미지 저장 중...");
        await saveImageToProduct(productId, "main", mainImageUrl);
      }

      if (thumbnailImageUrls.length > 0) {
        console.log("썸네일 이미지들 저장 중...");
        await saveThumbnailsToProduct(productId, thumbnailImageUrls);
      }

      console.log("상품 등록 완료!");
      alert("상품이 성공적으로 등록되었습니다!");
      router.push("/business/products");
    } catch (error) {
      console.error("상품 등록 오류:", error);
      alert(`상품 등록 중 오류가 발생했습니다: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">상품 등록</h1>
            <p className="text-gray-600">새로운 상품을 등록하고 관리해보세요</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>
                  상품의 기본적인 정보를 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">상품명 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="상품명을 입력하세요"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeName">업체명 *</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) =>
                      handleInputChange("storeName", e.target.value)
                    }
                    placeholder="업체명을 입력하세요"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detailDescription">간략 설명</Label>
                  <Input
                    id="detailDescription"
                    value={formData.detailDescription}
                    onChange={(e) =>
                      handleInputChange("detailDescription", e.target.value)
                    }
                    placeholder="상품의 간략한 설명을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">상세 설명</Label>
                  <TiptapEditor
                    content={formData.description}
                    onChange={(content) =>
                      handleInputChange("description", content)
                    }
                    onDetailImageUpload={(imageUrl) => {
                      console.log(
                        "TiptapEditor에서 첫 번째 이미지 업로드됨:",
                        imageUrl
                      );
                      setDetailImageUrl(imageUrl);
                    }}
                    placeholder="상품에 대한 자세한 설명을 작성해주세요..."
                  />
                  {detailImageUrl && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700">
                        상세 이미지가 업로드되었습니다:{" "}
                        {detailImageUrl.split("/").pop()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 가격 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>가격 정보</CardTitle>
                <CardDescription>
                  상품의 가격 정보를 설정해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">판매가 *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange("price", Number(e.target.value))
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* 상품 이미지 */}
            <Card>
              <CardHeader>
                <CardTitle>상품 이미지</CardTitle>
                <CardDescription>상품 이미지를 업로드해주세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 메인 이미지 */}
                <div className="space-y-2">
                  <Label>메인 이미지 *</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => mainImageRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      이미지 선택
                    </Button>
                    <input
                      ref={mainImageRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                    />
                    {formData.mainImage && (
                      <span className="text-sm text-gray-600">
                        {formData.mainImage.name}
                      </span>
                    )}
                  </div>
                  {formData.mainImage && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(formData.mainImage)}
                        alt="메인 이미지 미리보기"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                {/* 썸네일 이미지들 */}
                <div className="space-y-2">
                  <Label>썸네일 이미지들</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => thumbnailImagesRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      썸네일 추가
                    </Button>
                    <input
                      ref={thumbnailImagesRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleThumbnailImagesChange}
                      className="hidden"
                    />
                  </div>

                  {formData.thumbnailImages.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {formData.thumbnailImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`썸네일 ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeThumbnailImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 상품 옵션 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>상품 옵션 설정</CardTitle>
                <CardDescription>상품 옵션을 설정해주세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 옵션 사용 여부 */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasOptions">옵션 사용</Label>
                  <Switch
                    id="hasOptions"
                    checked={formData.hasOptions}
                    onCheckedChange={(checked) =>
                      handleInputChange("hasOptions", checked)
                    }
                  />
                </div>

                {formData.hasOptions && (
                  <div className="space-y-4">
                    {/* 옵션 추가 버튼 */}
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">옵션 품목</h4>
                      <Button type="button" onClick={addVariant} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        품목 추가
                      </Button>
                    </div>

                    {/* 옵션 목록 */}
                    {formData.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div>
                            <Label>옵션명</Label>
                            <Input
                              value={variant.optionName}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "optionName",
                                  e.target.value
                                )
                              }
                              placeholder="색상, 사이즈 등"
                            />
                          </div>

                          <div>
                            <Label>옵션값</Label>
                            <Input
                              value={variant.optionValue}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "optionValue",
                                  e.target.value
                                )
                              }
                              placeholder="빨강, XL 등"
                            />
                          </div>

                          <div>
                            <Label>추가금액</Label>
                            <Input
                              type="number"
                              value={variant.priceDiff}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "priceDiff",
                                  Number(e.target.value)
                                )
                              }
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <Label>재고</Label>
                            <Input
                              type="number"
                              value={variant.stock}
                              onChange={(e) =>
                                updateVariant(
                                  variant.id,
                                  "stock",
                                  Number(e.target.value)
                                )
                              }
                              placeholder="0"
                            />
                          </div>

                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeVariant(variant.id)}
                              className="w-full"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.variants.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        옵션 품목을 추가해주세요
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 카테고리 및 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>분류 및 설정</CardTitle>
                <CardDescription>
                  상품 카테고리와 설정을 선택해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리 *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      handleInputChange("category", value);
                      // 카테고리 변경 시 세부카테고리 초기화
                      handleInputChange("subCategory", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.category && subCategoryMap[formData.category] && (
                  <div className="space-y-2">
                    <Label htmlFor="subCategory">세부 카테고리</Label>
                    <Select
                      value={formData.subCategory}
                      onValueChange={(value) =>
                        handleInputChange("subCategory", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="세부 카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategoryMap[formData.category].map((subCat) => (
                          <SelectItem key={subCat.name} value={subCat.name}>
                            {subCat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="badge">뱃지</Label>
                  <Select
                    value={formData.badge || "none"}
                    onValueChange={(value) =>
                      handleInputChange("badge", value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="뱃지 선택 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">없음</SelectItem>
                      {productBadges.map((badge) => (
                        <SelectItem key={badge} value={badge}>
                          {badge}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">상품 활성화</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* 등록 버튼 */}
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !formData.title ||
                  !formData.category ||
                  !formData.storeName
                }
              >
                {loading ? "등록 중..." : "상품 등록"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
