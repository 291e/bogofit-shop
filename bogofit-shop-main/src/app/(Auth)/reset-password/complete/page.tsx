"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@apollo/client";
import { RESET_PASSWORD } from "@/graphql/mutations";

function ResetPasswordCompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const temporaryPassword = "0000";

  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  const [resetPasswordMutation] = useMutation(RESET_PASSWORD);

  useEffect(() => {
    if (!userId || !email) {
      setError("잘못된 접근입니다. userId와 email이 필요합니다.");
      return;
    }

    // 자동으로 비밀번호 초기화 실행
    handleResetPassword();
  }, [userId, email]);

  const handleResetPassword = async () => {
    if (!userId || !email) return;

    setIsProcessing(true);
    setError("");

    try {
      // GraphQL 뮤테이션으로 비밀번호를 0000으로 초기화
      const { data } = await resetPasswordMutation({
        variables: {
          userId,
          email,
        },
      });

      if (data?.resetPassword?.success) {
        setIsCompleted(true);
      } else {
        setError(
          data?.resetPassword?.message || "비밀번호 초기화에 실패했습니다."
        );
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("서버 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            비밀번호 초기화
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isProcessing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">비밀번호를 초기화하고 있습니다...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-red-800 font-medium">오류 발생</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-green-800 font-medium">초기화 완료</h3>
                    <p className="text-green-700 text-sm mt-1">
                      비밀번호가 성공적으로 초기화되었습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 로그인 정보 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-800 font-medium mb-3">로그인 정보</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-blue-700 mb-1">
                      아이디
                    </label>
                    <div className="bg-white border border-blue-200 rounded px-3 py-2">
                      <span className="text-gray-900">{userId}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-blue-700 mb-1">
                      임시 비밀번호
                    </label>
                    <div className="bg-white border border-blue-200 rounded px-3 py-2 flex items-center justify-between">
                      <span className="text-gray-900 font-mono text-lg font-bold">
                        {showPassword ? temporaryPassword : "••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 보안 안내 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-yellow-800 font-medium mb-2">
                  🛡️ 보안 안내
                </h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• 로그인 후 즉시 비밀번호를 변경해주세요</li>
                  <li>• 임시 비밀번호는 타인과 공유하지 마세요</li>
                  <li>• 강력한 비밀번호로 설정하시기 바랍니다</li>
                </ul>
              </div>

              <Button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                size="lg"
              >
                로그인하러 가기
              </Button>
            </div>
          )}

          {!isProcessing && !isCompleted && error && (
            <Button
              onClick={handleResetPassword}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              size="lg"
            >
              다시 시도
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResetPasswordCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                비밀번호 초기화
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-600">페이지를 로딩하고 있습니다...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordCompleteContent />
    </Suspense>
  );
}

export default ResetPasswordCompletePage;
