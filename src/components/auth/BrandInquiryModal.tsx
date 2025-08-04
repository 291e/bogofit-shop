"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Mail, Store, MapPin, Upload, X } from "lucide-react";
import { useAddressSearch } from "@/hooks/useAddressSearch";

interface BrandInquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  // 회사 정보
  companyName: string;
  businessNumber: string;
  companyEmail: string;
  companyPhone: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  establishedYear: string;

  // 담당자 정보
  contactName: string;
  position: string;

  // 브랜드 정보
  brandName: string;
  brandCategory: string;
  brandWebsite: string;
  brandDescription: string;

  // 입점 관련
  expectedLaunchDate: string;
  productCount: string;
  averagePrice: string;
  monthlyRevenue: string;

  // 추가 정보
  hasOnlineStore: boolean;
  marketingBudget: string;
  inquiryDetails: string;
}

const initialFormData: FormData = {
  companyName: "",
  businessNumber: "",
  companyEmail: "",
  companyPhone: "",
  zipCode: "",
  address: "",
  addressDetail: "",
  establishedYear: "",
  contactName: "",
  position: "",
  brandName: "",
  brandCategory: "",
  brandWebsite: "",
  brandDescription: "",
  expectedLaunchDate: "",
  productCount: "",
  averagePrice: "",
  monthlyRevenue: "",
  hasOnlineStore: false,
  marketingBudget: "",
  inquiryDetails: "",
};

