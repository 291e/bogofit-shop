"use client";

import { useState, Suspense } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "@/graphql/mutations";
import { useSearchParams } from "next/navigation";
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
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { User, Building2, Store } from "lucide-react";
import { useI18n } from "@/providers/I18nProvider";

function LoginPage() {
  // const rout   er = useRouter();
  const searchParams = useSearchParams();
  const { login: authLogin } = useAuth();
  const { t } = useI18n();

  // 일반 로그인 상태
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  // 사업자 로그인 상태
  const [businessUserId, setBusinessUserId] = useState("");
  const [businessPassword, setBusinessPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("user");

  // 비밀번호 초기화 모달 상태
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  // 브랜드 입점 문의는 /brand 페이지에서 진행

  const [loginMutation] = useMutation(LOGIN);
  // 일반 사용자 로그인 (Prisma 우선 + GraphQL 보조)
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!userId || !password) {
      setError(t("auth.errors.requireIdPassword"));
      setLoading(false);
      return;
    }

    try {
      console.log("[Login] 1단계: Prisma 직접 로그인 시도");

      // 1단계: Prisma 직접 로그인 시도
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          password,
          isBusiness: false,
        }),
      });

      if (loginResponse.ok) {
        console.log("[Login] Prisma 로그인 성공");
        const loginData = await loginResponse.json();
        authLogin(loginData.user);

        const redirectPath = searchParams.get("redirect") || "/";
        window.location.href = redirectPath;
        return;
      }

      // 422 상태 코드 (GraphQL 로그인 필요) 또는 다른 실패 시 GraphQL 보조 로그인 시도
      const errorData = await loginResponse.json();
      const shouldTryGraphQL =
        loginResponse.status === 422 ||
        errorData.error === "GraphQL_LOGIN_REQUIRED";

      console.log("[Login] 2단계: GraphQL 보조 로그인 시도", {
        status: loginResponse.status,
        shouldTryGraphQL,
        error: errorData.error,
      });

      try {
        const { data } = await loginMutation({
          variables: { userId, password },
        });

        if (data?.login?.success && data.login.token) {
          console.log("[Login] GraphQL 로그인 성공, JWT 쿠키 설정 중");

          // GraphQL 성공 시 자체 API로 JWT 쿠키 설정
          const jwtResponse = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              graphqlToken: data.login.token,
              password: "graphql", // GraphQL 성공 플래그
              isBusiness: false,
            }),
          });

          if (jwtResponse.ok) {
            const jwtData = await jwtResponse.json();
            authLogin(jwtData.user);

            const redirectPath = searchParams.get("redirect") || "/";
            window.location.href = redirectPath;
            return;
          }
        }

        // GraphQL도 실패한 경우
        if (shouldTryGraphQL) {
          // GraphQL 응답에서 메시지 확인
          const graphqlMessage = data?.login?.message;
          if (graphqlMessage) {
            setError(graphqlMessage);
          } else {
            setError(`login error: ${errorData.error}`);
          }
        } else {
          setError(errorData.message || errorData.error || t("auth.errors.loginFailed"));
        }
      } catch (graphqlError) {
        console.error("[Login] GraphQL 로그인 실패:", graphqlError);
        if (shouldTryGraphQL) {
          setError(t("auth.errors.graphqlLoginError"));
        } else {
          setError(errorData.message || errorData.error || t("auth.errors.loginFailed"));
        }
      }
    } catch (err: unknown) {
      console.error("로그인 오류:", err);
      setError(t("auth.errors.loginProcessing"));
    } finally {
      setLoading(false);
    }
  };

  // 사업자 로그인
  const handleBusinessLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!businessUserId || !businessPassword) {
      setError(t("auth.errors.requireIdPassword"));
      setLoading(false);
      return;
    }

    try {
      console.log("[사업자 로그인] 자체 API 호출 시작");

      // 자체 로그인 API로 직접 로그인 (isBusiness: true 플래그 포함)
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: businessUserId,
          password: businessPassword,
          isBusiness: true, // 사업자 로그인 플래그
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        const shouldTryGraphQL =
          loginResponse.status === 422 ||
          errorData.error === "GraphQL_LOGIN_REQUIRED";

        if (shouldTryGraphQL) {
          console.log("[사업자 로그인] GraphQL 보조 로그인 시도");

          try {
            const { data } = await loginMutation({
              variables: { userId: businessUserId, password: businessPassword },
            });

            if (data?.login?.success && data.login.token) {
              console.log("[사업자 로그인] GraphQL 성공, JWT 쿠키 설정 중");

              const jwtResponse = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  graphqlToken: data.login.token,
                  password: "graphql",
                  isBusiness: true,
                }),
              });

              if (jwtResponse.ok) {
                const jwtData = await jwtResponse.json();

                if (!jwtData.user?.isBusiness) {
                  setError(t("auth.errors.notBusinessAccount"));
                  setLoading(false);
                  return;
                }

                await authLogin(jwtData.user);
                console.log("[사업자 로그인] 성공!");

                // 강제 페이지 이동 (실제 환경에서 안전한 방식)
                window.location.href = "/business";
                return;
              }
            }

            // GraphQL 응답에서 메시지 확인
            const graphqlMessage = data?.login?.message;
            if (graphqlMessage) {
              setError(graphqlMessage);
            } else {
              setError(t("auth.errors.graphqlBusinessLoginFailed"));
            }
          } catch (graphqlError) {
            console.error("[사업자 로그인] GraphQL 실패:", graphqlError);
            setError(t("auth.errors.graphqlBusinessLoginError"));
          }
        } else {
          setError(errorData.message || errorData.error || t("auth.errors.businessLoginFailed"));
        }

        setLoading(false);
        return;
      }

      const loginData = await loginResponse.json();

      // 사업자 계정인지 확인
      if (!loginData.user?.isBusiness) {
        setError(t("auth.errors.notBusinessAccount"));
        setLoading(false);
        return;
      }

      // 인증 상태 업데이트
      if (loginData.user) {
        await authLogin(loginData.user);
      }

      console.log("[사업자 로그인] 성공!");

      // 강제 페이지 이동 (실제 환경에서 안전한 방식)
      window.location.href = "/business";
    } catch (err: unknown) {
      console.error("사업자 로그인 오류:", err);
  setError(t("auth.errors.businessLoginProcessing"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("header.login")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("auth.login.subtitle")}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("auth.tabs.user")}
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t("auth.tabs.business")}
            </TabsTrigger>
          </TabsList>

          {/* 일반 사용자 로그인 */}
          <TabsContent value="user">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-center">{t("auth.user.title")}</CardTitle>
                <CardDescription className="text-center">{t("auth.user.desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="userId" className="text-sm font-medium">{t("auth.labels.userId")}</label>
                    <Input
                      id="userId"
                      name="userId"
                      type="text"
                      required
                      placeholder={t("auth.placeholders.userId")}
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">{t("auth.labels.password")}</label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder={t("auth.placeholders.password")}
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
                      {loading ? t("auth.cta.loggingIn") : t("auth.cta.login")}
                    </Button>

                    <div className="flex items-center justify-start">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm text-blue-600 hover:text-blue-500"
                        onClick={() => setResetPasswordOpen(true)}
                      >
                        {t("auth.cta.forgotPassword")}
                      </Button>
                    </div>

                    <Link href="/register" className="w-full block">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                      >
                        {t("auth.cta.signup")}
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
                <CardTitle className="text-center">{t("auth.business.title")}</CardTitle>
                <CardDescription className="text-center">{t("auth.business.desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBusinessLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="businessUserId" className="text-sm font-medium">{t("auth.labels.businessUserId")}</label>
                    <Input
                      id="businessUserId"
                      name="businessUserId"
                      type="text"
                      required
                      placeholder={t("auth.placeholders.businessUserId")}
                      value={businessUserId}
                      onChange={(e) => setBusinessUserId(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="businessPassword" className="text-sm font-medium">{t("auth.labels.password")}</label>
                    <Input
                      id="businessPassword"
                      name="businessPassword"
                      type="password"
                      required
                      placeholder={t("auth.placeholders.password")}
                      value={businessPassword}
                      onChange={(e) => setBusinessPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>

                  {error && activeTab === "business" && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t("auth.cta.businessLoggingIn") : t("auth.cta.businessLogin")}
                  </Button>
                </form>

                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">{t("auth.business.info.title")}</p>
                      <ul className="mt-1 space-y-1">
                        <li>• {t("auth.business.info.bullets.1")}</li>
                        <li>• {t("auth.business.info.bullets.2")}</li>
                        <li>• {t("auth.business.info.bullets.3")}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 브랜드 입점 문의 링크 */}
                <div className="mt-4">
                  <Link href="/brand" className="w-full block">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-red-500 border-red-500 text-white hover:bg-red-50 hover:border-red-700"
                    >
                      <Store className="h-4 w-4 mr-2" />
                      {t("brands.partner.cta")}
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 mt-2 text-center">{t("brands.partner.noteShort")}</p>
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

  {/* 브랜드 입점 문의는 /brand 페이지에서 진행합니다. */}
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
