"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/providers/I18nProvider";

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
  const { t } = useI18n();
  return (
    <div className="mt-8 space-y-6">
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-4">
          {t("auth.register.email.descPrefix")} <strong>{email}</strong>{t("auth.register.email.descSuffix")}
        </div>

        {!isEmailSent && (
          <Button
            onClick={onSendVerification}
            disabled={loading}
            className="w-full"
          >
            {loading ? t("auth.register.email.sending") : t("auth.register.email.send")}
          </Button>
        )}

        {isEmailSent && !isEmailVerified && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              <p>📧 {t("auth.register.email.checkInbox")}</p>
              <p className="mt-2">• {t("auth.register.email.tipLink")}</p>
              <p>• {t("auth.register.email.tipCode")}</p>
            </div>

            <Input
              placeholder={t("auth.register.email.codePlaceholder")}
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
                {loading ? t("auth.register.email.verifying") : t("auth.register.email.verify")}
              </Button>

              <Button
                variant="outline"
                onClick={onSendVerification}
                disabled={loading}
              >
                {t("auth.register.email.resend")}
              </Button>
            </div>

            <div className="text-xs text-gray-500 mt-4 space-y-1">
              <p>• {t("auth.register.email.note.valid30min")}</p>
              <p>• {t("auth.register.email.note.checkSpam")}</p>
              <p>• {t("auth.register.email.note.devOnly")}</p>
              <p>• {t("auth.register.email.note.devReset")}</p>
              <p>• {t("auth.register.email.note.resendIfNotFound")}</p>
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
          ← {t("auth.register.backToPrev")}
        </Button>
      </div>
    </div>
  );
}
