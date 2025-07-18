# 🛍️ Cafe24 OAuth 연동 설정 가이드

## 📋 개요

이 가이드는 BOGOFIT Shop과 Cafe24 쇼핑몰을 OAuth 2.0을 통해 연동하는 방법을 설명합니다.

## 🔧 1단계: Cafe24 Developers Admin 설정

### 1.1 앱 등록

1. [Cafe24 Developers Admin](https://developers.cafe24.com)에 로그인
2. **새 앱 만들기** 클릭
3. 앱 정보 입력:
   - **앱 이름**: BOGOFIT Shop Integration
   - **설명**: AI Virtual Fitting과 상품 연동
   - **앱 타입**: Private App (개인 쇼핑몰용)

### 1.2 OAuth 설정

#### 리디렉션 URI 등록

```
http://localhost:3000/api/cafe24/oauth/callback        # 개발환경
https://your-domain.com/api/cafe24/oauth/callback      # 프로덕션환경
```

#### 권한 스코프 설정

다음 스코프들을 체크하세요:

- ✅ `mall.read_application` - 앱 정보 읽기
- ✅ `mall.write_application` - 앱 정보 쓰기
- ✅ `mall.read_product` - 상품 정보 읽기
- ✅ `mall.write_product` - 상품 정보 쓰기 (필요시)
- ✅ `mall.read_category` - 카테고리 정보 읽기
- ✅ `mall.read_order` - 주문 정보 읽기 (필요시)
- ✅ `mall.read_customer` - 고객 정보 읽기 (필요시)

### 1.3 운영자 권한확인 URI (선택사항)

#### 언제 필요한가?

- 멀티 운영자 환경에서 세밀한 권한 제어가 필요한 경우
- 특정 기능을 특정 운영자만 사용하도록 제한하고 싶은 경우

#### 설정 방법 (필요시)

```
https://shop.bogofit.kr/cafe24/admin-auth    # 운영자 권한 확인 페이지
```

#### 구현 예시 (필요시)

```typescript
// src/app/cafe24/admin-auth/page.tsx
export default function AdminAuthPage() {
  return (
    <div>
      <h1>운영자 권한 확인</h1>
      <p>이 앱의 관리자 권한을 확인합니다.</p>
      {/* 권한 확인 로직 구현 */}
    </div>
  );
}
```

**💡 참고**: BOGOFIT Shop의 경우 기본 OAuth 스코프만으로도 충분하므로 당장은 설정하지 않아도 됩니다.

### 1.4 Client ID/Secret 확인

앱 등록 후 다음 정보를 확인하세요:

- **Client ID**: `abcd1234efgh5678...`
- **Client Secret**: `xyz789abc123def456...`
- **Mall ID**: 쇼핑몰 아이디 (예: `yourmall`)

## 🌐 2단계: 환경 변수 설정

### 2.1 .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 추가하세요:

```bash
# Cafe24 OAuth 설정
CAFE24_MALL_ID="your-mall-id"
CAFE24_CLIENT_ID="your-client-id"
CAFE24_CLIENT_SECRET="your-client-secret"

# Public 환경 변수 (클라이언트에서 접근 가능)
NEXT_PUBLIC_CAFE24_MALL_ID="your-mall-id"
NEXT_PUBLIC_CAFE24_CLIENT_ID="your-client-id"

# Base URL 설정
NEXT_PUBLIC_BASE_URL="http://localhost:3000"        # 개발환경
# NEXT_PUBLIC_BASE_URL="https://your-domain.com"    # 프로덕션환경
```

### 2.2 값 입력 예시

```bash
# 실제 값 예시
CAFE24_MALL_ID="bogofit"
CAFE24_CLIENT_ID="7eBNEqSfkd7I8hoAbcDeFgHiJkLmNoPqRsTuVwXyZ"
CAFE24_CLIENT_SECRET="abcd1234efgh5678ijkl90mnopqr1234567890ab"

NEXT_PUBLIC_CAFE24_MALL_ID="bogofit"
NEXT_PUBLIC_CAFE24_CLIENT_ID="7eBNEqSfkd7I8hoAbcDeFgHiJkLmNoPqRsTuVwXyZ"

NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 🚀 3단계: OAuth 인증 테스트

### 3.1 인증 시작

1. 개발 서버 실행:

   ```bash
   npm run dev
   ```

2. 브라우저에서 OAuth 인증 시작:

   ```
   http://localhost:3000/api/cafe24/oauth/authorize
   ```

3. Cafe24 로그인 페이지에서 **쇼핑몰 관리자 계정**으로 로그인

4. 권한 승인 후 성공 페이지로 리디렉션 확인

### 3.2 API 테스트

성공 페이지에서 자동으로 API 테스트가 실행됩니다:

- ✅ Access Token 확인
- ✅ 상품 목록 조회
- ✅ 상품 상세 정보 조회

## 🔍 4단계: 문제 해결

### 4.1 일반적인 오류

#### `invalid_client` 오류

- **원인**: Client ID 또는 Client Secret이 잘못됨
- **해결**: Cafe24 Developers Admin에서 값 재확인

#### `invalid_scope` 오류

- **원인**: 요청한 권한이 앱에 등록되지 않음
- **해결**: Developers Admin > 권한 스코프 설정 확인

#### `access_denied` 오류

- **원인**: 일반 사용자 계정으로 로그인함
- **해결**: 쇼핑몰 관리자 계정으로 로그인

#### `invalid_request` 오류

- **원인**: 리디렉션 URI가 등록되지 않음
- **해결**: Developers Admin에서 정확한 콜백 URL 등록

### 4.2 디버깅

개발자 도구 콘솔에서 다음 로그를 확인하세요:

```javascript
// OAuth 인증 과정
=== Cafe24 OAuth 인증 시작 ===
=== Cafe24 OAuth 콜백 처리 ===
✅ Cafe24 OAuth 인증 성공

// API 테스트
=== Cafe24 API 연결 테스트 ===
✅ Access Token 확인 완료
🔄 상품 목록 가져오기 테스트...
✅ 상품 목록 조회 성공: 5개 상품
```

## 📊 5단계: API 활용

### 5.1 사용 가능한 API

```typescript
import { cafe24OAuth } from "@/lib/cafe24";

// 상품 목록 조회
const products = await cafe24OAuth.getProducts({
  limit: 10,
  offset: 0,
});

// 상품 상세 정보 조회
const product = await cafe24OAuth.getProduct(productNo);

// 직접 API 호출
const customData = await cafe24OAuth.apiCall("/admin/products");
```

### 5.2 토큰 관리

- **Access Token**: 2시간 후 자동 만료
- **Refresh Token**: 14일 후 만료
- **자동 갱신**: API 호출 시 토큰이 만료되면 자동으로 갱신

## 🔒 6단계: 보안 고려사항

### 6.1 토큰 저장

- Access Token과 Refresh Token은 **HttpOnly 쿠키**에 안전하게 저장
- 클라이언트 JavaScript에서 직접 접근 불가
- HTTPS 환경에서만 쿠키 전송 (프로덕션)

### 6.2 CSRF 방지

- OAuth state 파라미터를 사용하여 CSRF 공격 방지
- 세션 스토리지에 임시 저장 후 검증

### 6.3 환경 변수 보안

- `.env.local` 파일을 `.gitignore`에 추가
- 프로덕션에서는 서버 환경 변수 사용
- Client Secret은 절대 클라이언트에 노출하지 않음

## 📞 문의사항

문제가 지속되면 다음을 확인하세요:

1. **환경 변수 확인**:

   ```bash
   http://localhost:3000/api/test-config
   ```

2. **API 테스트**:

   ```bash
   http://localhost:3000/api/cafe24/test
   ```

3. **Cafe24 API 문서**: https://developers.cafe24.com/docs/api/

---

## 🎉 설정 완료!

모든 단계를 완료하면 Cafe24와 BOGOFIT Shop이 성공적으로 연동됩니다. 이제 AI Virtual Fitting 기능에서 Cafe24 상품 데이터를 활용할 수 있습니다! 🚀

## 🚨 문제 해결: "요청한 권한이 잘못되었습니다" 오류

### 디버깅 체크리스트

1. **설정 진단 확인**

   ```
   https://shop.bogofit.kr/api/cafe24/debug
   ```

   위 URL에서 환경 변수와 OAuth 설정 상태를 확인하세요.

2. **환경 변수 확인 (.env.local)**

   ```bash
   CAFE24_MALL_ID=yourmall                          # 쇼핑몰 ID
   CAFE24_CLIENT_ID=abcd1234efgh5678...              # APP Client ID
   CAFE24_CLIENT_SECRET=xyz789abc123def456...        # APP Client Secret
   NEXT_PUBLIC_CAFE24_MALL_ID=yourmall
   NEXT_PUBLIC_CAFE24_CLIENT_ID=abcd1234efgh5678...
   NEXT_PUBLIC_BASE_URL=https://shop.bogofit.kr
   ```

3. **Cafe24 APP 권한 스코프 확인**

   ```
   ✅ mall.read_application - 앱 정보 읽기
   ✅ mall.write_application - 앱 정보 쓰기
   ✅ mall.read_product - 상품 정보 읽기
   ✅ mall.write_product - 상품 정보 쓰기
   ✅ mall.read_category - 카테고리 정보 읽기
   ```

4. **Redirect URI 확인**

   ```
   https://shop.bogofit.kr/api/cafe24/oauth/callback
   ```

5. **Client ID/Secret 일치 확인**
   - Cafe24 Developers Admin의 값과 환경 변수가 정확히 일치하는지

### 일반적인 해결 방법

- 환경 변수 재설정 후 서버 재시작
- Cafe24 APP에서 권한 스코프 다시 체크
- Client ID/Secret 복사-붙여넣기 시 공백 제거
- 쇼핑몰 관리자 권한으로 로그인 확인

---
