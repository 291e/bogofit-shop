"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface RegisterSuccessStepProps {
  success: string;
}

export function RegisterSuccessStep({ success }: RegisterSuccessStepProps) {
  const router = useRouter();

  return (
    <div className="mt-8 text-center space-y-6">
      <div className="text-6xl">🎉</div>

      {success && (
        <div className="text-green-500 text-lg font-medium bg-green-50 p-4 rounded-md">
          {success}
        </div>
      )}

      <div className="text-gray-600 space-y-2">
        <p>잠시 후 로그인 페이지로 자동 이동됩니다.</p>
        <p className="text-sm">
          이제 BogoFit Shop의 모든 서비스를 이용하실 수 있습니다!
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => router.replace("/login")}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
        >
          지금 로그인하러 가기
        </Button>

        <Button
          variant="outline"
          onClick={() => router.replace("/")}
          className="w-full"
        >
          홈페이지로 이동
        </Button>
      </div>

      <div className="text-xs text-gray-400 mt-6">
        <p>회원가입이 완료되었습니다. 환영합니다! 🚀</p>
      </div>
    </div>
  );
}
