"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RegisterDto } from "@/types/auth";

import { Building2, User, Lock, Mail, Phone } from "lucide-react";
import { useAuth } from "@/providers/authProvider";

function BusinessRegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterDto>({
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
      // Use register from AuthProvider (handles toast notifications)
      await register({
        userId: formData.userId,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
      });
      
      // Reset form
      setFormData({
        userId: "",
        email: "",
        password: "",
        phone: "",
        name: "",
      });
      
      // Redirect to business page
      window.location.href = "/business/brands";
    } catch (err) {
      // Error toast already handled by AuthProvider
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다");
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
              <h3 className="text-xl font-bold text-blue-600">비즈니스 회원가입</h3>
              <p className="text-sm font-medium text-gray-600 mt-1">새 비즈니스 계정을 만드세요</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="registerName" className="text-sm font-bold text-gray-700">이름</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerName"
                    name="registerName"
                    type="text"
                    required
                    placeholder="이름을 입력하세요"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="registerUserId" className="text-sm font-bold text-gray-700">비즈니스 ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerUserId"
                    name="registerUserId"
                    type="text"
                    required
                    placeholder="비즈니스 ID를 입력하세요"
                    value={formData.userId}
                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="registerEmail" className="text-sm font-bold text-gray-700">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerEmail"
                    name="registerEmail"
                    type="email"
                    required
                    placeholder="이메일을 입력하세요"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="registerPhone" className="text-sm font-bold text-gray-700">전화번호</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerPhone"
                    name="registerPhone"
                    type="tel"
                    required
                    placeholder="전화번호를 입력하세요"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="registerPassword" className="text-sm font-bold text-gray-700">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerPassword"
                    name="registerPassword"
                    type="password"
                    required
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                  {loading ? "회원가입 중..." : "비즈니스 회원가입"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    일반 사용자이신가요?{" "}
                    <a
                      href="/login"
                      className="text-blue-500 hover:text-blue-400 hover:underline"
                    >
                      일반 회원가입
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

function BusinessRegisterFormWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">비즈니스 회원가입 페이지 로딩 중...</p>
          </div>
        </div>
      }
    >
      <BusinessRegisterForm />
    </Suspense>
  );
}
  
export default BusinessRegisterFormWrapper;
