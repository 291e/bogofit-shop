"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginFormWrapper from "@/components/(Public)/auth/LoginForm";
import RegisterFormWrapper from "@/components/(Public)/auth/RegisterForm";
import { User, Building2 } from "lucide-react";
import { useAuth } from "@/providers/authProvider";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Check if user is already authenticated
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">확인 중...</p>
        </div>
      </div>
    );
  }
  
  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">리다이렉트 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Tabs nằm ngoài form */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-1 rounded-xl border border-pink-200 flex">
            <button
              onClick={() => setActiveTab("login")}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === "login"
                  ? "bg-white shadow-sm text-pink-500"
                  : "text-gray-600 hover:text-pink-400"
              }`}
            >
            <User className="h-4 w-4" />
            <span className="font-bold">로그인</span>
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === "register"
                  ? "bg-white shadow-sm text-pink-500"
                  : "text-gray-600 hover:text-pink-400"
              }`}
            >
            <Building2 className="h-4 w-4" />
            <span className="font-bold">회원가입</span>
            </button>
          </div>
        </div>

        {/* Render form based on active tab */}
        <div className="min-h-[600px]">
          {activeTab === "login" ? <LoginFormWrapper /> : <RegisterFormWrapper />}
        </div>
      </div>
    </div>
  );
}
