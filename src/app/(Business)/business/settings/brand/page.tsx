"use client";

import { useState } from "react";
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
    name: "보고핏",
    description: "개인 맞춤형 피트니스 의류 전문 브랜드",
    logo: "/logo.png",
  });
  const [isLoading, setIsLoading] = useState(false);

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
      // 브랜드 정보 저장 API 호출
      console.log("Saving brand info:", brandInfo);

      // 성공 메시지 표시
      alert("브랜드 정보가 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("Error saving brand info:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 로고 업로드 핸들러
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 업로드 로직 구현
      console.log("Uploading logo:", file);

      // FormData로 파일 업로드
      const formData = new FormData();
      formData.append("file", file);

      // TODO: 실제 업로드 API 호출
      // const response = await fetch('/api/upload/image', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // setBrandInfo(prev => ({ ...prev, logoUrl: data.url }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">브랜드 설정</h1>
          <p className="text-gray-600">브랜드 이름과 로고를 관리하세요</p>
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
              브랜드 정보
            </CardTitle>
            <CardDescription>
              고객에게 표시될 브랜드 정보를 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">브랜드명 *</Label>
              <Input
                id="name"
                value={brandInfo.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="브랜드명을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">브랜드 소개</Label>
              <Textarea
                id="description"
                value={brandInfo.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="브랜드에 대한 간단한 소개를 입력하세요"
                rows={4}
              />
              <p className="text-sm text-gray-500">
                이 설명은 상품 페이지와 브랜드 소개에서 고객에게 표시됩니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 브랜드 로고 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              브랜드 로고
            </CardTitle>
            <CardDescription>
              브랜드를 대표하는 로고를 설정하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>로고 이미지</Label>
              <div className="flex flex-col items-center space-y-4">
                {brandInfo.logo ? (
                  <div className="w-32 h-32 border rounded-lg flex items-center justify-center bg-gray-50">
                    <img
                      src={brandInfo.logo}
                      alt="Brand Logo"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">로고 없음</p>
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("logo")?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    로고 업로드
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• 권장 크기: 300x300px 이상</p>
                <p>• 지원 형식: JPG, PNG, SVG</p>
                <p>• 최대 파일 크기: 2MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 미리보기 */}
      <Card>
        <CardHeader>
          <CardTitle>브랜드 미리보기</CardTitle>
          <CardDescription>
            고객에게 표시될 브랜드 정보를 미리 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-6 border rounded-lg bg-white">
            {brandInfo.logo ? (
              <img
                src={brandInfo.logo}
                alt="Brand Logo"
                className="w-16 h-16 object-contain rounded-lg border"
              />
            ) : (
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <Camera className="h-6 w-6 text-gray-400" />
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {brandInfo.name || "브랜드명"}
              </h3>
              {brandInfo.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {brandInfo.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 안내사항 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">💡 브랜드 설정 안내</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>브랜드명은 상품 페이지와 쇼핑몰 전체에서 표시됩니다.</li>
              <li>
                로고는 브랜드 식별을 위해 중요하므로 고화질 이미지를 사용하세요.
              </li>
              <li>브랜드 소개는 고객이 브랜드를 이해하는 데 도움이 됩니다.</li>
              <li>변경된 정보는 저장 후 즉시 반영됩니다.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
