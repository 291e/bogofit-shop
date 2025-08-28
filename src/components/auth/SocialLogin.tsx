"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SocialLoginProps {
  className?: string;
}

export default function SocialLogin({ className }: SocialLoginProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState({
    googleClientId: "",
    googleRedirectUri: "",
    kakaoClientId: "",
    kakaoRedirectUri: "",
  });

  // 클라이언트 사이드에서만 환경 변수 접근
  useEffect(() => {
    setMounted(true);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "";

    const newConfig = {
      googleClientId,
      googleRedirectUri: `${baseUrl}/auth/callback/google`,
      kakaoClientId,
      kakaoRedirectUri: `${baseUrl}/auth/callback/kakao`,
    };

    setConfig(newConfig);

    // 디버깅 정보 출력
    console.log("=== Social Login Config Debug ===");
    console.log("Base URL:", baseUrl || "❌ Missing");
    console.log("Google Client ID:", googleClientId ? "✓ Set" : "❌ Missing");
    console.log("Kakao Client ID:", kakaoClientId ? "✓ Set" : "❌ Missing");
    console.log("Google Redirect URI:", newConfig.googleRedirectUri);
    console.log("Kakao Redirect URI:", newConfig.kakaoRedirectUri);
  }, []);

  // OAuth 인증 코드를 받아오는 함수
  const getOAuthCode = (provider: "google" | "kakao") => {
    try {
      setLoading(true);
      setError("");

      let authUrl = "";

      if (provider === "google") {
        if (!config.googleClientId) {
          throw new Error("Google Client ID가 설정되지 않았습니다.");
        }

        // Google OAuth 인증 URL 생성
        const googleParams = new URLSearchParams({
          client_id: config.googleClientId,
          redirect_uri: config.googleRedirectUri,
          response_type: "code",
          scope: "email profile",
        });
        authUrl = `https://accounts.google.com/o/oauth2/auth?${googleParams.toString()}`;

        console.log("Google OAuth URL:", authUrl);
      } else if (provider === "kakao") {
        if (!config.kakaoClientId) {
          throw new Error("Kakao Client ID가 설정되지 않았습니다.");
        }

        // Kakao OAuth 인증 URL 생성
        const kakaoParams = new URLSearchParams({
          client_id: config.kakaoClientId,
          redirect_uri: config.kakaoRedirectUri,
          response_type: "code",
        });
        authUrl = `https://kauth.kakao.com/oauth/authorize?${kakaoParams.toString()}`;

        console.log("Kakao OAuth URL:", authUrl);
      }

      // OAuth 인증 페이지로 리다이렉트
      window.location.href = authUrl;
    } catch (error) {
      console.error(`${provider} 인증 오류:`, error);
      setError(
        error instanceof Error
          ? error.message
          : `${provider} 인증 중 오류가 발생했습니다.`
      );
      setLoading(false);
    }
  };

  // 소셜 로그인 버튼 클릭
  const handleSocialLoginClick = (provider: "google" | "kakao") => {
    getOAuthCode(provider);
  };

  // 서버 사이드 렌더링 시 또는 마운트 되기 전에는 렌더링하지 않음
  if (!mounted) {
    return <div className={className}></div>;
  }

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">
            또는 다음으로 로그인
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => handleSocialLoginClick("google")}
          disabled={loading || !config.googleClientId}
          className="w-full flex justify-center items-center hover:opacity-80 disabled:opacity-50 transition-opacity cursor-pointer"
          title={
            !config.googleClientId
              ? "Google Client ID가 설정되지 않았습니다"
              : ""
          }
        >
          <Image
            src="/auth/google.svg"
            alt="Google로 로그인"
            width={179}
            height={40}
            className="h-10 w-auto"
          />
        </button>
        <button
          onClick={() => handleSocialLoginClick("kakao")}
          disabled={loading || !config.kakaoClientId}
          className="w-full flex justify-center items-center hover:opacity-80 disabled:opacity-50 transition-opacity cursor-pointer"
          title={
            !config.kakaoClientId ? "Kakao Client ID가 설정되지 않았습니다" : ""
          }
        >
          <Image
            src="/auth/kakao.svg"
            alt="Kakao로 로그인"
            width={512}
            height={125}
            className="h-10 w-auto"
          />
        </button>
      </div>

      {error && (
        <div className="mt-3 text-red-500 text-sm text-center">{error}</div>
      )}

      {/* 개발 모드에서만 설정 상태 표시 */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-3 text-xs text-gray-400 text-center">
          <div>Google: {config.googleClientId ? "✓" : "❌"}</div>
          <div>Kakao: {config.kakaoClientId ? "✓" : "❌"}</div>
        </div>
      )}
    </div>
  );
}
