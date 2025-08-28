# 🔧 환경 변수 설정 가이드

## 📋 개요

BogoFit Shop 프로젝트에서 사용되는 환경 변수들의 설정 방법을 안내합니다.

## 📁 환경 파일 구조

```
bogofit-shop/
├── .env.example          # 환경 변수 템플릿
├── .env.local           # 로컬 개발용 (Git ignore됨)
└── .env.production      # 프로덕션용 (서버 배포 시)
```

## 🔑 필수 환경 변수

### 1. 데이터베이스

```bash
# PostgreSQL 데이터베이스 연결 URL
DATABASE_URL="postgresql://username:password@localhost:5432/bogofit_shop"
```

### 2. 인증 및 소셜 로그인

```bash
# NextAuth.js 설정
NEXTAUTH_URL="http://localhost:3000"                    # 개발환경
# NEXTAUTH_URL="https://your-domain.com"               # 프로덕션환경

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"               # 별칭

# Kakao OAuth
NEXT_PUBLIC_KAKAO_CLIENT_ID="your-kakao-app-key"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
KAKAO_CLIENT_ID="your-kakao-app-key"                   # 별칭
```

### 3. 결제 시스템 (Toss Payments)

```bash
# Toss Payments API 키
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_your_client_key"   # 클라이언트 키 (Public)
TOSS_SECRET_KEY="test_sk_your_secret_key"               # 서버 키 (Private)
```

### 4. SMS 알림 (ALIGO)

```bash
# ALIGO SMS API (기존 알림용)
ALIGO_API_KEY="your_aligo_api_key"
ALIGO_USER_ID="your_aligo_user_id"

# SMS 발신 설정
SMS_DEFAULT_SENDER="025114560"                          # 기본 발신번호
BUSINESS_NOTIFICATION_PHONE="01012345678"              # 비즈니스 알림 수신번호
SMS_TEST_MODE="true"                                   # 개발: true, 프로덕션: false
```

### 5. Twilio SMS 인증 (Verify API)

```bash
# Twilio Verify API (문자인증 전용)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"   # Twilio 계정 SID (AC로 시작)
TWILIO_AUTH_TOKEN="your_twilio_auth_token"              # Twilio 인증 토큰
TWILIO_VERIFY_SERVICE_SID="VAxxxxxxxxxxxxxxxxxxxxxx"    # Verify 서비스 SID (VA로 시작)
TWILIO_PHONE_NUMBER="+1234567890"                       # 일반 SMS용 (선택사항)
TWILIO_TEST_MODE="true"                                 # 개발: true, 프로덕션: false

# 주의사항:
# - Account SID는 AC로 시작하는 34자리 문자열
# - Verify Service SID는 VA로 시작하는 34자리 문자열
# - 테스트 모드에서는 실제 SMS 발송 없음
```

### 6. Cafe24 연동

```bash
# Cafe24 쇼핑몰 연동
CAFE24_MALL_ID="your-mall-id"
CAFE24_CLIENT_ID="your-cafe24-client-id"
CAFE24_CLIENT_SECRET="your-cafe24-client-secret"

# Public 환경 변수 (클라이언트 접근 가능)
NEXT_PUBLIC_CAFE24_MALL_ID="your-mall-id"
NEXT_PUBLIC_CAFE24_CLIENT_ID="your-cafe24-client-id"
```

### 7. AWS S3 (이미지 저장소)

```bash
# AWS 설정
AWS_REGION="ap-northeast-2"                           # 서울 리전
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="bogofit-images"
```

### 8. 기타 설정

```bash
# 애플리케이션 기본 URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"           # 개발환경
# NEXT_PUBLIC_BASE_URL="https://shop.bogofit.kr"      # 프로덕션환경

# GraphQL API URL
GRAPHQL_API_URL="https://your-graphql-endpoint.com"
```

## 📋 환경별 설정 예시

### 개발 환경 (.env.local)

```bash
# 데이터베이스
DATABASE_URL="postgresql://postgres:password@localhost:5432/bogofit_shop"

# 기본 설정
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# 결제 (테스트 키)
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
TOSS_SECRET_KEY="test_sk_..."

# SMS (테스트 모드)
SMS_TEST_MODE="true"
SMS_DEFAULT_SENDER="025114560"
BUSINESS_NOTIFICATION_PHONE="01012345678"

# GraphQL
GRAPHQL_API_URL="https://dev-api.example.com"
```

### 프로덕션 환경 (.env.production)

```bash
# 데이터베이스
DATABASE_URL="postgresql://user:pass@prod-server:5432/bogofit_shop"

# 기본 설정
NEXT_PUBLIC_BASE_URL="https://shop.bogofit.kr"
NEXTAUTH_URL="https://shop.bogofit.kr"

# 결제 (실제 키)
NEXT_PUBLIC_TOSS_CLIENT_KEY="live_ck_..."
TOSS_SECRET_KEY="live_sk_..."

# SMS (실제 발송)
SMS_TEST_MODE="false"

# GraphQL
GRAPHQL_API_URL="https://api.bogofit.kr"
```

## 🔒 보안 주의사항

### Git 설정

```bash
# .gitignore에 추가
.env*
!.env.example
```

### 중요 사항

- ❌ **절대 Git에 커밋하지 마세요**: 모든 `.env` 파일을 `.gitignore`에 추가
- ✅ **환경별 분리**: 개발/프로덕션 환경에서 다른 값 사용
- ✅ **테스트 키 사용**: 개발 환경에서는 테스트용 API 키 사용
- ✅ **PUBLIC 변수 구분**: `NEXT_PUBLIC_` 접두사가 있는 변수만 클라이언트에서 접근 가능

## 🛠️ 설정 방법

### 1. 환경 파일 생성

```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local
```

### 2. 값 설정

`.env.local` 파일을 열어서 각 서비스별로 발급받은 키를 입력합니다.

### 3. 서버 재시작

```bash
# 환경 변수 변경 후 서버 재시작 필요
npm run dev
```

## 📚 트러블슈팅

### 자주 발생하는 문제

1. **"Environment variable not found"**
   - `.env.local` 파일이 프로젝트 루트에 있는지 확인
   - 변수 이름에 오타가 없는지 확인
   - 서버 재시작

2. **클라이언트에서 환경 변수 접근 안됨**
   - `NEXT_PUBLIC_` 접두사 추가 필요
   - 서버 재시작 후 확인

3. **데이터베이스 연결 실패**
   - `DATABASE_URL` 형식 확인
   - 데이터베이스 서버 실행 상태 확인

---

**💡 보안을 위해 환경 변수는 절대 Git에 커밋하지 마세요!**
