# 📱 Twilio SMS 인증 서비스 가이드 (Verify API 기반)

## 📋 개요

BogoFit Shop에 **Twilio Verify API**를 연동한 문자인증 서비스가 구현되었습니다. 기존 ALIGO SMS 알림 시스템과 별도로 동작하며, 사용자 회원가입, 로그인, 비밀번호 재설정 등에서 활용할 수 있습니다.

Twilio의 **Verify Service**를 사용하여 업계 표준의 안전하고 신뢰할 수 있는 문자 인증을 제공합니다.

## 🚀 주요 기능

### ✅ 구현된 기능

- **문자 인증 코드 발송**: Twilio Verify 서비스 사용
- **인증 코드 확인**: 6자리 숫자 코드 검증
- **재발송 제한**: 60초 쿨다운 적용
- **시도 횟수 제한**: 최대 3회 시도 후 차단
- **자동 만료**: 5분 후 코드 자동 만료
- **테스트 모드**: 개발환경에서 실제 SMS 발송 없이 테스트
- **폴백 시스템**: Twilio 실패 시 로컬 저장소로 폴백
- **전화번호 정규화**: 한국 전화번호 자동 변환 (+82 형식)

### 🛠️ 기술 스택

- **Twilio Verify API**: 인증 코드 생성 및 확인
- **In-Memory Store**: 인증 데이터 임시 저장 (Redis 확장 가능)
- **Next.js API Routes**: 백엔드 API 엔드포인트
- **React 컴포넌트**: 재사용 가능한 UI 컴포넌트
- **Custom Hook**: 인증 로직 훅

## 📁 파일 구조

```
src/
├── lib/
│   ├── twilio.ts                    # Twilio 클라이언트 라이브러리
│   └── verification-store.ts        # 인증 코드 저장소
├── app/api/verification/
│   ├── send/route.ts                # 인증 코드 발송 API
│   └── verify/route.ts              # 인증 코드 확인 API
├── components/auth/
│   └── SmsVerification.tsx          # 문자인증 컴포넌트
├── hooks/
│   └── useSmsVerification.ts        # 문자인증 훅
└── app/test-sms-verification/
    └── page.tsx                     # 테스트 페이지
```

## 🔧 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# Twilio API (문자인증 전용)
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_VERIFY_SERVICE_SID="your_verify_service_sid"
TWILIO_PHONE_NUMBER="+1234567890"     # 일반 SMS용 (선택사항)
TWILIO_TEST_MODE="true"               # 개발: true, 프로덕션: false
```

### Twilio 설정 방법 (Verify API)

1. **Twilio 계정 생성**
   - [Twilio Console](https://console.twilio.com)에서 계정 생성
   - 무료 계정으로도 테스트 가능 ($15.50 크레딧 제공)
   - Account SID와 Auth Token 확인

2. **Verify Service 생성**
   - Twilio Console → **Verify** → **Services**
   - **Create new Verify Service** 클릭
   - Service Name 입력 (예: "BogoFit SMS Verification")
   - Code Length: 6자리 (기본값)
   - **Create** 클릭 후 **Service SID** 복사

3. **환경 설정**
   - Verify Service는 Twilio 번호를 자동으로 사용하므로 별도 번호 구매 불필요
   - 테스트 모드에서는 실제 SMS 발송 없이 콘솔에서 코드 확인
   - 프로덕션 모드에서만 실제 SMS 요금 발생

4. **전화번호 검증** (프로덕션용)
   - 한국 번호 발송을 위해 Twilio에 비즈니스 정보 등록 필요
   - 개발/테스트 시에는 검증된 번호만 사용 가능

## 📚 API 사용법

### 1. 인증 코드 발송

```javascript
// POST /api/verification/send
const response = await fetch("/api/verification/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phoneNumber: "010-1234-5678",
    purpose: "signup", // 용도: signup, login, password-reset 등
    channel: "sms", // sms 또는 call
  }),
});

const result = await response.json();
```

### 2. 인증 코드 확인

```javascript
// POST /api/verification/verify
const response = await fetch("/api/verification/verify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phoneNumber: "010-1234-5678",
    code: "123456",
    purpose: "signup",
  }),
});

const result = await response.json();
```

### 3. 인증 상태 확인

```javascript
// GET /api/verification/verify?phoneNumber=+821012345678&purpose=signup
const response = await fetch(
  `/api/verification/verify?phoneNumber=+821012345678&purpose=signup`
);

const result = await response.json();
console.log(result.data.verified); // true/false
```

## 🎯 컴포넌트 사용법

### SmsVerification 컴포넌트

```jsx
import SmsVerification from "@/components/auth/SmsVerification";

function SignupPage() {
  const handleVerified = (phoneNumber) => {
    console.log("인증 완료:", phoneNumber);
    // 다음 단계로 진행
  };

  const handleError = (error) => {
    console.error("인증 오류:", error);
  };

  return (
    <SmsVerification
      phoneNumber="010-1234-5678" // 초기값 (선택사항)
      purpose="signup" // 인증 목적
      onVerified={handleVerified} // 인증 완료 콜백
      onError={handleError} // 오류 콜백
      autoFocus={true} // 자동 포커스
      showPhoneInput={true} // 전화번호 입력란 표시
    />
  );
}
```

### useSmsVerification 훅

```jsx
import { useSmsVerification } from "@/hooks/useSmsVerification";