export default function BrandInquiryModal({
  open,
  onOpenChange,
}: BrandInquiryModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const { openAddressSearch } = useAddressSearch();

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 사업자번호 포맷팅 (000-00-00000)
  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
  };

  // 전화번호 포맷팅 (000-0000-0000 또는 00-0000-0000)
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    if (numbers.startsWith("02")) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 주소 검색
  const handleAddressSearch = () => {
    openAddressSearch((result) => {
      setFormData((prev) => ({
        ...prev,
        zipCode: result.zipCode,
        address: result.address,
      }));
    });
  };

  // 파일 업로드 처리
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError(
        "이미지 파일(.jpg, .png, .gif) 또는 PDF 파일만 업로드 가능하며, 파일 크기는 10MB 이하여야 합니다."
      );
      return;
    }

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  // 파일 삭제
  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const required = [
      "companyName",
      "businessNumber",
      "companyEmail",
      "companyPhone",
      "contactName",
      "brandName",
      "brandCategory",
      "inquiryDetails",
    ];

    for (const field of required) {
      if (!formData[field as keyof FormData]) {
        return `${getFieldLabel(field)}은(는) 필수 입력 항목입니다.`;
      }
    }

    // 이메일 형식 확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.companyEmail)) {
      return "올바른 회사 이메일 형식을 입력해주세요.";
    }

    // 사업자번호 형식 확인 (10자리 숫자)
    const businessNumberOnly = formData.businessNumber.replace(/[^\d]/g, "");
    if (businessNumberOnly.length !== 10) {
      return "사업자등록번호는 10자리 숫자여야 합니다.";
    }

    return null;
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      companyName: "회사명",
      businessNumber: "사업자등록번호",
      companyEmail: "회사 이메일",
      companyPhone: "회사 전화번호",
      contactName: "담당자명",
      brandName: "브랜드명",
      brandCategory: "브랜드 카테고리",
      inquiryDetails: "입점 문의 내용",
    };
    return labels[field] || field;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // FormData 생성 (파일 업로드를 위해)
      const submitData = new FormData();

      // 폼 데이터 추가
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      // 첨부파일 추가
      attachments.forEach((file, index) => {
        submitData.append(`attachment_${index}`, file);
      });

      const response = await fetch("/api/brand/inquiry", {
        method: "POST",
        body: submitData, // FormData 사용
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData(initialFormData);
      } else {
        setError(data.message || "문의 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("Brand inquiry error:", error);
      setError("문의 전송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError("");
    setFormData(initialFormData);
    setAttachments([]);
    onOpenChange(false);
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              문의가 전송되었습니다! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              브랜드 입점 문의가 성공적으로 전송되었습니다.
              <br />
              3-5일 내에 답변드리겠습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={handleClose}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            브랜드 입점 신청하기
          </DialogTitle>
          <DialogDescription>
            BogoFit에 브랜드를 입점하기 위한 정보를 입력해주세요. 담당자가 검토
            후 연락드리겠습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 회사 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <h3 className="font-semibold">회사 정보</h3>
              <Badge variant="destructive" className="text-xs">
                필수
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">회사명 *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="(주)회사명"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자등록번호 *</Label>
                <Input
                  id="businessNumber"
                  value={formData.businessNumber}
                  onChange={(e) => {
                    const formatted = formatBusinessNumber(e.target.value);
                    updateField("businessNumber", formatted);
                  }}
                  placeholder="000-00-00000"
                  maxLength={12} // 000-00-00000 형식
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">회사 이메일 *</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => updateField("companyEmail", e.target.value)}
                  placeholder="info@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyPhone">회사 전화번호 *</Label>
                <Input
                  id="companyPhone"
                  value={formData.companyPhone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    updateField("companyPhone", formatted);
                  }}
                  placeholder="02-0000-0000"
                  maxLength={13}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>회사 주소</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.zipCode}
                    placeholder="우편번호"
                    readOnly
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddressSearch}
                    className="flex items-center gap-1"
                  >
                    <MapPin className="h-4 w-4" />
                    주소 검색
                  </Button>
                </div>
                <Input
                  value={formData.address}
                  placeholder="주소를 검색해주세요"
                  readOnly
                  className="mt-2"
                />
                <Input
                  value={formData.addressDetail}
                  onChange={(e) => updateField("addressDetail", e.target.value)}
                  placeholder="상세주소 (선택)"
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="establishedYear">설립년도</Label>
                <Input
                  id="establishedYear"
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) =>
                    updateField("establishedYear", e.target.value)
                  }
                  placeholder="2020"
                />
              </div>
            </div>
          </div>

          {/* 담당자 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <h3 className="font-semibold">담당자 정보</h3>
              <Badge variant="destructive" className="text-xs">
                필수
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">담당자명 *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                  placeholder="홍길동"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">직책</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => updateField("position", e.target.value)}
                  placeholder="마케팅 팀장"
                />
              </div>
            </div>
          </div>

          {/* 브랜드 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <h3 className="font-semibold">브랜드 정보</h3>
              <Badge variant="destructive" className="text-xs">
                필수
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">브랜드명 *</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                  placeholder="브랜드명"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandCategory">브랜드 카테고리 *</Label>
                <Input
                  id="brandCategory"
                  value={formData.brandCategory}
                  onChange={(e) => updateField("brandCategory", e.target.value)}
                  placeholder="스포츠웨어, 캐주얼 등"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="brandWebsite">브랜드 웹사이트</Label>
                <Input
                  id="brandWebsite"
                  type="url"
                  value={formData.brandWebsite}
                  onChange={(e) => updateField("brandWebsite", e.target.value)}
                  placeholder="https://www.brand.com"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="brandDescription">브랜드 소개</Label>
                <Textarea
                  id="brandDescription"
                  value={formData.brandDescription}
                  onChange={(e) =>
                    updateField("brandDescription", e.target.value)
                  }
                  placeholder="브랜드의 특징, 철학, 주요 제품 등을 간단히 소개해주세요"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* 입점 문의 내용 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <h3 className="font-semibold">입점 문의 내용</h3>
              <Badge variant="destructive" className="text-xs">
                필수
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inquiryDetails">상세 문의 내용 *</Label>
              <Textarea
                id="inquiryDetails"
                value={formData.inquiryDetails}
                onChange={(e) => updateField("inquiryDetails", e.target.value)}
                placeholder="입점을 희망하는 이유, 기대 효과, 궁금한 점 등을 자세히 적어주세요"
                rows={4}
              />
            </div>
          </div>

          {/* 첨부파일 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <h3 className="font-semibold">사업자등록증</h3>
              <Badge variant="secondary" className="text-xs">
                선택
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("fileUpload")?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  사업자등록증 업로드
                </Button>
                <span className="text-xs text-gray-500">
                  사업자등록증 이미지 또는 PDF (최대 10MB)
                </span>
              </div>

              {/* 업로드된 파일 목록 */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">업로드된 파일:</p>
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)}MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "전송 중..." : "입점 문의 전송"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
