"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  User,
  Mail,
  Store,
  MapPin,
  Upload,
  X,
  FileText,
  Landmark,
} from "lucide-react";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

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
  // --- 아이디, 비밀번호 필드 추가 ---
  userId: string;
  password: string;

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
  // --- 아이디, 비밀번호 초기값 추가 ---
  userId: "",
  password: "",
  hasOnlineStore: false,
  marketingBudget: "",
  inquiryDetails: "",
};

export default function BrandInquiryPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [businessRegistrationFiles, setBusinessRegistrationFiles] = useState<
    File[]
  >([]);
  const [telecomLicenseFiles, setTelecomLicenseFiles] = useState<File[]>([]);
  const [bankbookFiles, setBankbookFiles] = useState<File[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { openAddressSearch } = useAddressSearch();

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(
      5,
      10
    )}`;
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    if (numbers.startsWith("02")) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(
        6,
        10
      )}`;
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  const handleAddressSearch = () => {
    openAddressSearch((result) => {
      setFormData((prev) => ({
        ...prev,
        zipCode: result.zipCode,
        address: result.address,
      }));
    });
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
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
    }

    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeFile = (
    index: number,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // --- 유효성 검사 로직 수정 ---
  const validateForm = () => {
    const required = [
      "companyName",
      "businessNumber",
      "companyEmail",
      "companyPhone",
      "contactName",
      "brandName",
      "brandCategory",
      "userId", // 아이디 필수
      "password", // 비밀번호 필수
      "inquiryDetails",
    ];

    for (const field of required) {
      if (!formData[field as keyof FormData]) {
        return `${getFieldLabel(field)}은(는) 필수 입력 항목입니다.`;
      }
    }

    // 아이디, 비밀번호 형식 검사 (필요 시 정규식 추가)
    // 예: if (formData.userId.length < 6) return "아이디는 6자 이상이어야 합니다.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.companyEmail)) {
      return "올바른 회사 이메일 형식을 입력해주세요.";
    }

    const businessNumberOnly = formData.businessNumber.replace(/[^\d]/g, "");
    if (businessNumberOnly.length !== 10) {
      return "사업자등록번호는 10자리 숫자여야 합니다.";
    }

    // --- 첨부 파일 필수 검사 ---
    if (businessRegistrationFiles.length === 0) {
      return "사업자등록증을 첨부해주세요.";
    }
    if (telecomLicenseFiles.length === 0) {
      return "통신판매업 신고증을 첨부해주세요.";
    }
    if (bankbookFiles.length === 0) {
      return "통장 사본을 첨부해주세요.";
    }

    if (!agreedToTerms) {
      return "개인정보 수집 및 이용 약관에 동의해주세요.";
    }

    return null;
  };

  // --- 필드 라벨 추가 ---
  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      companyName: "회사명",
      businessNumber: "사업자등록번호",
      companyEmail: "회사 이메일",
      companyPhone: "회사 전화번호",
      contactName: "담당자명",
      brandName: "브랜드명",
      brandCategory: "브랜드 카테고리",
      userId: "사용할 아이디",
      password: "사용할 비밀번호",
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
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      businessRegistrationFiles.forEach((file, index) => {
        submitData.append(`businessRegistration_${index}`, file);
      });
      telecomLicenseFiles.forEach((file, index) => {
        submitData.append(`telecomLicense_${index}`, file);
      });
      bankbookFiles.forEach((file, index) => {
        submitData.append(`bankbook_${index}`, file);
      });
      submitData.append("agreedToTerms", String(agreedToTerms));

      const response = await fetch("/api/brand/inquiry", {
        method: "POST",
        body: submitData,
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

  const handleReset = () => {
    setSuccess(false);
    setError("");
    setFormData(initialFormData);
    setBusinessRegistrationFiles([]);
    setTelecomLicenseFiles([]);
    setBankbookFiles([]);
    setAgreedToTerms(false);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-2xl border border-green-200 p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-green-600" aria-hidden>
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-green-700 mb-2">문의가 전송되었습니다</h2>
          <p className="text-gray-600 mb-8">브랜드 입점 문의가 성공적으로 전송되었습니다. 3-5일 내에 답변드리겠습니다.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push("/brands")} className="sm:min-w-40">브랜드 보러가기</Button>
            <Button variant="outline" onClick={handleReset} className="sm:min-w-40">새 문의 작성</Button>
          </div>
        </div>
      </div>
    );
  }

  const FileList = ({
    files,
    onRemove,
  }: {
    files: File[];
    onRemove: (index: number) => void;
  }) => (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm truncate" title={file.name}>
              {file.name}
            </span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              ({(file.size / 1024 / 1024).toFixed(2)}MB)
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white/70 p-2 shadow-sm">
              <Store className="h-6 w-6 text-[#FF84CD]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">브랜드 입점 신청하기</h1>
              <p className="text-gray-700 mt-1 text-sm md:text-base">BogoFit에 브랜드를 입점하기 위한 정보를 입력해주세요. 담당자가 검토 후 연락드리겠습니다.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border shadow-sm p-6 md:p-8">
          {/* 회사 정보 */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
            <div className="flex items-center justify-between gap-2">
              <Building2 className="h-4 w-4" />
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">회사 정보</h3>
                <Badge variant="destructive" className="text-xs">필수</Badge>
              </div>
            </div>
            {/* ... (회사 정보 입력 필드는 변경 없음) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">회사명 <span className="text-red-500">*</span></Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="(주)회사명"
                  autoComplete="organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자등록번호 <span className="text-red-500">*</span></Label>
                <Input
                  id="businessNumber"
                  value={formData.businessNumber}
                  onChange={(e) => {
                    const formatted = formatBusinessNumber(e.target.value);
                    updateField("businessNumber", formatted);
                  }}
                  placeholder="000-00-00000"
                  maxLength={12}
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">회사 이메일 <span className="text-red-500">*</span></Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => updateField("companyEmail", e.target.value)}
                  placeholder="info@company.com"
                  autoComplete="email"
                />
                <p className="text-xs text-gray-500">계약/정산 안내를 받을 수 있는 이메일을 입력해주세요.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyPhone">회사 전화번호 <span className="text-red-500">*</span></Label>
                <Input
                  id="companyPhone"
                  value={formData.companyPhone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    updateField("companyPhone", formatted);
                  }}
                  placeholder="02-0000-0000"
                  maxLength={13}
                  autoComplete="tel"
                />
                <p className="text-xs text-gray-500">숫자만 입력해도 자동으로 형식에 맞춰져요.</p>
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
                  autoComplete="address-line2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="establishedYear">설립년도</Label>
                <Input
                  id="establishedYear"
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => updateField("establishedYear", e.target.value)}
                  placeholder="2020"
                  inputMode="numeric"
                  min={1900}
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          {/* 담당자 정보 */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
            {/* ... (담당자 정보 입력 필드는 변경 없음) ... */}
            <div className="flex items-center justify-between gap-2">
              <User className="h-4 w-4" />
              <h3 className="font-semibold">담당자 정보</h3>
              <Badge variant="destructive" className="text-xs">
                필수
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">담당자명 <span className="text-red-500">*</span></Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                  placeholder="홍길동"
                  autoComplete="name"
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
          <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
            {/* ... (브랜드 정보 입력 필드는 변경 없음) ... */}
            <div className="flex items-center justify-between gap-2">
              <Store className="h-4 w-4" />
              <h3 className="font-semibold">브랜드 정보</h3>
              <Badge variant="destructive" className="text-xs">
                필수
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">브랜드명 <span className="text-red-500">*</span></Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                  placeholder="브랜드명"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandCategory">브랜드 카테고리 <span className="text-red-500">*</span></Label>
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
                  autoComplete="url"
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

          {/* --- 입점 문의 내용 (아이디/비밀번호 추가) --- */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
            <div className="flex items-center justify-between gap-2">
              <Mail className="h-4 w-4" />
              <h3 className="font-semibold">입점 문의 내용</h3>
              <Badge variant="destructive" className="text-xs">
                필수
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId">사용할 아이디 <span className="text-red-500">*</span></Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => updateField("userId", e.target.value)}
                  placeholder="영문, 숫자 포함 6~12자"
                  autoComplete="username"
                />
                <p className="text-xs text-gray-500">6~12자, 영문과 숫자를 조합해주세요.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">사용할 비밀번호 <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="영문, 숫자, 특수문자 포함 8~16자"
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500">8~16자, 영문 대소문자/숫자/특수문자를 포함해주세요.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiryDetails">상세 문의 내용 <span className="text-red-500">*</span></Label>
              <Textarea
                id="inquiryDetails"
                value={formData.inquiryDetails}
                onChange={(e) => updateField("inquiryDetails", e.target.value)}
                placeholder="입점을 희망하는 이유, 기대 효과, 궁금한 점 등을 자세히 적어주세요"
                rows={4}
              />
            </div>
          </div>

          {/* --- 첨부파일 섹션 (필수로 변경) --- */}
          <div className="space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <h3 className="font-semibold">사업자등록증</h3>
                <Badge variant="destructive" className="text-xs">
                  필수
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  id="businessRegistrationUpload"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    handleFileUpload(e, setBusinessRegistrationFiles)
                  }
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    document
                      .getElementById("businessRegistrationUpload")
                      ?.click()
                  }
                  className="inline-flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" /> 파일 선택
                </Button>
                <span className="text-xs text-gray-500">
                  이미지 또는 PDF (최대 10MB)
                </span>
              </div>
              <FileList
                files={businessRegistrationFiles}
                onRemove={(index) =>
                  removeFile(index, setBusinessRegistrationFiles)
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <h3 className="font-semibold">통신판매업 신고증</h3>
                <Badge variant="destructive" className="text-xs">
                  필수
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  id="telecomLicenseUpload"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, setTelecomLicenseFiles)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    document.getElementById("telecomLicenseUpload")?.click()
                  }
                  className="inline-flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" /> 파일 선택
                </Button>
                <span className="text-xs text-gray-500">
                  이미지 또는 PDF (최대 10MB)
                </span>
              </div>
              <FileList
                files={telecomLicenseFiles}
                onRemove={(index) => removeFile(index, setTelecomLicenseFiles)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                <h3 className="font-semibold">통장 사본</h3>
                <Badge variant="destructive" className="text-xs">
                  필수
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  id="bankbookUpload"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, setBankbookFiles)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    document.getElementById("bankbookUpload")?.click()
                  }
                  className="inline-flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" /> 파일 선택
                </Button>
                <span className="text-xs text-gray-500">
                  이미지 또는 PDF (최대 10MB)
                </span>
              </div>
              <FileList
                files={bankbookFiles}
                onRemove={(index) => removeFile(index, setBankbookFiles)}
              />
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="items-top flex space-x-2 pt-2 rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                개인정보 수집 및 이용에 동의합니다. (필수)
              </label>
              <p className="text-sm text-muted-foreground">
                입점 문의를 위해 수집된 개인정보는 담당자 확인 및 회신
                목적으로만 사용됩니다.
              </p>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              뒤로가기
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#FF84CD] hover:bg-pink-600 text-white">
              {loading ? "전송 중..." : "입점 문의 전송"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}