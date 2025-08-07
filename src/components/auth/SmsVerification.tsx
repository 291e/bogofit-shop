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
  Smartphone,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import { useSmsVerification } from "@/hooks/useSmsVerification";

// 컴포넌트 Props 인터페이스
interface SmsVerificationProps {
  phoneNumber?: string;
  purpose?: string;
  onVerified?: (phoneNumber: string) => void;
  onError?: (error: string) => void;
  className?: string;
  autoFocus?: boolean;
  showPhoneInput?: boolean;
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
}: SmsVerificationProps) {
  // UI 상태 관리 (컴포넌트 전용)
  const [step, setStep] = useState<VerificationStep>(
    initialPhoneNumber && !showPhoneInput ? "code" : "phone"
  );
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [verificationCode, setVerificationCode] = useState("");

  // SMS 인증 훅 사용
  const smsVerification = useSmsVerification({
    purpose,
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
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");
    // 한국 전화번호 패턴: 010, 011, 016, 017, 018, 019로 시작하는 11자리
    const koreanPhonePattern = /^(01[0-9])\d{8}$/;
    // 또는 +82로 시작하는 국제 형식
    const internationalPattern = /^\+82(1[0-9])\d{8}$/;

    return (
      koreanPhonePattern.test(cleaned) || internationalPattern.test(cleaned)
    );
  };

  /**
   * 전화번호 포맷팅
   */
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");

    if (cleaned.startsWith("+82")) {
      return cleaned;
    }

    if (cleaned.startsWith("82")) {
      return "+" + cleaned;
    }

    if (cleaned.startsWith("0")) {
      return cleaned.replace(/^0/, "+82");
    }

    if (cleaned.length === 10) {
      return "+82" + cleaned;
    }

    return phone;
  };

  /**
   * 인증 코드 발송
   */
  const sendVerificationCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      smsVerification.clearError();
      // 로컬 에러는 훅의 에러 시스템을 사용
      onError?.("올바른 전화번호를 입력해주세요. (예: 010-1234-5678)");
      return;
    }

    const success = await smsVerification.sendCode(
      formatPhoneNumber(phoneNumber)
    );
    if (success) {
      // onCodeSent 콜백에서 step이 "code"로 변경됨
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
      formatPhoneNumber(phoneNumber),
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
          {step === "phone" && "전화번호 인증"}
          {step === "code" && "인증 코드 확인"}
          {step === "verified" && "인증 완료"}
        </CardTitle>
        <CardDescription>
          {step === "phone" &&
            "전화번호를 입력하시면 인증 코드를 발송해드립니다."}
          {step === "code" && "발송된 6자리 인증 코드를 입력해주세요."}
          {step === "verified" && "전화번호 인증이 완료되었습니다."}
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
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">전화번호</Label>
              <Input
                id="phoneNumber"
                ref={phoneInputRef}
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="010-1234-5678"
                className="text-center text-lg"
              />
            </div>
            <Button
              onClick={sendVerificationCode}
              disabled={smsVerification.state.isLoading || !phoneNumber.trim()}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              {smsVerification.state.isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  발송 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  인증 코드 발송
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
                {formatPhoneNumber(phoneNumber)}로 발송된 인증 코드
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verificationCode">인증 코드 (6자리)</Label>
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
                남은 시도 횟수: {smsVerification.state.remainingAttempts}회
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
                    확인 중...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    인증하기
                  </>
                )}
              </Button>
            </div>

            <Separator />

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                인증 코드를 받지 못하셨나요?
              </p>
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
                    {smsVerification.state.countdown}초 후 재발송
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    다시 발송
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
              <p className="text-green-600 font-medium">
                인증이 완료되었습니다!
              </p>
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
              다시 인증하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
