"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Smartphone,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  useSmsVerification,
  SUPPORTED_COUNTRIES,
} from "@/hooks/useSmsVerification";
import { useI18n } from "@/providers/I18nProvider";

// 컴포넌트 Props 인터페이스
interface SmsVerificationProps {
  phoneNumber?: string;
  purpose?: string;
  onVerified?: (phoneNumber: string) => void;
  onError?: (error: string) => void;
  className?: string;
  autoFocus?: boolean;
  showPhoneInput?: boolean;
  defaultCountry?: string;
}

// 인증 단계
type VerificationStep = "phone" | "code" | "verified";

export default function SmsVerification({
  phoneNumber: initialPhoneNumber = "",
  purpose = "verification",
  onVerified,
  onError,
  className = "",
  autoFocus = true,
  showPhoneInput = true,
  defaultCountry = "+82",
}: SmsVerificationProps) {
  const { t } = useI18n();
  // UI 상태 관리 (컴포넌트 전용)
  const [step, setStep] = useState<VerificationStep>(
    initialPhoneNumber && !showPhoneInput ? "code" : "phone"
  );
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  // 선택된 국가 정보
  const selectedCountryInfo = SUPPORTED_COUNTRIES.find(
    (country) => country.code === selectedCountry
  );

  // SMS 인증 훅 사용
  const smsVerification = useSmsVerification({
    purpose,
    defaultCountry: selectedCountry,
    onVerified: (phone) => {
      setStep("verified");
      onVerified?.(phone);
    },
    onError: (error) => {
      onError?.(error);
    },
    onCodeSent: () => {
      setStep("code");
      setVerificationCode("");
    },
  });

  // 참조
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // 자동 포커스
  useEffect(() => {
    if (autoFocus) {
      if (step === "phone" && phoneInputRef.current) {
        phoneInputRef.current.focus();
      } else if (step === "code" && codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }
  }, [step, autoFocus]);

  /**
   * 전화번호 형식 검증
   */
  const validatePhoneNumber = (phone: string): boolean => {
    return smsVerification.validatePhoneNumber(phone, selectedCountry);
  };

  /**
   * 전화번호 포맷팅
   */
  const formatPhoneNumber = (phone: string): string => {
    return smsVerification.normalizePhoneNumber(phone, selectedCountry);
  };

  /**
   * 인증 코드 발송
   */
  const sendVerificationCode = async () => {
    console.log("🔍 sendVerificationCode 시작");
    console.log("📱 전화번호:", phoneNumber);
    console.log("🌍 선택된 국가:", selectedCountry);

    // 숫자만 추출하여 유효성 검사
    const numbers = phoneNumber.replace(/-/g, "");
    console.log("🔢 숫자만 추출:", numbers);

    if (!validatePhoneNumber(numbers)) {
      console.log("❌ 전화번호 유효성 검사 실패");
      smsVerification.clearError();
      // 로컬 에러는 훅의 에러 시스템을 사용
      onError?.(
        `올바른 전화번호를 입력해주세요. (예: ${selectedCountryInfo?.example || "010-1234-5678"})`
      );
      return;
    }

    console.log("✅ 전화번호 유효성 검사 통과");
    console.log("🚀 smsVerification.sendCode 호출 시작");

    const success = await smsVerification.sendCode(phoneNumber);
    console.log("📤 sendCode 결과:", success);

    if (success) {
      console.log("✅ 인증 코드 발송 성공");
      // onCodeSent 콜백에서 step이 "code"로 변경됨
    } else {
      console.log("❌ 인증 코드 발송 실패");
    }
  };

  /**
   * 인증 코드 확인
   */
  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      smsVerification.clearError();
      onError?.("6자리 인증 코드를 입력해주세요.");
      return;
    }

    const success = await smsVerification.verifyCode(
      phoneNumber,
      verificationCode
    );
    if (success) {
      // onVerified 콜백에서 step이 "verified"로 변경됨
    }
  };

  /**
   * 재시작
   */
  const restart = () => {
    setStep(showPhoneInput ? "phone" : "code");
    setVerificationCode("");
    smsVerification.reset();
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
          {step === "verified" ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Smartphone className="w-6 h-6 text-pink-600" />
          )}
        </div>
        <CardTitle className="text-xl font-bold">
          {step === "phone" && t("auth.register.sms.titleShort")}
          {step === "code" && t("auth.register.sms.codeTitle")}
          {step === "verified" && t("auth.register.sms.verified")}
        </CardTitle>
        <CardDescription>
          {step === "phone" && t("auth.register.sms.descShort")}
          {step === "code" && t("auth.register.sms.codeDesc")}
          {step === "verified" && t("auth.register.sms.verifiedDesc")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 에러 메시지 */}
        {smsVerification.state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{smsVerification.state.error}</AlertDescription>
          </Alert>
        )}

        {/* 성공 메시지 */}
        {smsVerification.state.success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {smsVerification.state.success}
            </AlertDescription>
          </Alert>
        )}

        {/* 전화번호 입력 단계 */}
        {step === "phone" && showPhoneInput && (
          <div className="space-y-4">
            {/* 국가 선택 */}
            <div className="space-y-2">
              <Label htmlFor="country-select">{t("auth.register.sms.country")}</Label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("auth.register.sms.countryPlaceholder") as string} />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-gray-500">({country.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 전화번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t("auth.register.sms.phone")}</Label>
              <Input
                id="phoneNumber"
                ref={phoneInputRef}
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  // 숫자와 하이픈만 허용
                  const cleaned = e.target.value.replace(/[^\d\-]/g, "");
                  // 하이픈을 제거하고 숫자만 추출
                  const numbers = cleaned.replace(/-/g, "");
                  // 자동 포맷팅 적용
                  const formatted = smsVerification.formatPhoneNumber(
                    numbers,
                    selectedCountry
                  );
                  setPhoneNumber(formatted);
                }}
                onKeyDown={(e) => {
                  // 하이픈 직접 입력 방지
                  if (e.key === "-") {
                    e.preventDefault();
                  }
                }}
                placeholder={selectedCountryInfo?.example || "010-1234-5678"}
                className="text-center text-lg"
                maxLength={15}
              />
            </div>

            <Button
              onClick={() => {
                console.log("🔘 버튼 클릭됨");
                console.log("📱 현재 전화번호:", phoneNumber);
                console.log("🔄 로딩 상태:", smsVerification.state.isLoading);
                sendVerificationCode();
              }}
              disabled={smsVerification.state.isLoading || !phoneNumber.trim()}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              {smsVerification.state.isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t("auth.register.sms.sending")}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t("auth.register.sms.sendCode")}
                </>
              )}
            </Button>
          </div>
        )}

        {/* 인증 코드 입력 단계 */}
        {step === "code" && (
          <div className="space-y-4">
      {!showPhoneInput && (
              <div className="text-center text-sm text-gray-600">
                <Smartphone className="w-4 h-4 inline mr-1" />
        {t("auth.register.sms.sentTo")} {formatPhoneNumber(phoneNumber)}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verificationCode">{t("auth.register.sms.codeLabel")}</Label>
              <Input
                id="verificationCode"
                ref={codeInputRef}
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setVerificationCode(value);
                }}
                placeholder="123456"
                className="text-center text-lg font-mono tracking-widest"
                maxLength={6}
              />
            </div>

            {smsVerification.state.remainingAttempts !== null && (
              <div className="text-center text-sm text-orange-600">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {t("auth.register.sms.remainingAttemptsPrefix")} {smsVerification.state.remainingAttempts}{t("auth.register.sms.remainingAttemptsSuffix")}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={verifyCode}
                disabled={
                  smsVerification.state.isLoading ||
                  verificationCode.length !== 6
                }
                className="flex-1 bg-pink-600 hover:bg-pink-700"
              >
                {smsVerification.state.isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {t("auth.register.sms.verifying")}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    {t("auth.register.sms.verify")}
                  </>
                )}
              </Button>
            </div>

            <Separator />

            <div className="text-center space-y-2">
      <p className="text-sm text-gray-600">{t("auth.register.sms.notReceived")}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={sendVerificationCode}
                disabled={
                  smsVerification.state.isLoading ||
                  smsVerification.state.countdown > 0
                }
                className="text-sm"
              >
                {smsVerification.state.countdown > 0 ? (
                  <>
                    <Clock className="w-4 h-4 mr-1" />
        {smsVerification.state.countdown}{t("auth.register.sms.secondsResend")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1" />
        {t("auth.register.sms.resend")}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 인증 완료 단계 */}
        {step === "verified" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <p className="text-green-600 font-medium">{t("auth.register.sms.verified")}</p>
              <p className="text-sm text-gray-600">
                {formatPhoneNumber(phoneNumber)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={restart}
              className="text-sm"
            >
              {t("auth.register.sms.verifyAgain")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
