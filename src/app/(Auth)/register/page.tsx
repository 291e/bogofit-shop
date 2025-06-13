"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_ACCOUNT } from "@/graphql/mutations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [createAccount, { loading }] = useMutation(CREATE_ACCOUNT, {
    onCompleted: async (data) => {
      if (data?.createAccount?.success) {
        // 회원가입 성공 시 로그인 페이지로 이동
        router.replace("/login");
      } else {
        setError(data?.createAccount?.message || "회원가입에 실패했습니다.");
      }
    },
    onError: (err) => {
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 필수 입력값 검증
    if (!userId || !email || !password || !confirmPassword) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    createAccount({
      variables: {
        userId,
        email,
        password,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow p-8 flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-center mb-2">회원가입</h1>
        <Input
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          autoComplete="username"
        />
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "처리 중..." : "회원가입"}
        </Button>
        <div className="text-center text-sm">
          <span className="text-gray-500">이미 계정이 있으신가요?</span>{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            로그인
          </a>
        </div>
      </form>
    </div>
  );
}
