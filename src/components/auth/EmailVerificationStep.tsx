"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailVerificationStepProps {
  email: string;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  isEmailSent: boolean;
  isEmailVerified: boolean;
  loading: boolean;
  error: string;
  success: string;
  onSendVerification: () => void;
  onVerifyCode: () => void;
  onGoBack: () => void;
}

export function EmailVerificationStep({
  email,
  verificationCode,
  setVerificationCode,
  isEmailSent,
  isEmailVerified,
  loading,
  error,
  success,
  onSendVerification,
  onVerifyCode,
  onGoBack,
}: EmailVerificationStepProps) {
  return (
    <div className="mt-8 space-y-6">
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-4">
          <strong>{email}</strong>로 인증번호를 전송합니다.
        </div>

        {!isEmailSent && (
          <Button
            onClick={onSendVerification}
            disabled={loading}
            className="w-full"
          >
            {loading ? "전송 중..." : "인증번호 전송"}
          </Button>
        )}

        {isEmailSent && !isEmailVerified && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              <p>📧 이메일을 확인해주세요!</p>
              <p className="mt-2">
                • <strong>이메일 링크</strong>를 클릭하거나
              </p>
              <p>
                • <strong>인증번호</strong>를 직접 입력해주세요
              </p>
            </div>

            <Input
              placeholder="인증번호 입력 (6자리)"
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(e.target.value.toUpperCase())
              }
              disabled={loading}
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
            />

            <div className="flex space-x-2">
              <Button
                onClick={onVerifyCode}
                disabled={
                  loading || !verificationCode || verificationCode.length !== 6
                }
                className="flex-1"
              >
                {loading ? "확인 중..." : "인증번호 확인"}
              </Button>

              <Button
                variant="outline"
                onClick={onSendVerification}
                disabled={loading}
              >
                재전송
              </Button>
            </div>

            <div className="text-xs text-gray-500 mt-4 space-y-1">
              <p>• 인증번호는 30분간 유효합니다</p>
              <p>• 이메일이 오지 않으면 스팸함을 확인해주세요</p>
              <p>• 🧪 개발 테스트: metabank3d@gmail.com만 사용 가능</p>
              <p>• ⚠️ 개발환경: 코드 저장/재시작 시 인증번호가 초기화됩니다</p>
              <p>
                • 🔄 &quot;인증번호를 찾을 수 없다&quot;면 재전송 버튼을
                눌러주세요
              </p>
            </div>
          </div>
        )}
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

      <div className="text-center">
        <Button
          variant="ghost"
          onClick={onGoBack}
          disabled={loading}
          className="text-gray-600 hover:text-gray-800"
        >
          ← 이전 단계로
        </Button>
      </div>
    </div>
  );
}
