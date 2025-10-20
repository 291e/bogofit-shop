"use client";

// React & Next.js
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Types
interface LoginFormData {
  userId: string;
  password: string;
}

// Utils
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Social Login Component
function SocialLoginSection() {
  const socialButtons = [
    {
      name: "Google",
      className: "flex-1 flex items-center justify-center gap-2 px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      textClassName: "text-gray-700 font-medium text-sm"
    },
    {
      name: "카카오톡",
      className: "flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#000" d="M12 3c5.799 0 10.5 4.701 10.5 10.5S17.799 24 12 24 1.5 19.299 1.5 13.5 6.201 3 12 3z"/>
          <path fill="#FFCD00" d="M12 1.5C6.201 1.5 1.5 6.201 1.5 12S6.201 22.5 12 22.5 22.5 17.799 22.5 12 17.799 1.5 12 1.5z"/>
          <path fill="#000" d="M12 6.75c-2.898 0-5.25 2.352-5.25 5.25s2.352 5.25 5.25 5.25 5.25-2.352 5.25-5.25-2.352-5.25-5.25-5.25zm0 9c-2.071 0-3.75-1.679-3.75-3.75S9.929 8.25 12 8.25s3.75 1.679 3.75 3.75-1.679 3.75-3.75 3.75z"/>
        </svg>
      ),
      textClassName: "text-gray-800 font-medium text-sm"
    }
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">또는</span>
        </div>
      </div>

      <div className="flex gap-3">
        {socialButtons.map((button) => (
          <button
            key={button.name}
            type="button"
            className={button.className}
          >
            {button.icon}
            <span className={button.textClassName}>{button.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LoginForm() {
  // Hooks
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const router = useRouter();
  // State
  const [formData, setFormData] = useState<LoginFormData>({
    userId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Event Handlers
  const handleInputChange = (field: keyof LoginFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const validateForm = () => {
    if (!formData.userId || !formData.password) {
      const errorMessage = "사용자 ID와 비밀번호를 입력해주세요";
      setError(errorMessage);
      toast.warning(errorMessage);
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Use login from AuthProvider (handles toast notifications)
      await login({
        userId: formData.userId,
        password: formData.password,
      });
      
      // Redirect after successful login
      setTimeout(() => {
        const redirectPath = searchParams.get("redirect") || "/";
        router.replace(redirectPath);
      }, 500);
    } catch (err) {
      // Error toast already handled by AuthProvider
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  // Constants
  const formFields = [
    {
      id: "userId",
      name: "userId" as keyof LoginFormData,
      type: "text",
      label: "사용자 ID",
      placeholder: "사용자 ID를 입력하세요",
      autoComplete: "username"
    },
    {
      id: "password",
      name: "password" as keyof LoginFormData,
      type: "password",
      label: "비밀번호",
      placeholder: "비밀번호를 입력하세요",
      autoComplete: "current-password"
    }
  ];

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-pink-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#FF84CD]">로그인</h3>
                <p className="text-sm font-medium text-gray-600 mt-1">계정에 로그인하세요</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Form Fields */}
                {formFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label htmlFor={field.id} className="text-sm font-bold text-gray-700">
                      {field.label}
                    </label>
                    <Input
                      id={field.id}
                      name={field.name}
                      type={field.type}
                      required
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleInputChange(field.name)}
                      autoComplete={field.autoComplete}
                      className="h-11"
                    />
                  </div>
                ))}

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-[#FF84CD] to-[#D74FDF] hover:from-[#FF6BB3] hover:to-[#B83DCF] text-white shadow-lg" 
                    disabled={loading}
                  >
                    {loading ? "로그인 중..." : "로그인"}
                  </Button>

                  {/* Forgot Password Link */}
                  <div className="flex items-center justify-center">
                    <a 
                      href="/forgot-password" 
                      className="text-sm text-[#FF84CD] hover:text-[#D74FDF] hover:underline"
                    >
                      비밀번호를 잊으셨나요?
                    </a>
                  </div>

                  {/* Social Login */}
                  <SocialLoginSection />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginFormWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">로그인 페이지 로딩 중...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

export default LoginFormWrapper;