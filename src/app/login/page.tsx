"use client";

import { useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client";
import { LOGIN } from "@/graphql/mutations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const client = useApolloClient();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: async (data) => {
      if (data?.login?.success && data.login.token) {
        // 토큰 localStorage 저장
        localStorage.setItem("token", data.login.token);
        // Apollo 캐시 리셋 및 쿼리 refetch
        await client.resetStore();
        // 메인 페이지로 이동
        router.replace("/");
      } else {
        setError(data?.login?.message || "로그인에 실패했습니다.");
      }
    },
    onError: (err) => {
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!userId || !password) {
      setError("아이디와 비밀번호를 모두 입력하세요.");
      return;
    }
    login({ variables: { userId, password } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow p-8 flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-center mb-2">로그인</h1>
        <Input
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          autoComplete="username"
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>
    </div>
  );
}
