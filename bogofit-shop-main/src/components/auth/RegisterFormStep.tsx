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
import { useI18n } from "@/providers/I18nProvider";

interface RegisterFormStepProps {
  formData: RegisterFormData;
  updateField: (
    field: keyof RegisterFormData,
    value: string | Date | undefined
  ) => void;
  onSubmit: () => void;
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
  const { t } = useI18n();

  const handleAddressSearch = () => {
    openAddressSearch((result) => {
      updateField("zipCode", result.zipCode);
      updateField("address", result.address);
    });
  };

  return (
    <form
      className="mt-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-4">
        {/* 필수 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t("auth.register.form.requiredInfo")}</h3>

          <Input
            placeholder={t("auth.register.placeholders.userId")}
            value={formData.userId}
            onChange={(e) => updateField("userId", e.target.value)}
            disabled={loading}
            required
          />

          <Input
            placeholder={t("auth.register.placeholders.name")}
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            disabled={loading}
            required
          />

          <Input
            type="email"
            placeholder={t("auth.register.placeholders.email")}
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={loading}
            required
          />

          <Input
            type="password"
            placeholder={t("auth.register.placeholders.password")}
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            disabled={loading}
            required
          />

          <Input
            type="password"
            placeholder={t("auth.register.placeholders.confirmPassword")}
            value={formData.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* 선택 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t("auth.register.form.optionalInfo")}</h3>

          <Input
            placeholder={t("auth.register.placeholders.phone")}
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
              <SelectValue placeholder={t("auth.register.placeholders.gender") as string} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("auth.register.gender.male")}</SelectItem>
              <SelectItem value="female">{t("auth.register.gender.female")}</SelectItem>
              <SelectItem value="other">{t("auth.register.gender.other")}</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            placeholder={t("auth.register.placeholders.birthDate")}
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
            placeholder={t("auth.register.placeholders.profile")}
            value={formData.profile}
            onChange={(e) => updateField("profile", e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 주소 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t("auth.register.form.addressInfo")}</h3>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={t("auth.register.placeholders.zipCode")}
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
              {t("auth.register.cta.searchAddress")}
            </Button>
          </div>

          <Input
            placeholder={t("auth.register.placeholders.address")}
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            disabled={loading}
            readOnly
          />

          <Input
            placeholder={t("auth.register.placeholders.addressDetail")}
            value={formData.addressDetail}
            onChange={(e) => updateField("addressDetail", e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 약관 동의 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t("auth.register.form.terms")}</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {hasAgreedToTerms ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm font-medium">{t("auth.register.terms.status.complete")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                    !
                  </div>
                  <span className="text-sm font-medium">{t("auth.register.terms.status.requiredStar")}</span>
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
              {hasAgreedToTerms ? t("auth.register.cta.viewAgain") : t("auth.register.cta.viewTerms")}
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
          {loading ? t("auth.register.cta.processing") : t("auth.register.cta.next")}
        </Button>

        <div className="text-center text-sm">
          <span className="text-gray-500">{t("auth.register.haveAccount")}</span>{" "}
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            {t("auth.cta.login")}
          </Link>
        </div>
      </div>
    </form>
  );
}
