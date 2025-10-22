"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, Upload, Camera } from "lucide-react";
import Image from "next/image";

interface BrandInfo {
  id?: number;
  name: string; // Brand.name
  description?: string; // Brand.description
  logo?: string; // Brand.logo
  businessNumber?: string; // Brand.businessNumber
  bankAccount?: string; // Brand.bankAccount
  bankCode?: string; // Brand.bankCode
  accountHolder?: string; // Brand.accountHolder
}

export default function BrandSettingsPage() {
  const [brandInfo, setBrandInfo] = useState<BrandInfo>({
    name: "",
    description: "",
    logo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 브랜드 정보 불러오기
  useEffect(() => {
    const fetchBrandInfo = async () => {
      try {
        setIsLoadingData(true);

        const response = await fetch("/api/business/brand", {
          credentials: "include", // JWT 쿠키 포함
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "브랜드 정보를 불러올 수 없습니다"
          );
        }

        const data = await response.json();
        if (data.success && data.data.brand) {
          setBrandInfo({
            id: data.data.brand.id,
            name: data.data.brand.name || "",
            description: data.data.brand.description || "",
            logo: data.data.brand.logo || "",
            businessNumber: data.data.brand.businessNumber || "",
            bankAccount: data.data.brand.bankAccount || "",
            bankCode: data.data.brand.bankCode || "",
            accountHolder: data.data.brand.accountHolder || "",
          });
        }
      } catch (error) {
        console.error("브랜드 정보 불러오기 실패:", error);
        alert(
          error instanceof Error
            ? error.message
            : "브랜드 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchBrandInfo();
  }, []);

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof BrandInfo, value: string) => {
    setBrandInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 저장 핸들러
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/business/brand", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // JWT 쿠키 포함
        body: JSON.stringify(brandInfo),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "저장에 실패했습니다");
      }

      if (data.success) {
        // 응답 데이터로 상태 업데이트
        setBrandInfo({
          id: data.data.brand.id,
          name: data.data.brand.name,
          description: data.data.brand.description || "",
          logo: data.data.brand.logo || "",
          businessNumber: data.data.brand.businessNumber || "",
          bankAccount: data.data.brand.bankAccount || "",
          bankCode: data.data.brand.bankCode || "",
          accountHolder: data.data.brand.accountHolder || "",
        });

        alert("브랜드 정보가 성공적으로 저장되었습니다.");
      }
    } catch (error) {
      console.error("Error saving brand info:", error);
      alert(
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 로고 업로드 핸들러
  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // 1. Presigned URL 요청
        const presignedResponse = await fetch(
          "/api/business/upload/presigned-url",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              folder: "brand-logo",
            }),
          }
        );

        const presignedData = await presignedResponse.json();
        if (!presignedResponse.ok || !presignedData.success) {
          console.error("Presigned URL 생성 실패:", presignedData);
          throw new Error(presignedData.error || "업로드 URL 생성 실패");
        }

        // 2. S3에 직접 업로드
        const uploadResponse = await fetch(presignedData.data.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("S3 업로드 실패:", errorText);
          throw new Error(`파일 업로드 실패: ${uploadResponse.status}`);
        }

        // 3. 로고 URL 상태 업데이트
        const logoUrl = presignedData.data.s3Url;
        setBrandInfo((prev) => ({ ...prev, logo: logoUrl }));

        console.log("로고 업로드 성공:", logoUrl);
      } catch (error) {
        console.error("로고 업로드 실패:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "로고 업로드 중 오류가 발생했습니다.";
        alert(errorMessage);
      }
    }
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">업체 정보</h1>
            <p className="text-gray-600">업체 정보를 불러오는 중...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>로딩 중...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">업체 정보</h1>
          <p className="text-gray-600">업체 이름과 로고를 관리하세요</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 브랜드 기본 정보 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              업체 정보
            </CardTitle>
            <CardDescription>
              고객에게 표시될 업체 정보를 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">업체명 *</Label>
              <Input
                id="name"
                value={brandInfo.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="업체명을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">업체 소개</Label>
              <Textarea
                id="description"
                value={brandInfo.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="업체에 대한 간단한 소개를 입력하세요"
                rows={4}
              />
              <p className="text-sm text-gray-500">
                이 설명은 상품 페이지와 업체 소개에서 고객에게 표시됩니다.
              </p>
            </div>

            {/* 사업자 정보 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">사업자 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessNumber">사업자번호</Label>
                  <Input
                    id="businessNumber"
                    value={brandInfo.businessNumber || ""}
                    onChange={(e) =>
                      handleInputChange("businessNumber", e.target.value)
                    }
                    placeholder="123-45-67890"
                  />
                </div>
              </div>
            </div>

            {/* 정산 정보 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">정산 계좌 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankCode">은행</Label>
                  <Input
                    id="bankCode"
                    value={brandInfo.bankCode || ""}
                    onChange={(e) =>
                      handleInputChange("bankCode", e.target.value)
                    }
                    placeholder="은행 코드 (예: 004)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">계좌번호</Label>
                  <Input
                    id="bankAccount"
                    value={brandInfo.bankAccount || ""}
                    onChange={(e) =>
                      handleInputChange("bankAccount", e.target.value)
                    }
                    placeholder="1234-5678-90123"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accountHolder">예금주</Label>
                  <Input
                    id="accountHolder"
                    value={brandInfo.accountHolder || ""}
                    onChange={(e) =>
                      handleInputChange("accountHolder", e.target.value)
                    }
                    placeholder="예금주명"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 브랜드 로고 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              업체 로고
            </CardTitle>
            <CardDescription>
              고객에게 표시될 업체 로고를 업로드하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 현재 로고 미리보기 */}
            {brandInfo.logo && (
              <div className="aspect-square bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4">
                <Image
                  src={brandInfo.logo}
                  alt="업체 로고"
                  className="w-full h-full object-contain"
                  width={300}
                  height={300}
                />
              </div>
            )}

            {/* 로고 업로드 버튼 */}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <Label
                htmlFor="logo-upload"
                className="flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="h-4 w-4" />
                로고 업로드
              </Label>
            </div>

            <p className="text-xs text-gray-500">
              권장 크기: 300x300px, PNG/JPG 형식, 최대 2MB
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
