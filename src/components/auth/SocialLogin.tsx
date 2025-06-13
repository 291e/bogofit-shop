"use client";

import { useState, useEffect } from "react";

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
    setConfig({
      googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      googleRedirectUri: `${
        process.env.NEXT_PUBLIC_BASE_URL || ""
      }/auth/callback/google`,
      kakaoClientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "",
      kakaoRedirectUri: `${
        process.env.NEXT_PUBLIC_BASE_URL || ""
      }/auth/callback/kakao`,
    });
  }, []);

  // OAuth 인증 코드를 받아오는 함수
  const getOAuthCode = (provider: "google" | "kakao") => {
    try {
      setLoading(true);
      setError("");

      let authUrl = "";

      if (provider === "google") {
        // Google OAuth 인증 URL 생성
        const googleParams = new URLSearchParams({
          client_id: config.googleClientId,
          redirect_uri: config.googleRedirectUri,
          response_type: "code",
          scope: "email profile",
        });
        authUrl = `https://accounts.google.com/o/oauth2/auth?${googleParams.toString()}`;
      } else if (provider === "kakao") {
        // Kakao OAuth 인증 URL 생성
        const kakaoParams = new URLSearchParams({
          client_id: config.kakaoClientId,
          redirect_uri: config.kakaoRedirectUri,
          response_type: "code",
        });
        authUrl = `https://kauth.kakao.com/oauth/authorize?${kakaoParams.toString()}`;
      }

      // OAuth 인증 페이지로 리다이렉트
      window.location.href = authUrl;
    } catch (error) {
      console.error(`${provider} 인증 오류:`, error);
      setError(`${provider} 인증 중 오류가 발생했습니다.`);
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

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSocialLoginClick("google")}
          disabled={loading}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Google
        </button>
        <button
          onClick={() => handleSocialLoginClick("kakao")}
          disabled={loading}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Kakao
        </button>
      </div>

      {error && (
        <div className="mt-3 text-red-500 text-sm text-center">{error}</div>
      )}
    </div>
  );
}
