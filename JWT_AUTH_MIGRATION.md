# JWT 쿠키 기반 인증 시스템 마이그레이션 가이드

## 📋 개요

기존 localStorage 기반 인증 시스템을 JWT httpOnly 쿠키 기반으로 완전히 마이그레이션했습니다.

## 🚀 주요 변경사항

### 1. 인증 방식 변경

- **기존**: localStorage에 토큰 저장 + GraphQL 헤더 인증
- **새로운**: JWT httpOnly 쿠키 + 자동 전송

### 2. 로그인 프로세스 변경

```typescript
// 기존 방식
1. GraphQL LOGIN 뮤테이션 → localStorage에 토큰 저장

// 새로운 방식
1. GraphQL LOGIN 뮤테이션 → 사용자 검증 및 DB 저장
2. /api/auth/login → JWT 생성 → httpOnly 쿠키 설정
3. AuthProvider → 사용자 정보 캐시
```

### 3. 로그아웃 프로세스 개선

```typescript
// 기존 방식
localStorage.removeItem("token");
client.clearStore();

// 새로운 방식
await fetch("/api/auth/logout"); // 서버에서 쿠키 삭제
queryClient.clear(); // React Query 캐시 완전 삭제
client.clearStore(); // Apollo 캐시 완전 삭제
window.location.href = "/"; // 페이지 강제 새로고침
```

## 🛠️ 새로 생성된 파일들

### 1. JWT 유틸리티

- `src/lib/jwt.ts` - JWT 토큰 생성, 검증, 쿠키 관리

### 2. 인증 API 라우트

- `src/app/api/auth/login/route.ts` - 로그인 처리
- `src/app/api/auth/logout/route.ts` - 로그아웃 처리
- `src/app/api/auth/me/route.ts` - 현재 사용자 정보 조회

### 3. 미들웨어

- `middleware.ts` - 쿠키 기반 자동 인증 검증 및 경로 보호

### 4. 새로운 훅

- `src/hooks/useAuth.ts` - 새로운 인증 훅

## 🗑️ 삭제된 파일들

- `src/store/auth.store.ts` - Zustand 인증 스토어 (더 이상 불필요)
- `src/hooks/useUser.ts` - 기존 사용자 훅 (useAuth로 대체)

## 🔧 업데이트된 파일들

### 1. 인증 관련

- `src/providers/AuthProvider.tsx` - 쿠키 기반으로 완전 리팩토링
- `src/lib/apolloClient.ts` - 쿠키 자동 전송으로 헤더 설정 제거
- `src/lib/auth.ts` - JWT 기반으로 업데이트 (호환성 유지)
- `src/lib/businessAuth.ts` - JWT 통합 지원 추가

### 2. 로그인 및 인증 페이지

- `src/app/(Auth)/login/page.tsx` - 2단계 로그인 프로세스 구현
- `src/app/(Auth)/auth/callback/google/page.tsx` - Google OAuth 콜백 업데이트
- `src/app/(Auth)/auth/callback/kakao/page.tsx` - Kakao OAuth 콜백 업데이트
- `src/app/(Auth)/address/page.tsx` - 주소 관리 페이지 업데이트

### 3. 컴포넌트들

- `src/components/layout/mainLayout.tsx` - Zustand 의존성 제거
- `src/components/layout/Header.tsx` - async 로그아웃 처리
- `src/components/layout/header/UserMenu.tsx` - 타입 업데이트
- `src/components/myPage/LogoutButton.tsx` - 새로운 인증 시스템 적용
- `src/components/product/PurchaseButton.tsx` - useUser → useAuth 변경
- `src/components/payment/Checkout.tsx` - useUser → useAuth 변경
- `src/app/(Payment)/order/OrderPageContent.tsx` - useUser → useAuth 변경

### 4. 훅들

- `src/hooks/useAuth.ts` - 새로운 인증 훅 (useUser 대체)
- `src/hooks/useCart.ts` - useUser → useAuth 변경
- `src/hooks/usePaymentHistory.ts` - useUser → useAuth 변경
- `src/hooks/useOrderActions.ts` - useUser → useAuth 변경

## 🔑 필수 환경 변수

### `.env.local` 파일에 추가 필요:

