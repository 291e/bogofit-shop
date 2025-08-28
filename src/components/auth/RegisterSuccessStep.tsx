"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";

interface RegisterSuccessStepProps {
  success: string;
}

export function RegisterSuccessStep({ success }: RegisterSuccessStepProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="mt-8 text-center space-y-6">
      <div className="text-6xl">🎉</div>

      {success && (
        <div className="text-green-500 text-lg font-medium bg-green-50 p-4 rounded-md">
          {success}
        </div>
      )}

      <div className="text-gray-600 space-y-2">
        <p>{t("auth.register.success.autoRedirect")}</p>
        <p className="text-sm">{t("auth.register.success.subDesc")}</p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => router.replace("/login")}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
        >
          {t("auth.register.success.goLogin")}
        </Button>

        <Button
          variant="outline"
          onClick={() => router.replace("/")}
          className="w-full"
        >
          {t("auth.register.success.goHome")}
        </Button>
      </div>

      <div className="text-xs text-gray-400 mt-6">
        <p>{t("auth.register.success.footer")}</p>
      </div>
    </div>
  );
}
