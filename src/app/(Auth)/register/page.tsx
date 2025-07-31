"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_ACCOUNT } from "@/graphql/mutations";
import { useRouter, useSearchParams } from "next/navigation";

import { useRegisterForm } from "@/hooks/useRegisterForm";
import { useEmailVerification } from "@/hooks/useEmailVerification";

import { RegisterFormStep } from "@/components/auth/RegisterFormStep";
import { EmailVerificationStep } from "@/components/auth/EmailVerificationStep";
import { RegisterSuccessStep } from "@/components/auth/RegisterSuccessStep";
import { TermsAgreementModal } from "@/components/auth/TermsAgreementModal";

type RegisterStep = "form" | "verification" | "success";

interface TermsAgreement {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    verifyEmailCode,
  } = useEmailVerification();

  // UI 상태
  const [step, setStep] = useState<RegisterStep>("form");
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

  // GraphQL Mutation
  const [createAccount] = useMutation(CREATE_ACCOUNT, {
    onCompleted: async (data) => {
      if (data?.createAccount?.success) {
        await saveAdditionalUserInfo(data.createAccount.user?.id);
        setStep("success");
        setSuccess("🎉 회원가입이 완료되었습니다! 환영합니다!");
        setError("");
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.replace("/login");
        }, 3000);
      } else {
        setError(data?.createAccount?.message || "회원가입에 실패했습니다.");
        setSuccess("");
      }
      setLoading(false);
    },
    onError: (err) => {
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
      setSuccess("");
      setLoading(false);
    },
  });

  // 추가 사용자 정보 저장 (뮤테이션 외 정보들)
  const saveAdditionalUserInfo = async (userId: string) => {
    try {
      // TODO: 추가 정보를 저장하는 API 또는 GraphQL 뮤테이션 호출
      console.log("추가 사용자 정보:", {
        userId,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        birthDate: formData.birthDate,
        profile: formData.profile,
        zipCode: formData.zipCode,
        address: formData.address,
        addressDetail: formData.addressDetail,
        termsAgreement,
      });
    } catch (error) {
      console.error("추가 정보 저장 실패:", error);
    }
  };

  // 회원가입 실행
  const handleCreateAccount = useCallback(() => {
    setLoading(true);
    createAccount({
      variables: {
        userId: formData.userId,
        email: formData.email,
        password: formData.password,
      },
    });
  }, [createAccount, formData.userId, formData.email, formData.password]);

  // 이메일 링크를 통한 인증 완료 처리
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true" && step === "form") {
      console.log("📧 이메일 링크를 통한 인증 완료 감지");
      setStep("verification");
      setSuccess("✅ 이메일 인증이 완료되었습니다! 회원가입을 진행합니다.");

      // 1초 후 자동으로 회원가입 진행
      setTimeout(() => {
        handleCreateAccount();
      }, 1000);
    }
  }, [searchParams, step, handleCreateAccount]);

  // 폼 제출 핸들러
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validation = validateForm();
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    if (!hasAgreedToTerms) {
      setError("필수 약관에 동의해주세요.");
      return;
    }

    // 기본 정보 입력 완료 → 이메일 인증 단계로 이동
    setStep("verification");
    setSuccess("기본 정보 입력이 완료되었습니다. 이메일 인증을 진행해주세요.");
  };

  // 이메일 인증 코드 전송
  const handleSendVerification = async () => {
    await sendVerificationEmail(formData.email, formData.name, formData.userId);
  };

  // 이메일 인증 코드 확인
  const handleVerifyCode = async () => {
    const success = await verifyEmailCode(formData.email, verificationCode);
    if (success) {
      // 인증 완료 후 회원가입 진행
      setTimeout(() => {
        handleCreateAccount();
      }, 1000);
    }
  };

  // 약관 동의 핸들러
  const handleTermsAgree = (agreements: TermsAgreement) => {
    setTermsAgreement(agreements);
  };

  // 단계별 제목과 설명
  const getStepInfo = () => {
    switch (step) {
      case "form":
        return {
          title: "회원가입",
          description: "BOGOFIT에 오신 것을 환영합니다",
        };
      case "verification":
        return {
          title: "이메일 인증",
          description: "회원가입을 완료하려면 이메일 인증이 필요합니다",
        };
      case "success":
        return {
          title: "회원가입 완료",
          description: "환영합니다! 곧 로그인 페이지로 이동합니다",
        };
    }
  };

  const stepInfo = getStepInfo();
  const currentLoading = loading || emailLoading;
  const currentError = error || emailError;
  const currentSuccess = success || emailSuccess;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {stepInfo.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {stepInfo.description}
          </p>

          {/* 진행 단계 표시 */}
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  step === "form" ? "bg-indigo-600" : "bg-gray-300"
                }`}
              />
              <div
                className={`w-2 h-2 rounded-full ${
                  step === "verification" ? "bg-indigo-600" : "bg-gray-300"
                }`}
              />
              <div
                className={`w-2 h-2 rounded-full ${
                  step === "success" ? "bg-indigo-600" : "bg-gray-300"
                }`}
              />
            </div>
          </div>
        </div>

        {/* 단계별 컴포넌트 렌더링 */}
        {step === "form" && (
          <RegisterFormStep
            formData={formData}
            updateField={updateField}
            onSubmit={handleFormSubmit}
            loading={currentLoading}
            error={currentError}
            success={currentSuccess}
            onTermsClick={() => setTermsModalOpen(true)}
            hasAgreedToTerms={hasAgreedToTerms}
          />
        )}

        {step === "verification" && (
          <EmailVerificationStep
            email={formData.email}
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            isEmailSent={isEmailSent}
            isEmailVerified={isEmailVerified}
            loading={currentLoading}
            error={currentError}
            success={currentSuccess}
            onSendVerification={handleSendVerification}
            onVerifyCode={handleVerifyCode}
            onGoBack={() => setStep("form")}
          />
        )}

        {step === "success" && <RegisterSuccessStep success={currentSuccess} />}

        {/* 약관 동의 모달 */}
        <TermsAgreementModal
          open={termsModalOpen}
          onOpenChange={setTermsModalOpen}
          onAgree={handleTermsAgree}
          initialAgreements={termsAgreement}
        />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">페이지를 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
