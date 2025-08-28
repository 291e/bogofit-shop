"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import { useRegisterForm } from "@/hooks/useRegisterForm";
import { useEmailVerification } from "@/hooks/useEmailVerification";

import { RegisterFormStep } from "@/components/auth/RegisterFormStep";
import { EmailVerificationStep } from "@/components/auth/EmailVerificationStep";
import { RegisterSuccessStep } from "@/components/auth/RegisterSuccessStep";
import { TermsAgreementModal } from "@/components/auth/TermsAgreementModal";
import SmsVerification from "@/components/auth/SmsVerification";
import { ArrowLeft } from "lucide-react";

type RegisterStep =
  | "form"
  | "verification-choice"
  | "email-verification"
  | "sms-verification"
  | "success";

type VerificationMethod = "email" | "sms";

type TermsAgreement = {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
};

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Custom Hooks
  const { formData, updateField, validateForm } = useRegisterForm();
  const {
    isEmailSent,
    isEmailVerified,
    verificationCode,
    loading: emailLoading,
    error: emailError,
    success: emailSuccess,
    setVerificationCode,
    sendVerificationEmail,
  } = useEmailVerification();

  // UI 상태
  const [step, setStep] = useState<RegisterStep>("form");
  const [selectedVerificationMethod, setSelectedVerificationMethod] =
    useState<VerificationMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 약관 동의 상태
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsAgreement, setTermsAgreement] = useState<TermsAgreement>({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const hasAgreedToTerms = termsAgreement.terms && termsAgreement.privacy;

  // 회원가입 처리 함수
  const handleCreateAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log("[회원가입] 자체 API 호출 시작");

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: formData.userId,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          birthDate: formData.birthDate,
          profile: formData.profile,
          zipCode: formData.zipCode,
          address: formData.address,
          addressDetail: formData.addressDetail,
          termsAgreement,
          verificationMethod: selectedVerificationMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "회원가입에 실패했습니다");
      }

      const result = await response.json();
      console.log("[회원가입] 성공:", result.message);

      // 자동 로그인 처리 (API에서 쿠키가 설정됨)
      if (result.user) {
        await login(result.user);
      }

      setStep("success");
      setSuccess("🎉 회원가입이 완료되었습니다! 환영합니다!");

      // 3초 후 홈페이지로 이동
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      console.error("[회원가입] 실패:", error);
      setError(
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다"
      );
    } finally {
      setLoading(false);
    }
  }, [formData, termsAgreement, selectedVerificationMethod, login]);

  // URL 파라미터에서 초기 단계 설정
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (
      stepParam &&
      [
        "form",
        "verification-choice",
        "email-verification",
        "sms-verification",
        "success",
      ].includes(stepParam)
    ) {
      setStep(stepParam as RegisterStep);
    }
  }, [searchParams]);

  // 단계별 핸들러
  const handleFormSubmit = useCallback(() => {
    const validation = validateForm();
    if (!validation.isValid) {
      setError("입력 정보를 확인해주세요.");
      return;
    }

    if (!hasAgreedToTerms) {
      setError("필수 약관에 동의해주세요.");
      return;
    }

    setError("");
    setStep("verification-choice");
  }, [validateForm, hasAgreedToTerms]);

  const handleVerificationChoice = useCallback((method: VerificationMethod) => {
    setSelectedVerificationMethod(method);
    if (method === "email") {
      setStep("email-verification");
    } else {
      setStep("sms-verification");
    }
  }, []);

  const handleEmailVerified = useCallback(() => {
    console.log("이메일 인증 완료, 회원가입 진행");
    handleCreateAccount();
  }, [handleCreateAccount]);

  const handleSmsVerified = useCallback(() => {
    console.log("SMS 인증 완료, 회원가입 진행");
    setTimeout(() => {
      handleCreateAccount();
    }, 500);
  }, [handleCreateAccount]);

  const handleGoBack = useCallback(() => {
    switch (step) {
      case "verification-choice":
        setStep("form");
        break;
      case "email-verification":
      case "sms-verification":
        setStep("verification-choice");
        break;
      default:
        setStep("form");
    }
  }, [step]);

  // 렌더링
  const renderStep = () => {
    switch (step) {
      case "form":
        return (
          <RegisterFormStep
            formData={formData}
            updateField={updateField}
            onSubmit={handleFormSubmit}
            onTermsClick={() => setTermsModalOpen(true)}
            hasAgreedToTerms={hasAgreedToTerms}
            loading={loading}
            error={error}
            success={success}
          />
        );

      case "verification-choice":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                본인 인증 방법 선택
              </h2>
              <p className="text-gray-600 mb-8">
                회원가입을 완료하기 위해 본인 인증을 진행해주세요.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleVerificationChoice("email")}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">이메일 인증</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.email}로 인증 코드를 발송합니다.
                    </p>
                  </div>
                  <div className="text-blue-500">📧</div>
                </div>
              </button>

              <button
                onClick={() => handleVerificationChoice("sms")}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">SMS 인증</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      휴대폰 번호로 인증 코드를 발송합니다.
                    </p>
                  </div>
                  <div className="text-green-500">📱</div>
                </div>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
          </div>
        );

      case "email-verification":
        return (
          <EmailVerificationStep
            email={formData.email}
            isEmailSent={isEmailSent}
            isEmailVerified={isEmailVerified}
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            onSendVerification={() =>
              sendVerificationEmail(
                formData.email,
                formData.name,
                formData.userId
              )
            }
            onVerifyCode={handleEmailVerified}
            onGoBack={handleGoBack}
            loading={emailLoading}
            error={emailError}
            success={emailSuccess}
          />
        );

      case "sms-verification":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                휴대폰 인증
              </h2>
              <p className="text-gray-600 mb-8">
                휴대폰 번호로 인증 코드를 발송하여 본인 확인을 진행합니다.
              </p>
            </div>

            <SmsVerification
              phoneNumber={formData.phoneNumber}
              onVerified={handleSmsVerified}
              onError={(error) => setError(error)}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
          </div>
        );

      case "success":
        return <RegisterSuccessStep success={success} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 뒤로가기 버튼 */}
          {step !== "form" && step !== "success" && (
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </button>
          )}

          {renderStep()}

          {/* 약관 동의 모달 */}
          <TermsAgreementModal
            open={termsModalOpen}
            onOpenChange={setTermsModalOpen}
            onAgree={setTermsAgreement}
            initialAgreements={termsAgreement}
          />
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
