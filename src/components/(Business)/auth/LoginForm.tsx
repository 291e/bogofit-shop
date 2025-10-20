"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/providers/authProvider";

interface LoginFormData {
  userId: string;
  password: string;
}
import { Building2, User, Lock } from "lucide-react";

function BusinessLoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    userId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.userId || !formData.password) {
      setError("비즈니스 ID와 비밀번호를 입력해주세요");
      setLoading(false);
      return;
    }

    try {
      // Use AuthProvider's login method (handles toast notifications)
      await login({
        userId: formData.userId,
        password: formData.password,
      });
      
      // Wait a bit for cookie to be set properly
      setTimeout(() => {
        const redirectPath = searchParams.get("redirect") || "/business/brands";
        router.replace(redirectPath);
      }, 100);
    } catch (err: unknown) {
      // Error toast already handled by AuthProvider
      setError((err as Error).message || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Form content */}
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-blue-600">비즈니스 로그인</h3>
              <p className="text-sm font-medium text-gray-600 mt-1">비즈니스 계정에 로그인하세요</p>
            </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="userId" className="text-sm font-bold text-gray-700">비즈니스 ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="userId"
                      name="userId"
                      type="text"
                      required
                      placeholder="비즈니스 ID를 입력하세요"
                      value={formData.userId}
                      onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                      autoComplete="username"
                      className="h-11 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-bold text-gray-700">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="비밀번호를 입력하세요"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      autoComplete="current-password"
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg" disabled={loading}>
                    {loading ? "로그인 중..." : "비즈니스 로그인"}
                  </Button>

                  <div className="flex items-center justify-center">
                    <a 
                      href="/forgot-password" 
                      className="text-sm text-blue-500 hover:text-blue-400 hover:underline"
                    >
                      비밀번호를 잊으셨나요?
                    </a>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      일반 사용자이신가요?{" "}
                      <a
                        href="/login"
                        className="text-blue-500 hover:text-blue-400 hover:underline"
                      >
                        일반 로그인
                      </a>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

function BusinessLoginFormWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">비즈니스 로그인 페이지 로딩 중...</p>
          </div>
        </div>
      }
    >
      <BusinessLoginForm />
    </Suspense>
  );
}

export default BusinessLoginFormWrapper;
