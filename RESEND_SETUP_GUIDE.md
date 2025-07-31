# 🚀 Resend 도메인 인증 완료 후 설정 가이드

## 📋 **필수 환경변수 설정**

`.env.local` 파일에 다음 변수들을 추가/수정하세요:

```bash
# 1. 도메인 인증 완료 여부
RESEND_DOMAIN_VERIFIED=true

# 2. FROM 이메일 주소 (인증된 도메인 사용)
RESEND_FROM_EMAIL=no-reply@bogofit.com  # 예: no-reply@bogofit.com

# 3. 발신자 이름 (선택사항)
RESEND_FROM_NAME="BogoFit Shop"
```

## 🎯 **도메인별 예시**

### 예시 1: bogofit.com 도메인을 인증한 경우

```bash
RESEND_DOMAIN_VERIFIED=true
RESEND_FROM_EMAIL=no-reply@bogofit.com
RESEND_FROM_NAME="BogoFit Shop"
```

### 예시 2: yourcompany.co.kr 도메인을 인증한 경우

```bash
RESEND_DOMAIN_VERIFIED=true
RESEND_FROM_EMAIL=support@yourcompany.co.kr
RESEND_FROM_NAME="YourCompany"
```

## ⚡ **설정 후 동작 방식**

### ✅ **도메인 인증 완료 시** (`RESEND_DOMAIN_VERIFIED=true`)

- `yko0321@naver.com` → `yko0321@naver.com` ✅ **원래 이메일로 전송**
- 제목: "🎉 BogoFit Shop - 회원가입 인증을 완료해 주세요"

### ❌ **도메인 미인증 시** (`RESEND_DOMAIN_VERIFIED=false` 또는 미설정)

- `yko0321@naver.com` → `metabank3d@gmail.com` (임시 우회)
- 제목: "🎉 BogoFit Shop - 회원가입 인증 (원래 수신자: yko0321@naver.com)"

## 🔍 **로그로 확인하기**

서버 로그에서 다음과 같은 메시지를 확인할 수 있습니다:

```bash
# 도메인 인증됨
✅ 도메인 인증됨: yko0321@naver.com로 직접 전송

# 도메인 미인증
⚠️ 도메인 미인증: yko0321@naver.com → metabank3d@gmail.com로 전송
💡 도메인 인증 완료 후 RESEND_DOMAIN_VERIFIED=true 설정하세요
```

## ⚙️ **서버 재시작 필요**

환경변수 변경 후 개발 서버를 재시작하세요:

```bash
npm run dev
# 또는
pm2 restart bogofit
```

## 🚨 **주의사항**

1. **FROM 이메일 주소**는 반드시 **인증된 도메인**을 사용해야 합니다
2. `onboarding@resend.dev`는 테스트 전용이므로 프로덕션에서는 사용하지 마세요
3. 도메인 인증이 완료되지 않은 상태에서 `RESEND_DOMAIN_VERIFIED=true`로 설정하면 이메일 전송이 실패할 수 있습니다

## 🔧 **문제 해결**

### Q: 여전히 metabank3d@gmail.com으로만 전송됩니다

A: 다음을 확인하세요:

1. `.env.local`에 `RESEND_DOMAIN_VERIFIED=true` 설정했는지
2. 서버를 재시작했는지
3. Resend 대시보드에서 도메인 상태가 "Verified"인지

### Q: 이메일 전송이 실패합니다 (403 에러)

A: FROM 이메일 주소를 확인하세요:

1. `RESEND_FROM_EMAIL`이 인증된 도메인을 사용하는지
2. 도메인 DNS 설정이 완료되었는지
