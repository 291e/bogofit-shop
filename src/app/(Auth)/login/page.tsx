"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "@/graphql/mutations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SocialLogin from "@/components/auth/SocialLogin";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  // Apollo Client의 login 뮤테이션 정의
  const [loginMutation] = useMutation(LOGIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!userId || !password) {
      setError("아이디와 비밀번호를 모두 입력하세요.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await loginMutation({
        variables: { userId, password },
      });

      if (data?.login?.success && data.login.token) {
        // AuthProvider의 login 함수 사용
        authLogin(data.login.token, data.login.user);
        router.replace("/");
      } else {
        setError(data?.login?.message || "로그인에 실패했습니다.");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md  flex flex-col gap-2">
            <div>
              <label htmlFor="userId" className="sr-only">
                아이디
              </label>
              <Input
                id="userId"
                name="userId"
                type="text"
                required
                placeholder="아이디"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </div>
        </form>

        {/* 소셜 로그인 컴포넌트 */}
        <SocialLogin className="mt-6" />
      </div>
    </div>
  );
}
