"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { RESET_PASSWORD } from "@/graphql/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyRound, Mail, Shield } from "lucide-react";

type ResetStep = "input" | "verification" | "success";

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResetPasswordModal({
  open,
  onOpenChange,
}: ResetPasswordModalProps) {
  const [step, setStep] = useState<ResetStep>("input");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [resetPasswordMutation] = useMutation(RESET_PASSWORD);

  // 인증번호 전송
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!userId || !email) {
      setError("아이디와 이메일을 모두 입력하세요.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/send-reset-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, email }),
      });

      const result = await response.json();

      if (result.success) {
        setStep("verification");
        setError("");
        console.log("✅ Verification code sent successfully");
      } else {
        console.error("❌ Failed to send verification code:", result.message);
        setError(result.message || "인증번호 전송에 실패했습니다.");
      }
    } catch (err: unknown) {
      setError(
        (err as Error).message || "인증번호 전송 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 검증
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    if (!verificationCode) {
      setError("인증번호를 입력하세요.");
      setIsVerifying(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Verification code verified successfully");
        // 인증 성공 시 비밀번호 초기화 실행
        await executePasswordReset();
      } else {
        console.error("❌ Verification failed:", result.message);
        setError(result.message || "인증번호가 올바르지 않습니다.");
      }
    } catch (err: unknown) {
      setError(
        (err as Error).message || "인증번호 확인 중 오류가 발생했습니다."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // 비밀번호 초기화 실행
  const executePasswordReset = async () => {
    try {
      const { data } = await resetPasswordMutation({
        variables: {
          userId,
          email,
        },
      });

      if (data?.resetPassword?.success) {
        setStep("success");
        setError("");
        // 성공 후 3초 뒤에 모달 닫기
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setError(
          data?.resetPassword?.message || "비밀번호 초기화에 실패했습니다."
        );
      }
    } catch (err: unknown) {
      setError(
        (err as Error).message || "비밀번호 초기화 중 오류가 발생했습니다."
      );
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // 상태 초기화
    setTimeout(() => {
      setStep("input");
      setUserId("");
      setEmail("");
      setVerificationCode("");
      setError("");
      setLoading(false);
      setIsVerifying(false);
    }, 200);
  };

  // 이전 단계로 돌아가기
  const handleBack = () => {
    setError("");
    if (step === "verification") {
      setStep("input");
      setVerificationCode("");
    }
  };

  // 단계별 헤더 정보
  const getStepInfo = () => {
    switch (step) {
      case "input":
        return {
          icon: <KeyRound className="h-5 w-5" />,
          title: "비밀번호 초기화",
          description:
            "계정 정보를 입력하시면 인증번호를 이메일로 보내드립니다.",
        };
      case "verification":
        return {
          icon: <Mail className="h-5 w-5" />,
          title: "이메일 인증",
          description: `${email}로 전송된 인증번호를 입력해주세요.`,
        };
      case "success":
        return {
          icon: <Shield className="h-5 w-5" />,
          title: "초기화 완료",
          description: "비밀번호가 성공적으로 초기화되었습니다.",
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {stepInfo.icon}
            {stepInfo.title}
          </DialogTitle>
          <DialogDescription>{stepInfo.description}</DialogDescription>
        </DialogHeader>

        {step === "success" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <KeyRound className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  비밀번호가 초기화되었습니다!
                </h3>
                <p className="text-sm text-gray-600">
                  비밀번호가 성공적으로 초기화되었습니다.
                  <br />
                  새로운 임시 비밀번호를 이메일로 보내드렸습니다.
                </p>
              </div>
            </div>
          </div>
        ) : step === "verification" ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="verificationCode" className="text-sm font-medium">
                인증번호
              </label>
              <Input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                placeholder="6자리 인증번호를 입력하세요"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.toUpperCase())
                }
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isVerifying}
              >
                이전
              </Button>
              <Button type="submit" className="flex-1" disabled={isVerifying}>
                {isVerifying ? "확인 중..." : "인증번호 확인"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendVerification} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="resetUserId" className="text-sm font-medium">
                아이디
              </label>
              <Input
                id="resetUserId"
                name="resetUserId"
                type="text"
                required
                placeholder="아이디를 입력하세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="resetEmail" className="text-sm font-medium">
                이메일
              </label>
              <Input
                id="resetEmail"
                name="resetEmail"
                type="email"
                required
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "전송 중..." : "인증번호 전송"}
              </Button>
            </div>
          </form>
        )}

        {step !== "success" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-700">
              <p className="font-medium">안내사항</p>
              <ul className="mt-1 space-y-1">
                {step === "input" ? (
                  <>
                    <li>
                      • 가입 시 사용한 아이디와 이메일을 정확히 입력해주세요
                    </li>
                    <li>• 인증번호가 이메일로 전송됩니다</li>
                    <li>• 스팸함도 함께 확인해주세요</li>
                    <li>• 인증번호는 10분간 유효합니다</li>
                    <li className="text-red-600">
                      • 🧪 개발 테스트: metabank3d@gmail.com만 사용 가능
                    </li>
                  </>
                ) : (
                  <>
                    <li>• 이메일로 전송된 6자리 인증번호를 입력해주세요</li>
                    <li>• 인증번호는 대소문자를 구분하지 않습니다</li>
                    <li>• 인증번호가 오지 않으면 스팸함을 확인해주세요</li>
                    <li>• 인증 완료 후 임시 비밀번호가 이메일로 전송됩니다</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
