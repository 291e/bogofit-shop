"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { RegisterFormData } from "@/hooks/useRegisterForm";
import { useAddressSearch } from "@/hooks/useAddressSearch";

interface RegisterFormStepProps {
  formData: RegisterFormData;
  updateField: (
    field: keyof RegisterFormData,
    value: string | Date | undefined
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  success: string;
  onTermsClick: () => void;
  hasAgreedToTerms: boolean;
}

export function RegisterFormStep({
  formData,
  updateField,
  onSubmit,
  loading,
  error,
  success,
  onTermsClick,
  hasAgreedToTerms,
}: RegisterFormStepProps) {
  const { openAddressSearch } = useAddressSearch();

  const handleAddressSearch = () => {
    openAddressSearch((result) => {
      updateField("zipCode", result.zipCode);
      updateField("address", result.address);
    });
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      <div className="space-y-4">
        {/* 필수 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">필수 정보</h3>

          <Input
            placeholder="아이디 (4자 이상) *"
            value={formData.userId}
            onChange={(e) => updateField("userId", e.target.value)}
            disabled={loading}
            required
          />

          <Input
            placeholder="이름 *"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            disabled={loading}
            required
          />

          <Input
            type="email"
            placeholder="이메일 *"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={loading}
            required
          />

          <Input
            type="password"
            placeholder="비밀번호 (6자 이상) *"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            disabled={loading}
            required
          />

          <Input
            type="password"
            placeholder="비밀번호 확인 *"
            value={formData.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* 선택 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">선택 정보</h3>

          <Input
            placeholder="휴대폰 번호 (예: 010-1234-5678)"
            value={formData.phoneNumber}
            onChange={(e) => updateField("phoneNumber", e.target.value)}
            disabled={loading}
            maxLength={13}
          />

          <Select
            value={formData.gender}
            onValueChange={(value) => updateField("gender", value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="성별 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">남성</SelectItem>
              <SelectItem value="female">여성</SelectItem>
              <SelectItem value="other">기타</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            placeholder="생년월일"
            value={
              formData.birthDate
                ? formData.birthDate.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              updateField(
                "birthDate",
                e.target.value ? new Date(e.target.value) : undefined
              )
            }
            disabled={loading}
          />

          <Input
            placeholder="자기소개 (선택사항)"
            value={formData.profile}
            onChange={(e) => updateField("profile", e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 주소 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            주소 정보 (선택)
          </h3>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="우편번호"
                value={formData.zipCode}
                onChange={(e) => updateField("zipCode", e.target.value)}
                disabled={loading}
                readOnly
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddressSearch}
              disabled={loading}
              className="whitespace-nowrap"
            >
              주소 검색
            </Button>
          </div>

          <Input
            placeholder="기본 주소"
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            disabled={loading}
            readOnly
          />

          <Input
            placeholder="상세 주소 (선택사항)"
            value={formData.addressDetail}
            onChange={(e) => updateField("addressDetail", e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 약관 동의 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">약관 동의</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {hasAgreedToTerms ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm font-medium">약관 동의 완료</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                    !
                  </div>
                  <span className="text-sm font-medium">약관 동의 필요 *</span>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onTermsClick}
              disabled={loading}
              size="sm"
            >
              {hasAgreedToTerms ? "다시 보기" : "약관 보기"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-500 text-sm text-center bg-green-50 p-3 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !hasAgreedToTerms}
        >
          {loading ? "처리 중..." : "다음 단계"}
        </Button>

        <div className="text-center text-sm">
          <span className="text-gray-500">이미 계정이 있으신가요?</span>{" "}
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            로그인
          </Link>
        </div>
      </div>
    </form>
  );
}
