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
import SmsVerification from "@/components/auth/SmsVerification";
import { ArrowLeft } from "lucide-react";

type RegisterStep =
  | "form"
  | "verification-choice"
  | "email-verification"
  | "sms-verification"
  | "success";

type VerificationMethod = "email" | "sms";

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
        verificationMethod: selectedVerificationMethod,
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
      setSelectedVerificationMethod("email");
      setStep("email-verification");
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

    // 기본 정보 입력 완료 → 인증 방식 선택 단계로 이동
    setStep("verification-choice");
    setSuccess("기본 정보 입력이 완료되었습니다. 인증 방식을 선택해주세요.");
  };

  // 인증 방식 선택 핸들러
  const handleVerificationMethodSelect = (method: VerificationMethod) => {
    setSelectedVerificationMethod(method);
    if (method === "email") {
      setStep("email-verification");
    } else {
      setStep("sms-verification");
    }
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

  // SMS 인증 완료 핸들러
  const handleSmsVerified = (phoneNumber: string) => {
    console.log("📱 SMS 인증 완료:", phoneNumber);
    // 전화번호 정보 업데이트
    updateField("phoneNumber", phoneNumber);

    // 인증 완료 후 회원가입 진행
    setTimeout(() => {
      handleCreateAccount();
    }, 1000);
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
      case "verification-choice":
        return {
          title: "인증 방식 선택",
          description: "본인 확인을 위한 인증 방식을 선택해주세요",
        };
      case "email-verification":
        return {
          title: "이메일 인증",
          description: "회원가입을 완료하려면 이메일 인증이 필요합니다",
        };
      case "sms-verification":
        return {
          title: "휴대폰 인증",
          description: "회원가입을 완료하려면 휴대폰 인증이 필요합니다",
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
                  step === "verification-choice" ||
                  step === "email-verification" ||
                  step === "sms-verification"
                    ? "bg-indigo-600"
                    : "bg-gray-300"
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

        {step === "verification-choice" && (
          <div className="space-y-6">
            {/* 에러 메시지 */}
            {currentError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{currentError}</p>
              </div>
            )}

            {/* 성공 메시지 */}
            {currentSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-600">{currentSuccess}</p>
              </div>
            )}

            {/* 인증 방식 선택 */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* 이메일 인증 버튼 */}
                <button
                  onClick={() => handleVerificationMethodSelect("email")}
                  className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📧</div>
                    <div className="font-medium text-gray-900">이메일 인증</div>
                    <div className="text-sm text-gray-600">
                      {formData.email}로 인증 코드 발송
                    </div>
                  </div>
                </button>

                {/* 휴대폰 인증 버튼 */}
                <button
                  onClick={() => handleVerificationMethodSelect("sms")}
                  className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-medium text-gray-900">휴대폰 인증</div>
                    <div className="text-sm text-gray-600">
                      SMS로 인증 코드 발송
                    </div>
                  </div>
                </button>
              </div>

              {/* 뒤로가기 버튼 */}
              <button
                onClick={() => setStep("form")}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
                기본 정보 입력으로 돌아가기
              </button>
            </div>
          </div>
        )}

        {step === "email-verification" && (
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
            onGoBack={() => setStep("verification-choice")}
          />
        )}

        {step === "sms-verification" && (
          <div className="space-y-4">
            {/* 에러 메시지 */}
            {currentError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{currentError}</p>
              </div>
            )}

            {/* 성공 메시지 */}
            {currentSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-600">{currentSuccess}</p>
              </div>
            )}

            {/* SMS 인증 컴포넌트 */}
            <SmsVerification
              purpose="signup"
              onVerified={handleSmsVerified}
              onError={(error) => setError(error)}
              showPhoneInput={true}
              autoFocus={true}
            />

            {/* 뒤로가기 버튼 */}
            <button
              onClick={() => setStep("verification-choice")}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              인증 방식 선택으로 돌아가기
            </button>
          </div>
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