```bash
# JWT Secret (32자 이상의 강력한 랜덤 문자열로 변경 필수!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-this-should-be-at-least-32-characters-long"
```

### JWT_SECRET 생성 방법:

```bash
# Node.js에서 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 온라인 생성기 사용
# https://generate-secret.vercel.app/32
```

## 📦 새로 설치된 패키지

```bash
npm install jose bcryptjs --legacy-peer-deps
```

- `jose` - JWT 토큰 생성 및 검증
- `bcryptjs` - 비밀번호 해싱 (이미 설치되어 있었지만 타입 정의 업데이트)

## 🔄 마이그레이션 체크리스트

### ✅ 완료된 작업

- [x] JWT 유틸리티 구현
- [x] 인증 API 라우트 생성
- [x] Next.js 미들웨어 구현
- [x] AuthProvider 리팩토링
- [x] 로그인 페이지 업데이트
- [x] Apollo Client 최적화
- [x] 기존 인증 파일 정리

### ✅ 추가 완료된 작업

- [x] 기존 컴포넌트들의 인증 방식 업데이트
- [x] 로그아웃 버튼 컴포넌트 업데이트
- [x] OAuth 콜백 페이지 업데이트
- [x] 모든 훅과 컴포넌트에서 useUser → useAuth 마이그레이션

## 🐛 해결된 문제점들

### 1. 브라우저 재시작 시 자동 로그아웃

- **문제**: localStorage는 브라우저 재시작해도 유지됨
- **해결**: JWT 쿠키 24시간 만료 설정

### 2. 로그아웃 후 이전 계정 흔적

- **문제**: 캐시 초기화 불완전
- **해결**: 모든 캐시 완전 삭제 + 페이지 강제 새로고침

### 3. 토큰 관리 분산

- **문제**: localStorage + Zustand + Apollo 헤더에서 각각 관리
- **해결**: httpOnly 쿠키 단일 관리

## 🔒 보안 개선사항

1. **XSS 방지**: httpOnly 쿠키로 JavaScript에서 토큰 접근 차단
2. **CSRF 방지**: sameSite='lax' 설정
3. **HTTPS 강제**: 프로덕션에서 secure 쿠키
4. **토큰 만료**: 24시간 자동 만료

## 🚦 테스트 시나리오

### 1. 기본 인증 플로우

1. 로그인 → JWT 쿠키 설정 확인
2. 페이지 새로고침 → 인증 상태 유지 확인
3. 로그아웃 → 완전한 상태 초기화 확인

### 2. 사업자 인증

1. 사업자 로그인 → 권한 확인
2. 일반 사용자로 재로그인 → 이전 사업자 정보 완전 제거 확인

### 3. 경로 보호

1. 미인증 상태에서 보호된 경로 접근 → 로그인 페이지로 리다이렉트
2. 일반 사용자가 사업자 경로 접근 → 메인 페이지로 리다이렉트

## 📞 문제 해결

### 일반적인 문제들

#### 1. "JWT_SECRET 환경변수가 없습니다" 오류

```bash
# .env.local에 JWT_SECRET 추가
JWT_SECRET="your-32-character-or-longer-secret-key"
```

#### 2. 로그인 후에도 인증되지 않음

- 브라우저 쿠키 설정 확인
- 개발자 도구에서 `auth-token` 쿠키 존재 확인

#### 3. CORS 오류

- `credentials: 'include'` 설정 확인
- API 라우트에서 쿠키 처리 확인

## 🔄 추가 작업 필요

1. **컴포넌트 업데이트**: 기존 `useUser` → `useAuth` 변경
2. **로그아웃 버튼**: `async` 함수 처리
3. **에러 처리**: 401/403 에러에 대한 일관된 처리
4. **테스트 코드**: 새로운 인증 시스템에 대한 테스트 작성

---

## 📝 사용 예시

### 새로운 인증 훅 사용법

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout(); // 이제 async 함수
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>안녕하세요, {user.name}님!</p>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <p>로그인이 필요합니다.</p>
      )}
    </div>
  );
}
```

### API에서 인증 확인

```typescript
import { requireAuth } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const [user, errorResponse] = await requireAuth(request);

  if (errorResponse) {
    return errorResponse; // 401 에러 자동 반환
  }

  // 인증된 사용자 로직
  return NextResponse.json({ user });
}
```
