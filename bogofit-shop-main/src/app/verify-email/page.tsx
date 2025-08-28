"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const email = searchParams.get("email");
  const code = searchParams.get("code");
  const type = searchParams.get("type") || "signup";

  useEffect(() => {
    const verifyEmail = async () => {
      if (!email || !code) {
        setStatus("error");
        setMessage("잘못된 인증 링크입니다.");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: decodeURIComponent(email),
            code: code.toUpperCase(),
            type,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("✅ 이메일 인증이 완료되었습니다!");

          // signup인 경우 회원가입 페이지로 리다이렉트
          if (type === "signup") {
            setTimeout(() => {
              router.push("/register?verified=true");
            }, 2000);
          }
        } else {
          setStatus("error");
          setMessage(data.message || "인증에 실패했습니다.");
        }
      } catch (error) {
        console.error("인증 에러:", error);
        setStatus("error");
        setMessage("인증 처리 중 오류가 발생했습니다.");
      }
    };

    verifyEmail();
  }, [email, code, type, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            이메일 인증
          </h2>

          {status === "loading" && (
            <div className="mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">인증 처리 중...</p>
            </div>
          )}

          {status === "success" && (
            <div className="mt-8 space-y-4">
              <div className="text-6xl">✅</div>
              <div className="text-green-600 text-lg font-medium bg-green-50 p-4 rounded-md">
                {message}
              </div>
              {type === "signup" && (
                <p className="text-gray-600">
                  잠시 후 회원가입 페이지로 이동합니다...
                </p>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="mt-8 space-y-4">
              <div className="text-6xl">❌</div>
              <div className="text-red-600 text-lg font-medium bg-red-50 p-4 rounded-md">
                {message}
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/register")}
                  className="w-full"
                >
                  회원가입 페이지로 돌아가기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  로그인 페이지로 이동
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">페이지를 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailPageContent />
    </Suspense>
  );
}
