"use client";

import { useState, Suspense } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "@/graphql/mutations";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SocialLogin from "@/components/auth/SocialLogin";
import ResetPasswordModal from "@/components/auth/ResetPasswordModal";
import BrandInquiryModal from "@/components/auth/BrandInquiryModal";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { User, Building2, Store } from "lucide-react";

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: authLogin } = useAuth();

  // 일반 로그인 상태
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  // 사업자 로그인 상태
  const [businessUserId, setBusinessUserId] = useState("");
  const [businessPassword, setBusinessPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("user");

  // 비밀번호 초기화 모달 상태
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  // 브랜드 입점 문의 모달 상태
  const [brandInquiryOpen, setBrandInquiryOpen] = useState(false);

  const [loginMutation] = useMutation(LOGIN);

  // 일반 사용자 로그인
  const handleUserLogin = async (e: React.FormEvent) => {
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
        authLogin(data.login.token, data.login.user);

        // redirect 파라미터가 있으면 해당 경로로, 없으면 메인 페이지로
        const redirectPath = searchParams.get("redirect") || "/";
        router.replace(redirectPath);

        // 강력한 새로고침 수행
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        setError(data?.login?.message || "로그인에 실패했습니다.");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 사업자 로그인
  const handleBusinessLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!businessUserId || !businessPassword || !deviceId) {
      setError("아이디, 비밀번호, 디바이스 ID를 모두 입력하세요.");
      setLoading(false);
      return;
    }

    try {
      console.log("🏢 사업자 로그인 시도:", { businessUserId, deviceId });

      const { data } = await loginMutation({
        variables: {
          userId: businessUserId,
          password: businessPassword,
          isBusiness: true,
          deviceId: deviceId,
        },
      });

      console.log("🏢 사업자 로그인 응답:", data);

      if (data?.login?.success && data.login.token) {
        console.log("✅ 사업자 로그인 성공");

        // 사업자 로그인 성공 시 사용자 정보에 isBusiness: true 설정
        const businessUser = {
          ...data.login.user,
          isBusiness: true,
        };

        console.log("👤 사업자 사용자 정보:", businessUser);

        authLogin(data.login.token, businessUser);

        console.log("🔄 /business로 리다이렉트 시도");
        // 사업자는 무조건 비즈니스 대시보드로 리다이렉트
        router.replace("/business");

        // 강력한 새로고침 수행
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        console.error("❌ 사업자 로그인 실패:", data);
        setError(data?.login?.message || "사업자 로그인에 실패했습니다.");
      }
    } catch (err: unknown) {
      console.error("❌ 사업자 로그인 에러:", err);
      setError(
        (err as Error).message || "사업자 로그인 중 오류가 발생했습니다."
      );
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
          <p className="mt-2 text-center text-sm text-gray-600">
            계정 유형을 선택하여 로그인하세요
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              일반 사용자
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              사업자
            </TabsTrigger>
          </TabsList>

          {/* 일반 사용자 로그인 */}
          <TabsContent value="user">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-center">
                  일반 사용자 로그인
                </CardTitle>
                <CardDescription className="text-center">
                  일반 고객용 계정으로 로그인합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="userId" className="text-sm font-medium">
                      아이디
                    </label>
                    <Input
                      id="userId"
                      name="userId"
                      type="text"
                      required
                      placeholder="아이디를 입력하세요"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      비밀번호
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>

                  {error && activeTab === "user" && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "로그인 중..." : "로그인"}
                    </Button>

                    <div className="flex items-center justify-start">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm text-blue-600 hover:text-blue-500"
                        onClick={() => setResetPasswordOpen(true)}
                      >
                        비밀번호를 잊으셨나요?
                      </Button>
                    </div>

                    <Link href="/register" className="w-full block">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                      >
                        회원가입
                      </Button>
                    </Link>
                  </div>
                </form>

                {/* 소셜 로그인은 일반 사용자만 */}
                <div className="mt-6">
                  <SocialLogin className="mt-4" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 사업자 로그인 */}
          <TabsContent value="business">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-center">사업자 로그인</CardTitle>
                <CardDescription className="text-center">
                  입점 브랜드/매장 관리자 계정으로 로그인합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBusinessLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="businessUserId"
                      className="text-sm font-medium"
                    >
                      사업자 아이디
                    </label>
                    <Input
                      id="businessUserId"
                      name="businessUserId"
                      type="text"
                      required
                      placeholder="사업자 아이디를 입력하세요"
                      value={businessUserId}
                      onChange={(e) => setBusinessUserId(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="businessPassword"
                      className="text-sm font-medium"
                    >
                      비밀번호
                    </label>
                    <Input
                      id="businessPassword"
                      name="businessPassword"
                      type="password"
                      required
                      placeholder="비밀번호를 입력하세요"
                      value={businessPassword}
                      onChange={(e) => setBusinessPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="deviceId" className="text-sm font-medium">
                      디바이스 ID
                    </label>
                    <Input
                      id="deviceId"
                      name="deviceId"
                      type="text"
                      required
                      placeholder="디바이스 ID를 입력하세요"
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      autoComplete="off"
                    />
                    <p className="text-xs text-gray-500">
                      관리자로부터 제공받은 디바이스 ID를 입력하세요
                    </p>
                  </div>

                  {error && activeTab === "business" && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "로그인 중..." : "사업자 로그인"}
                  </Button>
                </form>

                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">사업자 계정 안내</p>
                      <ul className="mt-1 space-y-1">
                        <li>• 입점 브랜드/매장 관리자만 사용 가능</li>
                        <li>• 디바이스 ID는 보안을 위해 필수입니다</li>
                        <li>• 계정 문의: bogofit@naver.com</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 브랜드 입점 문의 버튼 */}
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-red-500 border-red-500 text-white hover:bg-red-50 hover:border-red-700"
                    onClick={() => setBrandInquiryOpen(true)}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    브랜드 입점 신청하기
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    새로운 브랜드의 BogoFit 입점을 원하시나요?
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 비밀번호 초기화 모달 */}
        <ResetPasswordModal
          open={resetPasswordOpen}
          onOpenChange={setResetPasswordOpen}
        />

        {/* 브랜드 입점 문의 모달 */}
        <BrandInquiryModal
          open={brandInquiryOpen}
          onOpenChange={setBrandInquiryOpen}
        />
      </div>
    </div>
  );
}

function LoginPageWrapper() {
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
      <LoginPage />
    </Suspense>
  );
}

export default LoginPageWrapper;
