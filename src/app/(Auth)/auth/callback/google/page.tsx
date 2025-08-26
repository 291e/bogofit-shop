"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { LOGIN_WITH_GOOGLE } from "@/graphql/mutations";
import { User } from "@/graphql/types";
import { useAuth } from "@/hooks/useAuth";

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

function GoogleCallbackContent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  // Google 로그인 뮤테이션
  const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE, {
    onCompleted: (data) => {
      handleLoginSuccess(data.loginWithGoogle);
    },
    onError: (error) => {
      console.error("Google 로그인 오류:", error);
      setError("Google 로그인 중 오류가 발생했습니다.");
      setLoading(false);
    },
  });

  // 로그인 성공 처리
  const handleLoginSuccess = async (response: LoginResponse) => {
    if (response.success) {
      try {
        // 2단계: 자체 로그인 API로 JWT 쿠키 설정 (GraphQL 토큰 포함)
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId: response.user.userId,
            password: "oauth", // OAuth 로그인은 비밀번호가 없으므로 특수 플래그
            isBusiness: false,
            graphqlToken: response.token, // GraphQL 토큰 전달
          }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          // 3단계: AuthProvider에 사용자 정보 설정
          login(loginData.user);
          // 홈페이지로 강제 리다이렉트
          window.location.href = "/";
        } else {
          const errorData = await loginResponse.json();
          console.error("로그인 API 오류:", errorData);
          setError(errorData.message || "로그인 처리 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("OAuth 로그인 처리 오류:", error);
        setError("로그인 처리 중 오류가 발생했습니다.");
      }
    } else {
      setError(response.message || "로그인에 실패했습니다.");
    }
    setLoading(false);
  };

  // 인증 코드로 액세스 토큰 요청
  const getAccessToken = async (code: string) => {
    try {
      // 서버에서 액세스 토큰 요청
      const response = await fetch("/api/auth/google/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "액세스 토큰 요청 실패");
      }

      return data.accessToken;
    } catch (error) {
      console.error("액세스 토큰 요청 오류:", error);
      throw error;
    }
  };

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // URL에서 인증 코드 추출
        const code = searchParams.get("code");

        if (!code) {
          throw new Error("인증 코드가 없습니다.");
        }

        // 인증 코드로 액세스 토큰 요청
        const accessToken = await getAccessToken(code);

        // 액세스 토큰으로 로그인 뮤테이션 호출
        loginWithGoogle({ variables: { accessToken } });
      } catch (error) {
        console.error("OAuth 콜백 처리 오류:", error);
        setError("로그인 처리 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    processOAuthCallback();
  }, [searchParams, loginWithGoogle]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">로그인 처리 중...</h2>
          <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-500">오류 발생</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function GoogleCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">로딩 중...</h2>
            <p className="text-gray-500">잠시만 기다려주세요.</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