function CustomSignup() {
  const smsVerification = useSmsVerification({
    purpose: "signup",
    onVerified: (phoneNumber) => {
      console.log("인증 완료:", phoneNumber);
    },
    onError: (error) => {
      console.error("오류:", error);
    },
  });

  const handleSendCode = async () => {
    const success = await smsVerification.sendCode("010-1234-5678");
    if (success) {
      console.log("코드 발송 성공");
    }
  };

  const handleVerifyCode = async () => {
    const success = await smsVerification.verifyCode("010-1234-5678", "123456");
    if (success) {
      console.log("인증 성공");
    }
  };

  return (
    <div>
      <button
        onClick={handleSendCode}
        disabled={smsVerification.state.isLoading}
      >
        코드 발송
      </button>
      <input onChange={(e) => setCode(e.target.value)} />
      <button
        onClick={handleVerifyCode}
        disabled={smsVerification.state.isLoading}
      >
        인증하기
      </button>

      {smsVerification.state.error && (
        <p>오류: {smsVerification.state.error}</p>
      )}

      {smsVerification.state.isVerified && <p>✅ 인증 완료!</p>}
    </div>
  );
}
```

## 🧪 테스트 방법

### 1. 실제 사용 예시 페이지

개발 서버 실행 후 다음 URL로 접속:

```
http://localhost:3000/sms-examples
```

**실제 사용 시나리오를 체험할 수 있습니다:**

- 🔥 **회원가입 SMS 인증**: 새 계정 생성 시
- 🔑 **로그인 SMS 인증**: 2단계 인증
- 🔓 **비밀번호 재설정**: 계정 복구 시

### 2. 개발자 테스트 페이지

기술적인 테스트가 필요할 때:

```
http://localhost:3000/test-sms-verification
```

### 2. 테스트 모드

환경변수 `TWILIO_TEST_MODE="true"`일 때:

- 실제 SMS 발송되지 않음
- 생성된 인증 코드가 브라우저 콘솔에 출력됨
- 모든 기능을 안전하게 테스트 가능

### 3. 프로덕션 모드

환경변수 `TWILIO_TEST_MODE="false"`일 때:

- 실제 Twilio API 호출
- 진짜 SMS 발송 (요금 발생)
- Twilio 실패 시 로컬 저장소로 폴백

## 📊 응답 형식

### 성공 응답

```json
{
  "success": true,
  "message": "인증 코드가 발송되었습니다.",
  "data": {
    "to": "+821012345678",
    "channel": "sms",
    "status": "pending",
    "testMode": true,
    "testCode": "123456" // 테스트 모드에서만
  }
}
```

### 실패 응답

```json
{
  "success": false,
  "error": "유효하지 않은 전화번호 형식입니다.",
  "details": [
    {
      "field": "phoneNumber",
      "message": "유효한 전화번호를 입력해주세요."
    }
  ]
}
```

## 🔒 보안 고려사항

### 1. 요청 제한

- **재발송 쿨다운**: 60초
- **최대 시도 횟수**: 3회
- **코드 유효시간**: 5분
- **자동 정리**: 만료된 데이터 자동 삭제

### 2. 전화번호 검증

- 한국 전화번호 형식 검증
- 국제 형식 자동 변환 (+82)
- 특수문자 제거 및 정규화

### 3. 환경변수 보안

- Twilio 시크릿 키는 서버 전용
- `.env.local` 파일은 Git에서 제외
- 프로덕션에서는 환경별 키 사용

## 🚨 문제 해결

### 자주 발생하는 오류

1. **"Twilio 환경변수가 설정되지 않았습니다"**
   - `.env.local` 파일 확인
   - 환경변수 이름 오타 확인
   - 서버 재시작

2. **"유효하지 않은 전화번호"**
   - 한국 전화번호 형식 확인 (010-XXXX-XXXX)
   - 특수문자 제거하여 재시도

3. **"인증 시도 횟수 초과"**
   - 5분 대기 후 새 코드 요청
   - 또는 다른 전화번호로 시도

4. **"코드가 만료되었습니다"**
   - 새 인증 코드 요청
   - 5분 내에 입력 완료

### 로그 확인

```bash
# 서버 콘솔에서 확인
[Twilio] 인증 코드 발송 성공: VA123456789
[VerificationService] 코드 생성: +821012345678 -> 123456
[VerificationAPI] 테스트 모드: 실제 SMS 발송 없이 가상 처리
```

## 🔄 확장 가능성

### 1. Redis 연동

```javascript
// Redis 클라이언트를 사용하여 확장
const redisStore = new RedisVerificationStore(redisClient);
const verificationService = new VerificationCodeService(redisStore);
```

### 2. 다른 용도 추가

```javascript
// 새로운 인증 목적 추가
await sendCode("010-1234-5678", "password-reset");
await sendCode("010-1234-5678", "two-factor-auth");
```

### 3. 국제 전화번호 지원

```javascript
// 다른 국가 번호 지원 확장
const normalizePhoneNumber = (phone, country = "KR") => {
  // 국가별 정규화 로직
};
```

## 📈 모니터링

### 중요 지표

- 인증 성공률
- 평균 인증 시간
- Twilio API 호출 횟수
- 폴백 사용 빈도

### 로그 분석

```bash
# 성공적인 인증
grep "인증 성공" logs/app.log

# 실패한 인증 시도
grep "인증 실패" logs/app.log

# Twilio API 오류
grep "Twilio 발송 실패" logs/app.log
```

---

## 🎯 다음 단계

1. **Redis 연동**: 프로덕션 환경에서 Redis 저장소 사용
2. **국제화**: 다국어 메시지 지원
3. **통계 대시보드**: 인증 성공률 모니터링
4. **음성 인증**: call 채널 완전 지원
5. **웹훅 연동**: Twilio 웹훅으로 상태 업데이트

**🎉 Twilio SMS 인증 서비스가 성공적으로 구축되었습니다!**

테스트 페이지(`/test-sms-verification`)에서 모든 기능을 확인해보세요.
