"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BusinessLoginForm from "@/components/(Business)/auth/LoginForm";
import BusinessRegisterForm from "@/components/(Business)/auth/RegisterForm";
import { Building2, User } from "lucide-react";
import { useAuth } from "@/providers/authProvider";

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // ✅ 모든 Hook을 조건부 return보다 먼저 호출
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/business/brands");
    }
  }, [authLoading, isAuthenticated, router]);
  
  // ✅ Auth가 로딩 중이면 로딩 화면 표시
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }
  
  // ✅ 인증된 사용자는 리다이렉트 중이므로 로딩 화면 표시
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">페이지 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-lg mx-auto">
        {/* Fixed tabs at top */}
        <div className="sticky top-0 z-10 bg-gray-50 pt-8 pb-4">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-xl border border-blue-200 flex">
            <button
              onClick={() => setActiveTab("login")}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === "login"
                  ? "bg-white shadow-sm text-blue-500"
                  : "text-gray-600 hover:text-blue-400"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span className="font-bold">비즈니스 로그인</span>
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === "register"
                  ? "bg-white shadow-sm text-blue-500"
                  : "text-gray-600 hover:text-blue-400"
              }`}
            >
              <User className="h-4 w-4" />
              <span className="font-bold">비즈니스 회원가입</span>
            </button>
          </div>
        </div>
        </div>

        {/* Render form based on active tab */}
        <div className="flex items-center justify-center ">
          {activeTab === "login" ? <BusinessLoginForm /> : <BusinessRegisterForm />}
        </div>
      </div>
    </div>
  );
}
