"use client";

// React
import { useState, Suspense } from "react";

// Types
interface RegisterFormData {
  userId: string;
  name: string;
  email: string;
  password: string;
  phone: string;
}

// Utils
import { useAuth } from "@/providers/authProvider";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert"; 

function RegisterForm() {
  const { register } = useAuth();
  
  // State
  const [formData, setFormData] = useState<RegisterFormData>({
    userId: "",
    email: "",
    password: "",
    phone: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Event Handlers
  const handleInputChange = (field: keyof RegisterFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const validateForm = () => {
    const requiredFields: (keyof RegisterFormData)[] = ['name', 'userId', 'email', 'phone', 'password'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      const errorMessage = "모든 필드를 입력해주세요";
      setError(errorMessage);
      toast.warning(errorMessage);
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      email: "",
      password: "",
      phone: "",
      name: "",
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Use register from AuthProvider (handles toast notifications)
      await register({
        userId: formData.userId,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
      });
      
      resetForm();
      
      // Redirect after successful registration
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err) {
      // Error toast already handled by AuthProvider
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  // Constants
  const formFields = [
    {
      id: "registerName",
      name: "name" as keyof RegisterFormData,
      type: "text",
      label: "이름",
      placeholder: "이름을 입력하세요"
    },
    {
      id: "registerUserId",
      name: "userId" as keyof RegisterFormData,
      type: "text",
      label: "사용자 ID",
      placeholder: "사용자 ID를 입력하세요"
    },
    {
      id: "registerEmail",
      name: "email" as keyof RegisterFormData,
      type: "email",
      label: "이메일",
      placeholder: "이메일을 입력하세요"
    },
    {
      id: "registerPhone",
      name: "phone" as keyof RegisterFormData,
      type: "tel",
      label: "전화번호",
      placeholder: "전화번호를 입력하세요"
    },
    {
      id: "registerPassword",
      name: "password" as keyof RegisterFormData,
      type: "password",
      label: "비밀번호",
      placeholder: "비밀번호를 입력하세요"
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
                <h3 className="text-xl font-bold text-[#FF84CD]">회원가입</h3>
                <p className="text-sm font-medium text-gray-600 mt-1">새 계정을 만드세요</p>
              </div>

              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-4">
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
