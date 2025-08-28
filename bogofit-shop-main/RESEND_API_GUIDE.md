# 📧 Resend API 사용 가이드

BogoFit Shop 프로젝트에서 Resend API를 사용한 이메일 전송 시스템 가이드입니다.

## 📋 목차

1. [설치 및 설정](#설치-및-설정)
2. [환경변수 설정](#환경변수-설정)
3. [API 엔드포인트](#api-엔드포인트)
4. [사용 예시](#사용-예시)
5. [이메일 템플릿](#이메일-템플릿)
6. [개발 및 테스트](#개발-및-테스트)
7. [보안 고려사항](#보안-고려사항)
8. [문제 해결](#문제-해결)

## 🚀 설치 및 설정

### 1. 필요한 라이브러리 설치

```bash
# Resend API와 React Email 설치
npm install resend react-email @react-email/components @react-email/render --legacy-peer-deps
```

### 2. Resend 계정 설정

1. [Resend 웹사이트](https://resend.com)에서 계정 생성
2. API 키 발급 (Dashboard > API Keys)
3. 도메인 인증 설정 (Dashboard > Domains)

## ⚙️ 환경변수 설정

`.env.local` 파일에 다음 환경변수를 추가하세요:

```env
# Resend API 설정
RESEND_API_KEY="re_your_resend_api_key_here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
RESEND_FROM_NAME="BogoFit Shop"

# 앱 URL 설정
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
BASE_URL="http://localhost:3000"
```

### 환경변수 설명

- `RESEND_API_KEY`: Resend에서 발급받은 API 키
- `RESEND_FROM_EMAIL`: 발신자 이메일 주소 (인증된 도메인)
- `RESEND_FROM_NAME`: 발신자 이름
- `NEXT_PUBLIC_BASE_URL`: 클라이언트에서 사용할 앱 URL
- `BASE_URL`: 서버에서 사용할 앱 URL

## 🔌 API 엔드포인트

### 1. 회원가입 인증 이메일 전송

**Endpoint:** `POST /api/auth/send-verification-email`

**Request Body:**

```json
{
  "email": "user@example.com",
  "userName": "홍길동"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

### 2. 이메일 인증 확인

**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "ABC123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**URL 인증:** `GET /api/auth/verify-email?email=user@example.com&code=ABC123`

### 3. 비밀번호 초기화 이메일 전송

**Endpoint:** `POST /api/auth/send-password-reset`

**Request Body:**

```json
{
  "userId": "user123",
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

### 4. 환영 이메일 전송

**Endpoint:** `POST /api/auth/send-welcome-email`

**Request Body:**

```json
{
  "email": "user@example.com",
  "userName": "홍길동"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Welcome email sent successfully"
}
```

## 💻 사용 예시

### React 컴포넌트에서 사용

```typescript
// 회원가입 인증 이메일 전송
const sendVerificationEmail = async (email: string, userName: string) => {
  try {
    const response = await fetch("/api/auth/send-verification-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, userName }),
    });

    const result = await response.json();

    if (result.success) {
      alert("인증 이메일이 전송되었습니다.");
    } else {
      alert("이메일 전송에 실패했습니다: " + result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("오류가 발생했습니다.");
  }
};

// 비밀번호 초기화 이메일 전송
const sendPasswordReset = async (userId: string, email: string) => {
  try {
    const response = await fetch("/api/auth/send-password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, email }),
    });

    const result = await response.json();

    if (result.success) {
      alert("비밀번호 초기화 이메일이 전송되었습니다.");
    } else {
      alert("이메일 전송에 실패했습니다: " + result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("오류가 발생했습니다.");
  }
};
```

### 기존 ResetPasswordModal 통합

```typescript
// src/components/auth/ResetPasswordModal.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  setSuccess(false);

  if (!userId || !email) {
    setError("아이디와 이메일을 모두 입력하세요.");
    setLoading(false);
    return;
  }

  try {
    // Resend API 사용
    const response = await fetch("/api/auth/send-password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, email }),
    });

    const result = await response.json();

    if (result.success) {
      setSuccess(true);
      setError("");
      setTimeout(() => {
        handleClose();
      }, 3000);
    } else {
      setError(result.message || "비밀번호 초기화에 실패했습니다.");
    }
  } catch (err: unknown) {
    setError(
      (err as Error).message || "비밀번호 초기화 중 오류가 발생했습니다."
    );
  } finally {
    setLoading(false);
  }
};
```

## 🎨 이메일 템플릿

### 템플릿 아키텍처

이메일 템플릿은 **React Email**과 **shadcn/ui** 디자인 시스템을 기반으로 구현되었습니다:

- **React 컴포넌트 기반**: 재사용 가능하고 유지보수하기 쉬운 구조
- **TypeScript 완전 지원**: 타입 안전성과 개발자 경험 향상
- **반응형 디자인**: 모든 이메일 클라이언트에서 최적화된 표시
- **한국어 완전 지원**: 모든 텍스트와 레이아웃이 한국어에 최적화

### 템플릿 종류

1. **회원가입 인증 이메일** (`VerificationEmail`)
   - 이중 인증 방식 (버튼 + 코드)
   - 24시간 만료 안내
   - 보안 가이드라인
   - 브랜드 일관성

2. **비밀번호 초기화 이메일** (`PasswordResetEmail`)
   - 임시 비밀번호 테이블 형식 제공
   - 단계별 비밀번호 변경 가이드
   - 보안 경고 및 주의사항
   - 즉시 변경 권장

3. **환영 이메일** (`WelcomeEmail`)
   - 개인화된 환영 메시지
   - 서비스 기능 소개
   - 첫 구매 할인 쿠폰
   - 인기 카테고리 바로가기

### 이메일 템플릿 개발

#### 1. React Email 미리보기 실행

```bash
# 이메일 템플릿 개발 서버 실행
npm run email:dev

# 브라우저에서 http://localhost:3000으로 접속하여 미리보기
```

#### 2. 새로운 템플릿 생성

```typescript
// src/components/emails/NewTemplate.tsx
import { Html, Head, Body, Container, Section, Text, Button } from "@react-email/components";
import { BaseEmail } from "./BaseEmail";

export interface NewTemplateProps {
  userName: string;
  customData: string;
}

export const NewTemplate = ({ userName, customData }: NewTemplateProps) => {
  return (
    <BaseEmail title="새 템플릿" previewText={`${userName}님을 위한 새로운 알림`}>
      <Section>
        <Text>안녕하세요, {userName}님!</Text>
        <Text>{customData}</Text>
        <Button href="https://bogofit.com">
          액션 버튼
        </Button>
      </Section>
    </BaseEmail>
  );
};
```

#### 3. 템플릿을 렌더링 함수에 추가

```typescript
// src/lib/email-templates.ts
import { NewTemplate, NewTemplateProps } from "@/components/emails/NewTemplate";

export const generateNewTemplate = async (
  data: NewTemplateProps
): Promise<string> => {
  return await render(NewTemplate(data));
};
```

### 스타일링 가이드

#### 1. 일관된 디자인 시스템

```typescript
// 기본 색상 팔레트
const colors = {
  primary: "#667eea",
  secondary: "#764ba2",
  success: "#059669",
  warning: "#f59e0b",
  error: "#dc2626",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    600: "#6b7280",
    900: "#1f2937",
  },
};

// 타이포그래피
const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  sizes: {
    heading: "28px",
    subheading: "20px",
    body: "16px",
    small: "14px",
  },
};
```

#### 2. 반응형 레이아웃

```typescript
// 컨테이너 기본 스타일
const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

// 섹션 패딩
const sectionStyle = {
  padding: "32px",
};
```

## 🧪 개발 및 테스트

### 로컬 테스트

1. **환경변수 설정 확인**

```bash
# .env.local 파일 확인
cat .env.local | grep RESEND
```

2. **API 테스트**

```bash
# curl을 사용한 API 테스트
curl -X POST http://localhost:3000/api/auth/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","userName":"테스트사용자"}'
```

3. **이메일 전송 로그 확인**

```bash
# Next.js 개발 서버 콘솔에서 확인
npm run dev
```

### 테스트 이메일 주소

개발 중에는 다음과 같은 테스트 이메일을 사용하세요:

- `test@example.com`
- `dev@bogofit.com`
- 본인의 개발용 이메일

## 🔒 보안 고려사항

### 1. API 키 보안

- `.env.local` 파일을 `.gitignore`에 추가
- 프로덕션에서는 환경변수로 설정
- API 키 정기적 로테이션

### 2. 이메일 주소 검증

```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error("Invalid email format");
}
```

### 3. 인증 코드 관리

- 인증 코드는 6자리 영숫자 조합
- 24시간 후 자동 만료
- 한 번 사용하면 즉시 삭제
- 무차별 대입 공격 방지 (rate limiting)

### 4. 개인정보 보호

- 이메일 내용에 민감한 정보 포함 금지
- 로그에 개인정보 출력 금지
- GDPR 및 개인정보보호법 준수

## 🔧 문제 해결

### 1. 이메일이 전송되지 않는 경우

**확인사항:**

- [ ] Resend API 키가 올바른지
- [ ] 발신 이메일 도메인이 인증되었는지
- [ ] 환경변수가 올바르게 설정되었는지
- [ ] Resend 계정 한도를 초과하지 않았는지

**해결방법:**

```javascript
// 디버그 로그 추가
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Set" : "Not set");
console.log("RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL);
```

### 2. 이메일이 스팸함으로 가는 경우

**해결방법:**

- SPF, DKIM, DMARC 레코드 설정
- 발신자 명성 관리
- 이메일 내용 스팸 필터 최적화

### 3. 템플릿이 깨지는 경우

**확인사항:**

- [ ] HTML 문법 오류
- [ ] CSS 인라인 스타일 사용
- [ ] 이메일 클라이언트 호환성

## 📞 지원 및 문의

- **Resend 공식 문서**: https://resend.com/docs
- **기술 문의**: dev@bogofit.com
- **긴급 문의**: 개발팀 슬랙 채널

## 📚 추가 자료

- [Resend React Email 컴포넌트](https://react.email)
- [이메일 HTML 모범 사례](https://www.campaignmonitor.com/css/)
- [이메일 접근성 가이드](https://www.emailonacid.com/blog/article/email-development/email-accessibility-in-html-email)

---

> 📝 **참고**: 이 가이드는 개발 초기 버전입니다. 프로젝트 진행에 따라 업데이트될 예정입니다.

> ⚠️ **주의**: 프로덕션 배포 전에 모든 보안 고려사항을 검토하고 테스트해주세요.
