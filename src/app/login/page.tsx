"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaComment, FaFacebook } from "react-icons/fa";
import { useMutation } from "@apollo/client";
import { LOGIN, LOGIN_WITH_GOOGLE, LOGIN_WITH_KAKAO } from "@/graphql/mutations";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [login, { loading }] = useMutation(LOGIN);
  const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE);
  const [loginWithKakao] = useMutation(LOGIN_WITH_KAKAO);

  // Đăng nhập thường
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await login({
        variables: { userId, password },
      });
      if (data?.login?.success && data?.login?.token) {
        localStorage.setItem("token", data.login.token);
        window.location.href = "/";
      } else {
        setError(data?.login?.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  // Đăng nhập Google/Kakao qua accessToken lấy từ popup REST
  const handleOAuthLogin = async (provider: "google" | "kakao") => {
    setError(null);
    try {
      const popup = window.open(`/api/auth/${provider}/token`, "_blank", "width=500,height=600");
      if (!popup) throw new Error("Không thể mở popup đăng nhập");
      window.addEventListener("message", async function handler(event) {
        if (event.origin !== window.location.origin) return;
        const { accessToken } = event.data || {};
        if (accessToken) {
          popup.close();
          window.removeEventListener("message", handler);
          const mutation = provider === "google" ? loginWithGoogle : loginWithKakao;
          const { data } = await mutation({ variables: { accessToken } });
          const result = data?.loginWithGoogle || data?.loginWithKakao;
          if (result?.success && result?.token) {
            localStorage.setItem("token", result.token);
            window.location.href = "/";
          } else {
            setError(result?.message || "OAuth 로그인 실패");
          }
        }
      });
    } catch (err: any) {
      setError(err?.message || "OAuth 로그인 실패");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-gray-200">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <CardTitle className="text-center w-full text-2xl font-bold">로그인</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                아이디
              </label>
              <input
                type="text"
                id="userId"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="아이디를 입력하세요"
                required
                value={userId}
                onChange={e => setUserId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="비밀번호를 입력하세요"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className="flex justify-end mt-1">
                <a href="#" className="text-sm text-gray-500 hover:underline">비밀번호 찾기</a>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <Button type="submit" variant="outline" className="w-full font-semibold bg-gray-700 text-white rounded-lg" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-center gap-4 w-full">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 font-semibold bg-white text-gray-800 border border-gray-300 rounded-lg py-3 hover:bg-gray-100 transition"
              onClick={() => handleOAuthLogin("google")}
              type="button"
            >
              <FcGoogle className="h-6 w-6" />
              구글 로그인
            </Button>
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 font-semibold bg-white text-gray-800 border border-gray-300 rounded-lg py-3 hover:bg-gray-100 transition"
              onClick={() => handleOAuthLogin("kakao")}
              type="button"
            >
              <FaComment className="h-6 w-6 text-yellow-500 " />
              카카오 로그인
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}