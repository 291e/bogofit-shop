"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import SmsVerification from "@/components/auth/SmsVerification";
import { useSmsVerification } from "@/hooks/useSmsVerification";
import {
  UserPlus,
  LogIn,
  KeyRound,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Info,
} from "lucide-react";

export default function SmsExamplesPage() {
  const [currentScenario, setCurrentScenario] = useState<string>("signup");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [userName, setUserName] = useState("김보고");

  // 시나리오별 완료 상태
  const [scenarioComplete, setScenarioComplete] = useState<{
    [key: string]: boolean;
  }>({});

  // 컴포넌트 방식 시나리오 완료 핸들러
  const handleComponentVerified = (phoneNumber: string, scenario: string) => {
    console.log(`✅ ${scenario} 컴포넌트 인증 완료:`, phoneNumber);
    setScenarioComplete({ ...scenarioComplete, [scenario]: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Smartphone className="w-8 h-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              SMS 인증 실제 사용 예시
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            회원가입, 로그인, 비밀번호 재설정 등 실제 서비스에서 사용하는 SMS
            인증 과정을 체험해보세요.
          </p>
        </div>

        {/* 사용법 안내 */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>사용법:</strong> 각 시나리오를 선택하고 전화번호를
            입력해보세요. 각 SMS 인증 컴포넌트에서 국가를 선택할 수 있습니다.
            테스트 모드에서는 실제 SMS가 발송되지 않으며, 브라우저 콘솔(F12)에서
            인증 코드를 확인할 수 있습니다.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="scenarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              실제 사용 시나리오
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              컴포넌트 vs 훅 비교
            </TabsTrigger>
          </TabsList>

          {/* 실제 사용 시나리오 */}
          <TabsContent value="scenarios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Button
                variant={currentScenario === "signup" ? "default" : "outline"}
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setCurrentScenario("signup")}
              >
                <UserPlus className="w-6 h-6" />
                <div>
                  <div className="font-semibold">회원가입</div>
                  <div className="text-xs text-muted-foreground">
                    새 계정 생성
                  </div>
                </div>
                {scenarioComplete.signup && (
                  <Badge variant="secondary" className="text-xs">
                    완료 ✓
                  </Badge>
                )}
              </Button>

              <Button
                variant={currentScenario === "login" ? "default" : "outline"}
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setCurrentScenario("login")}
              >
                <LogIn className="w-6 h-6" />
                <div>
                  <div className="font-semibold">로그인</div>
                  <div className="text-xs text-muted-foreground">
                    기존 계정 접속
                  </div>
                </div>
                {scenarioComplete.login && (
                  <Badge variant="secondary" className="text-xs">
                    완료 ✓
                  </Badge>
                )}
              </Button>

              <Button
                variant={currentScenario === "reset" ? "default" : "outline"}
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setCurrentScenario("reset")}
              >
                <KeyRound className="w-6 h-6" />
                <div>
                  <div className="font-semibold">비밀번호 재설정</div>
                  <div className="text-xs text-muted-foreground">계정 복구</div>
                </div>
                {scenarioComplete.reset && (
                  <Badge variant="secondary" className="text-xs">
                    완료 ✓
                  </Badge>
                )}
              </Button>
            </div>

            {/* 시나리오별 콘텐츠 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentScenario === "signup" && (
                    <>
                      <UserPlus className="w-5 h-5" />
                      회원가입 SMS 인증
                    </>
                  )}
                  {currentScenario === "login" && (
                    <>
                      <LogIn className="w-5 h-5" />
                      로그인 SMS 인증
                    </>
                  )}
                  {currentScenario === "reset" && (
                    <>
                      <KeyRound className="w-5 h-5" />
                      비밀번호 재설정 SMS 인증
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {currentScenario === "signup" &&
                    "새 계정을 만들기 위해 전화번호를 인증해주세요."}
                  {currentScenario === "login" &&
                    "보안을 위해 SMS 인증을 진행해주세요."}
                  {currentScenario === "reset" &&
                    "계정 복구를 위해 등록된 전화번호로 인증해주세요."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 회원가입 시나리오 */}
                {currentScenario === "signup" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">이메일</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="user@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">이름</Label>
                        <Input
                          id="name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="김보고"
                        />
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">전화번호 인증</h4>
                      <SmsVerification
                        purpose="signup"
                        onVerified={(phone) =>
                          handleComponentVerified(phone, "signup")
                        }
                        showPhoneInput={true}
                        autoFocus={false}
                      />
                    </div>
                    {scenarioComplete.signup && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          🎉 회원가입이 완료되었습니다! 환영합니다, {userName}
                          님!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* 로그인 시나리오 */}
                {currentScenario === "login" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">계정</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="등록된 이메일 주소"
                      />
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">2단계 인증</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        계정 보안을 위해 등록된 전화번호로 인증 코드를
                        발송합니다.
                      </p>
                      <SmsVerification
                        purpose="login"
                        onVerified={(phone) =>
                          handleComponentVerified(phone, "login")
                        }
                        showPhoneInput={true}
                        autoFocus={false}
                      />
                    </div>
                    {scenarioComplete.login && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          🎉 로그인 성공! 대시보드로 이동합니다...
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* 비밀번호 재설정 시나리오 */}
                {currentScenario === "reset" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">계정 찾기</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="가입시 사용한 이메일"
                      />
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">본인 확인</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        계정 복구를 위해 등록된 전화번호로 본인 확인을
                        진행합니다.
                      </p>
                      <SmsVerification
                        purpose="password-reset"
                        onVerified={(phone) =>
                          handleComponentVerified(phone, "reset")
                        }
                        showPhoneInput={true}
                        autoFocus={false}
                      />
                    </div>
                    {scenarioComplete.reset && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          🎉 본인 확인 완료! 새 비밀번호를 설정해주세요.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 컴포넌트 vs 훅 비교 */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 컴포넌트 방식 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📦 컴포넌트 방식
                    <Badge variant="secondary">쉬움</Badge>
                  </CardTitle>
                  <CardDescription>
                    미리 만들어진 UI 컴포넌트를 바로 사용
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <h4 className="font-semibold text-green-700">✅ 장점</h4>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• 빠른 개발 (복붙하면 끝)</li>
                      <li>• 일관된 디자인</li>
                      <li>• 복잡한 로직 숨겨짐</li>
                      <li>• 초보자도 쉽게 사용</li>
                    </ul>
                  </div>

                  <div className="text-sm space-y-2">
                    <h4 className="font-semibold text-amber-700">⚠️ 단점</h4>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• 커스터마이징 제한적</li>
                      <li>• 디자인 변경 어려움</li>
                      <li>• 세부 제어 불가</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-3 rounded text-xs">
                    <strong>사용 예시:</strong>
                    <pre className="mt-1 text-gray-700">
                      {`<SmsVerification 
  purpose="signup"
  onVerified={(phone) => 
    console.log('완료!', phone)
  }
/>`}
                    </pre>
                  </div>

                  <SmsVerification
                    purpose="component-example"
                    onVerified={(phone) =>
                      alert(`컴포넌트 방식 인증 완료: ${phone}`)
                    }
                    autoFocus={false}
                  />
                </CardContent>
              </Card>

              {/* 훅 방식 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔧 훅 방식
                    <Badge variant="outline">고급</Badge>
                  </CardTitle>
                  <CardDescription>
                    개별 함수들을 직접 호출해서 커스텀 UI 제작
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <h4 className="font-semibold text-green-700">✅ 장점</h4>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• 완전한 커스터마이징</li>
                      <li>• 복잡한 UI/UX 가능</li>
                      <li>• 세밀한 제어</li>
                      <li>• 다른 로직과 연동 쉬움</li>
                    </ul>
                  </div>

                  <div className="text-sm space-y-2">
                    <h4 className="font-semibold text-amber-700">⚠️ 단점</h4>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• 개발 시간 더 오래 걸림</li>
                      <li>• 코드 복잡해짐</li>
                      <li>• 에러 처리 직접 해야 함</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-3 rounded text-xs">
                    <strong>사용 예시:</strong>
                    <pre className="mt-1 text-gray-700">
                      {`const sms = useSmsVerification({
  purpose: 'custom',
  onVerified: (phone) => {
    // 커스텀 로직 실행
  }
});

// 개별 함수 호출
await sms.sendCode(phone);
await sms.verifyCode(phone, code);`}
                    </pre>
                  </div>

                  <CustomHookExample />
                </CardContent>
              </Card>
            </div>

            {/* 언제 뭘 사용할지 가이드 */}
            <Card>
              <CardHeader>
                <CardTitle>🤔 언제 뭘 사용할까요?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-700">
                      📦 컴포넌트 방식 추천
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• 빠른 프로토타입 개발</li>
                      <li>• 표준적인 인증 플로우</li>
                      <li>• 디자인 커스터마이징 불필요</li>
                      <li>• 개발 리소스 부족</li>
                      <li>• 초보 개발자</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-700">
                      🔧 훅 방식 추천
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• 브랜드에 맞는 디자인</li>
                      <li>• 복잡한 사용자 플로우</li>
                      <li>• 다른 기능과 통합</li>
                      <li>• 세밀한 제어 필요</li>
                      <li>• 경험 있는 개발자</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 훅 사용 예시 컴포넌트
function CustomHookExample() {
  const [phone, setPhone] = useState("010-1234-5678");
  const [code, setCode] = useState("");

  const sms = useSmsVerification({
    purpose: "hook-example",
    defaultCountry: "+82", // 기본값으로 한국 설정
    onVerified: (phoneNumber) => {
      alert(`훅 방식 인증 완료: ${phoneNumber}`);
    },
    onError: (error) => {
      console.error("인증 오류:", error);
    },
  });

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="custom-phone" className="text-xs">
          전화번호
        </Label>
        <Input
          id="custom-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-1234-5678"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-code" className="text-xs">
          인증 코드
        </Label>
        <Input
          id="custom-code"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="123456"
          maxLength={6}
          className="text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          onClick={() => sms.sendCode(phone)}
          disabled={sms.state.isLoading || sms.state.countdown > 0}
          className="text-xs"
        >
          {sms.state.countdown > 0 ? `${sms.state.countdown}초` : "코드 발송"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => sms.verifyCode(phone, code)}
          disabled={sms.state.isLoading || code.length !== 6}
          className="text-xs"
        >
          인증 확인
        </Button>
      </div>

      {sms.state.error && (
        <p className="text-xs text-red-600">❌ {sms.state.error}</p>
      )}
      {sms.state.success && (
        <p className="text-xs text-green-600">✅ {sms.state.success}</p>
      )}
    </div>
  );
}
