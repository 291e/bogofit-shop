"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RegisterRequest, RegisterResponse, RegisterFormData } from "@/types/auth";
import { authUtils } from "@/lib/auth"; 

function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    userId: "",
    email: "",
    password: "",
    phone: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.userId || !formData.email || !formData.phone || !formData.password) {
      setError("모든 필드를 입력해주세요");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: formData.userId,
          password: formData.password,
          email: formData.email,
          phone: formData.phone,
          name: formData.name,
        } as RegisterRequest),
      });

      const data: RegisterResponse = await response.json();

      if (data.success && data.token) {
        setError("");
        // Save token to localStorage
        authUtils.setToken(data.token);
        alert("회원가입이 완료되었습니다! 자동으로 로그인됩니다.");
        // Reset form
        setFormData({
          userId: "",
          email: "",
          password: "",
          phone: "",
          name: "",
        });
        // Redirect to home page
        window.location.href = "/";
      } else {
        setError(data.message || "회원가입 실패");
      }
    } catch (err) {
      setError("서버 연결 오류입니다. API를 다시 확인해주세요.");
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center  px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
    

        {/* Form content */}
        <div className="bg-white rounded-2xl shadow-2xl border border-pink-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-pink-600">회원가입</h3>
                <p className="text-sm font-medium text-gray-600 mt-1">새 계정을 만드세요</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="registerName" className="text-sm font-bold text-gray-700">이름</label>
                  <Input
                    id="registerName"
                    name="registerName"
                    type="text"
                    required
                    placeholder="이름을 입력하세요"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="registerUserId" className="text-sm font-bold text-gray-700">사용자 ID</label>
                  <Input
                    id="registerUserId"
                    name="registerUserId"
                    type="text"
                    required
                    placeholder="사용자 ID를 입력하세요"
                    value={formData.userId}
                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="registerEmail" className="text-sm font-bold text-gray-700">이메일</label>
                  <Input
                    id="registerEmail"
                    name="registerEmail"
                    type="email"
                    required
                    placeholder="이메일을 입력하세요"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="registerPhone" className="text-sm font-bold text-gray-700">전화번호</label>
                  <Input
                    id="registerPhone"
                    name="registerPhone"
                    type="tel"
                    required
                    placeholder="전화번호를 입력하세요"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="registerPassword" className="text-sm font-bold text-gray-700">비밀번호</label>
                  <Input
                    id="registerPassword"
                    name="registerPassword"
                    type="password"
                    required
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="h-11"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <Button type="submit" className="w-full h-11 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg" disabled={loading}>
                    {loading ? "회원가입 중..." : "회원가입"}
                  </Button>

                 
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterFormWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">회원가입 페이지 로딩 중...</p>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

export default RegisterFormWrapper;
