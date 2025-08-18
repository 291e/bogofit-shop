"use client";

// S3 기반 이미지 업로드를 사용하는 상품 등록 페이지

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

interface OptionGroup {
  id: number;
  name: string; // 옵션명 (예: "사이즈", "색상")
  values: string[]; // 옵션값들 (예: ["S", "M", "L"])
  priceDiffs: { [value: string]: number }; // 각 값별 추가금액
  stocks: { [value: string]: number }; // 각 값별 재고
}

interface ProductFormData {
  // Product 테이블 매핑 필드
  title: string; // Product.title
  description: string; // Product.description (Tiptap 에디터 - 상세 설명)
  originalPrice: number; // Product.originalPrice (원가)
  discountAmount: number; // Product.discountAmount (할인 금액)
  discountRate: number; // Product.discountRate (할인율)
  price: number; // Product.price (최종 판매가)
  category: string; // Product.category
  subCategory: string; // Product.subCategory (세부 카테고리)
  gender: string; // Product.gender (성별)
  badges: string[]; // Product.badge (다중 선택)
  isActive: boolean; // Product.isActive
  shippingType: string; // Product.shippingType

  // 이미지 관련 (파일 업로드)
  mainImage: File | null; // Product.imageUrl (메인 이미지)
  thumbnailImages: File[]; // Product.thumbnailImages (썸네일들)

  // 옵션 관련 (그룹별 관리) - 필수
  optionGroups: OptionGroup[];
  variants: ProductVariant[]; // 실제 저장될 때는 여전히 기존 구조 사용
}

export default function ProductCreatePage() {
  const router = useRouter();

  // 인증 상태 체크
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        console.error("인증 실패, 로그인 페이지로 이동");
        router.push("/login");
        return false;
      }

      return true;
    } catch (error) {
      console.error("인증 상태 확인 실패:", error);
      router.push("/login");
      return false;
    }
  }, [router]);

  const [loading, setLoading] = useState(false);
  const [detailImageUrl, setDetailImageUrl] = useState<string>(""); // TiptapEditor에서 업로드된 이미지 URL
  const [isEditorUploading, setIsEditorUploading] = useState(false); // TiptapEditor 이미지 업로드 상태

  // 파일 입력 참조
  const mainImageRef = useRef<HTMLInputElement>(null);
  const thumbnailImagesRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    originalPrice: 0,
    discountAmount: 0,
    discountRate: 0,
    price: 0,
    category: "",
    subCategory: "",
    gender: "UNISEX", // 기본값: 공용
    badges: [],
    isActive: true,
    shippingType: "OVERSEAS", // 기본값
    mainImage: null,
    thumbnailImages: [],
    optionGroups: [],
    variants: [],
  });

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // productCategories, productBadges를 contents에서 import해서 사용

  const handleInputChange = (
    field: keyof ProductFormData,
    value: string | number | boolean | File | null | File[] | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 할인 계산 로직 - 원가와 최종가를 직접 입력받고 할인금액/할인율 자동 계산
  const handleOriginalPriceChange = (newOriginalPrice: number) => {
    const price = formData.price;
    const discountAmount = Math.max(0, newOriginalPrice - price);
    const discountRate =
      newOriginalPrice > 0
        ? Math.round((discountAmount / newOriginalPrice) * 100)
        : 0;

    setFormData((prev) => ({
      ...prev,
      originalPrice: newOriginalPrice,
      discountAmount,
      discountRate,
    }));
  };

  const handlePriceChange = (newPrice: number) => {
    const originalPrice = formData.originalPrice;
    const discountAmount = Math.max(0, originalPrice - newPrice);
    const discountRate =
      originalPrice > 0
        ? Math.round((discountAmount / originalPrice) * 100)
        : 0;

    setFormData((prev) => ({
      ...prev,
      price: newPrice,
      discountAmount,
      discountRate,
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

  // 뱃지 관리 함수들
  const toggleBadge = (badge: string) => {
    const currentBadges = formData.badges;
    const isSelected = currentBadges.includes(badge);

    if (isSelected) {
      // 선택 해제
      handleInputChange(
        "badges",
        currentBadges.filter((b) => b !== badge)
      );
    } else {
      // 선택 추가
      handleInputChange("badges", [...currentBadges, badge]);
    }
  };

  // 옵션 그룹 관리 함수들
  const addOptionGroup = () => {
    const newGroup: OptionGroup = {
      id: Date.now(),
      name: "",
      values: [],
      priceDiffs: {},
      stocks: {},
    };

    setFormData((prev) => ({
      ...prev,
      optionGroups: [...prev.optionGroups, newGroup],
    }));
  };

  // 옵션 저장/불러오기 기능
  const saveOptionsToLocalStorage = () => {
    if (formData.optionGroups.length === 0) {
      alert("저장할 옵션이 없습니다.");
      return;
    }

    const optionsData = {
      optionGroups: formData.optionGroups,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("savedProductOptions", JSON.stringify(optionsData));
    alert("옵션이 저장되었습니다!");
  };

  const loadOptionsFromLocalStorage = () => {
    const savedOptions = localStorage.getItem("savedProductOptions");
    if (!savedOptions) {
      alert("저장된 옵션이 없습니다.");
      return;
    }

    try {
      const optionsData = JSON.parse(savedOptions);
      const confirm = window.confirm(
        `저장된 옵션을 불러오시겠습니까?\n저장일시: ${new Date(
          optionsData.savedAt
        ).toLocaleString()}`
      );

      if (confirm) {
        setFormData((prev) => ({
          ...prev,
          optionGroups: optionsData.optionGroups,
        }));
        alert("옵션이 불러와졌습니다!");
      }
    } catch (error) {
      alert("옵션 불러오기에 실패했습니다.");
      console.error("옵션 불러오기 오류:", error);
    }
  };

  const removeOptionGroup = (groupId: number) => {
    setFormData((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.filter((group) => group.id !== groupId),
    }));
  };

  const updateOptionGroupName = (groupId: number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.map((group) =>
        group.id === groupId ? { ...group, name } : group
      ),
    }));
  };

  const addOptionValue = (groupId: number, value: string) => {
    if (!value.trim()) return;

    setFormData((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: [...group.values, value.trim()],
              priceDiffs: { ...group.priceDiffs, [value.trim()]: 0 },
              stocks: { ...group.stocks, [value.trim()]: 0 },
            }
          : group
      ),
    }));
  };

  const removeOptionValue = (groupId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: group.values.filter((v) => v !== value),
              priceDiffs: Object.fromEntries(
                Object.entries(group.priceDiffs).filter(([k]) => k !== value)
              ),
              stocks: Object.fromEntries(
                Object.entries(group.stocks).filter(([k]) => k !== value)
              ),
            }
          : group
      ),
    }));
  };

  const updateOptionValuePriceDiff = (
    groupId: number,
    value: string,
    priceDiff: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              priceDiffs: { ...group.priceDiffs, [value]: priceDiff },
            }
          : group
      ),
    }));
  };

  const updateOptionValueStock = (
    groupId: number,
    value: string,
    stock: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              stocks: { ...group.stocks, [value]: stock },
            }
          : group
      ),
    }));
  };

  // 옵션 그룹을 ProductVariant 배열로 변환하는 함수
  const convertGroupsToVariants = (): ProductVariant[] => {
    const variants: ProductVariant[] = [];
    let variantId = 1;

    formData.optionGroups.forEach((group) => {
      group.values.forEach((value) => {
        variants.push({
          id: variantId++,
          optionName: group.name,
          optionValue: value,
          priceDiff: group.priceDiffs[value] || 0,
          stock: group.stocks[value] || 0,
        });
      });
    });

    return variants;
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

    // 에디터에서 이미지 업로드 중인지 확인
    if (isEditorUploading) {
      alert("이미지 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // 인증 상태 재확인
    const isAuthenticated = await checkAuthStatus();
    if (!isAuthenticated) {
      return;
    }

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
        description: formData.description,
        price: formData.price, // 최종 판매가
        originalPrice: formData.originalPrice || null, // 원가
        discountRate: formData.discountRate || null, // 할인율
        discountAmount: formData.discountAmount || null, // 할인 금액
        category: formData.category,
        subCategory: formData.subCategory || null,
        gender: formData.gender,
        badge: formData.badges.length > 0 ? formData.badges.join(", ") : null, // 배열을 문자열로 변환
        isActive: formData.isActive,
        shippingType: formData.shippingType,
        imageUrl: "", // 일단 빈 문자열로 생성
        detailImage: detailImageUrl || null, // TiptapEditor에서 업로드된 이미지 URL
        variants: convertGroupsToVariants(),
      };

      console.log("상품 생성 중...", productData);
      const productResponse = await fetch("/api/business/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      if (!productResponse.ok) {
        const errorData = await productResponse.json();
        console.error("상품 생성 실패 응답:", errorData);
        throw new Error(
          `상품 생성 실패: ${errorData.error || productResponse.statusText}`
        );
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
                    placeholder="예: 아디다스 울트라부스트 22 러닝화"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">상세 설명</Label>
                  <div className="max-h-[700px] overflow-y-auto border rounded-md p-1">
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
                      onUploadStateChange={(uploading) => {
                        setIsEditorUploading(uploading);
                      }}
                      placeholder="📝 상품의 매력을 고객에게 전달해보세요!

🔥 제품 특징:
• 예: 최신 Boost 미드솔 기술이 적용된 프리미엄 러닝화
• 뛰어난 쿠셔닝과 에너지 리턴으로 장거리 러닝 최적화
• 통기성 뛰어난 Primeknit 어퍼 소재 사용

📏 상세 정보:
• 사이즈: 230mm~290mm (5mm 단위)
• 소재: Primeknit 어퍼, Boost 미드솔, Continental 러버 아웃솔
• 중량: 약 320g (275mm 기준)

🖼️ 툴바의 이미지 버튼을 눌러 제품 착용샷, 디테일 사진 등을 추가해주세요!"
                    />
                  </div>
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
                  상품의 가격 및 할인 정보를 설정해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">원가</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        // 빈 문자열이거나 유효한 숫자인 경우에만 처리
                        if (
                          value === "" ||
                          (!isNaN(Number(value)) && Number(value) >= 0)
                        ) {
                          handleOriginalPriceChange(
                            value === "" ? 0 : Number(value)
                          );
                        }
                      }}
                      onFocus={(e) => {
                        // 포커스 시 값이 0이면 빈 문자열로 변경
                        if (e.target.value === "0") {
                          e.target.value = "";
                        }
                      }}
                      onBlur={(e) => {
                        // 포커스 해제 시 빈 문자열이면 0으로 설정
                        if (e.target.value === "") {
                          handleOriginalPriceChange(0);
                        }
                      }}
                      placeholder="예: 189000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">최종 판매가 *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        // 빈 문자열이거나 유효한 숫자인 경우에만 처리
                        if (
                          value === "" ||
                          (!isNaN(Number(value)) && Number(value) >= 0)
                        ) {
                          handlePriceChange(value === "" ? 0 : Number(value));
                        }
                      }}
                      onFocus={(e) => {
                        // 포커스 시 값이 0이면 빈 문자열로 변경
                        if (e.target.value === "0") {
                          e.target.value = "";
                        }
                      }}
                      onBlur={(e) => {
                        // 포커스 해제 시 빈 문자열이면 0으로 설정
                        if (e.target.value === "") {
                          handlePriceChange(0);
                        }
                      }}
                      placeholder="예: 159000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountAmount">할인 금액</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      value={formData.discountAmount}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500">
                      자동 계산됨 (원가 - 최종 판매가)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountRate">할인율 (%)</Label>
                    <Input
                      id="discountRate"
                      type="number"
                      value={formData.discountRate}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500">자동 계산됨</p>
                  </div>
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
                      메인 이미지 선택
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
                      <Image
                        src={URL.createObjectURL(formData.mainImage)}
                        alt="메인 이미지 미리보기"
                        width={128}
                        height={128}
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
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`썸네일 ${index + 1}`}
                            width={96}
                            height={96}
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
                  <Label htmlFor="gender">성별 *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="성별 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">남성</SelectItem>
                      <SelectItem value="FEMALE">여성</SelectItem>
                      <SelectItem value="UNISEX">공용</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>뱃지 (다중 선택)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {productBadges.map((badge) => (
                      <div
                        key={badge}
                        className={`
                          border rounded-lg p-2 cursor-pointer text-center text-sm transition-colors
                          ${
                            formData.badges.includes(badge)
                              ? "bg-blue-100 border-blue-500 text-blue-700"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }
                        `}
                        onClick={() => toggleBadge(badge)}
                      >
                        {badge}
                      </div>
                    ))}
                  </div>
                  {formData.badges.length > 0 && (
                    <p className="text-sm text-gray-500">
                      선택됨: {formData.badges.join(", ")}
                    </p>
                  )}
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

            {/* 상품 옵션 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>상품 옵션 *</CardTitle>
                <CardDescription>
                  상품 옵션을 설정해주세요 (필수)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 옵션 저장/불러오기 버튼 */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={saveOptionsToLocalStorage}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    옵션 저장
                  </Button>
                  <Button
                    type="button"
                    onClick={loadOptionsFromLocalStorage}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    옵션 불러오기
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* 옵션 그룹 목록 */}
                  {formData.optionGroups.map((group) => (
                    <div
                      key={group.id}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 mr-4">
                          <Label className="text-sm font-medium">옵션명</Label>
                          <Input
                            value={group.name}
                            onChange={(e) =>
                              updateOptionGroupName(group.id, e.target.value)
                            }
                            placeholder="예: 색상-사이즈, 사이즈-색상, 사이즈-사이즈"
                            className="mt-1"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeOptionGroup(group.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* 옵션값 추가 */}
                      <div>
                        <Label className="text-sm font-medium">옵션값</Label>
                        <div className="mt-2 space-y-2">
                          {group.values.map((value, valueIndex) => (
                            <div
                              key={valueIndex}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                            >
                              <span className="flex-1 font-medium">
                                {value}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500">
                                    추가금액
                                  </span>
                                  <Input
                                    type="number"
                                    value={group.priceDiffs[value] || ""}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      if (
                                        inputValue === "" ||
                                        (!isNaN(Number(inputValue)) &&
                                          Number(inputValue) >= 0)
                                      ) {
                                        updateOptionValuePriceDiff(
                                          group.id,
                                          value,
                                          inputValue === ""
                                            ? 0
                                            : Number(inputValue)
                                        );
                                      }
                                    }}
                                    onFocus={(e) => {
                                      if (e.target.value === "0") {
                                        e.target.value = "";
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === "") {
                                        updateOptionValuePriceDiff(
                                          group.id,
                                          value,
                                          0
                                        );
                                      }
                                    }}
                                    className="w-20 h-7 text-xs"
                                    placeholder="0"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500">
                                    재고
                                  </span>
                                  <Input
                                    type="number"
                                    value={group.stocks[value] || ""}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      if (
                                        inputValue === "" ||
                                        (!isNaN(Number(inputValue)) &&
                                          Number(inputValue) >= 0)
                                      ) {
                                        updateOptionValueStock(
                                          group.id,
                                          value,
                                          inputValue === ""
                                            ? 0
                                            : Number(inputValue)
                                        );
                                      }
                                    }}
                                    onFocus={(e) => {
                                      if (e.target.value === "0") {
                                        e.target.value = "";
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === "") {
                                        updateOptionValueStock(
                                          group.id,
                                          value,
                                          0
                                        );
                                      }
                                    }}
                                    className="w-16 h-7 text-xs"
                                    placeholder="0"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeOptionValue(group.id, value)
                                  }
                                  className="h-7 w-7 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              placeholder="옵션값 입력 (예: 화이트-S, 블랙-M, 레드-L)"
                              className="flex-1"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  const input = e.target as HTMLInputElement;
                                  addOptionValue(group.id, input.value);
                                  input.value = "";
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                const input = (
                                  e.target as HTMLButtonElement
                                ).parentElement?.querySelector("input");
                                if (input?.value) {
                                  addOptionValue(group.id, input.value);
                                  input.value = "";
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.optionGroups.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      옵션 그룹을 추가해주세요 (최소 1개 필수)
                    </div>
                  )}

                  {/* 옵션 그룹 추가 버튼 - 맨 아래에 위치 */}
                  <Button
                    type="button"
                    onClick={addOptionGroup}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    옵션 그룹 추가
                  </Button>
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
                  isEditorUploading ||
                  !formData.title ||
                  !formData.category ||
                  !formData.gender ||
                  formData.price <= 0 ||
                  formData.optionGroups.length === 0 ||
                  formData.optionGroups.some(
                    (group) => !group.name || group.values.length === 0
                  )
                }
              >
                {loading
                  ? "등록 중..."
                  : isEditorUploading
                    ? "이미지 업로드 중..."
                    : "상품 등록"}
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
