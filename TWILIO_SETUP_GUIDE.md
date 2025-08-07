# 🚀 Twilio SMS 인증 설정 가이드

## 📋 개요

이 가이드는 BogoFit Shop에 **Twilio Verify API**를 설정하는 방법을 단계별로 설명합니다.

## 🔧 1단계: Twilio 계정 설정

### 1.1 계정 생성

1. [Twilio Console](https://console.twilio.com)에서 계정 생성
2. 전화번호 인증 완료
3. 무료 크레딧 $15.50 확인

### 1.2 계정 정보 확인

**Dashboard** → **Account Info**에서 다음 정보 확인:

- **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (AC로 시작하는 34자리)
- **Auth Token**: 보안을 위해 숨겨져 있으니 `👁️` 버튼 클릭하여 확인

## 🛠️ 2단계: Verify Service 생성

### 2.1 Verify Service 설정

1. Twilio Console → **Verify** → **Services** 메뉴
2. **Create new Verify Service** 클릭
3. 다음 정보 입력:
   - **Service Name**: `BogoFit SMS Verification` (또는 원하는 이름)
   - **Code Length**: `6` (기본값)
   - **Lookup**: Enabled (권장)
   - **PSD2**: Disabled (한국에서는 불필요)

### 2.2 Service SID 확인

생성 완료 후 **Service SID** 확인: `VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (VA로 시작하는 34자리)

## 📱 3단계: 환경변수 설정

### 3.1 .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용 추가:

```bash
# Twilio Verify API 설정
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_VERIFY_SERVICE_SID="VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_TEST_MODE="true"

# 선택사항 (일반 SMS 발송용)
TWILIO_PHONE_NUMBER="+1234567890"
```

### 3.2 환경변수 값 설정

- `TWILIO_ACCOUNT_SID`: 1단계에서 확인한 Account SID
- `TWILIO_AUTH_TOKEN`: 1단계에서 확인한 Auth Token
- `TWILIO_VERIFY_SERVICE_SID`: 2단계에서 확인한 Service SID
- `TWILIO_TEST_MODE`: 개발 시 `"true"`, 프로덕션 시 `"false"`

## 🧪 4단계: 테스트

### 4.1 개발 서버 실행

```bash
npm run dev
```

### 4.2 실제 사용 예시 체험

브라우저에서 다음 URL 접속:

```
http://localhost:3000/sms-examples
```

**실제 서비스 시나리오를 체험해보세요:**

- 회원가입, 로그인, 비밀번호 재설정
- 컴포넌트 방식 vs 훅 방식 비교

### 4.3 개발자 테스트 페이지

기술적인 테스트가 필요할 때:

```
http://localhost:3000/test-sms-verification
```

### 4.4 기능 테스트

1. **컴포넌트 테스트** 탭에서 전화번호 입력 후 인증 테스트
2. **훅 테스트** 탭에서 개별 함수 테스트
3. **API 테스트** 탭에서 환경변수 확인

### 4.5 테스트 모드 확인

- 테스트 모드에서는 실제 SMS가 발송되지 않음
- 생성된 인증 코드는 **브라우저 콘솔**에서 확인
- `F12` → **Console** 탭에서 `[테스트 모드] 인증 코드: 123456` 메시지 확인

## 🚀 5단계: 프로덕션 배포

### 5.1 한국 번호 발송 준비

한국 번호로 SMS를 발송하려면 Twilio에 비즈니스 정보 등록 필요:

1. **Console** → **Account** → **Compliance**
2. **Korea** 선택 후 비즈니스 정보 등록
3. 승인 완료까지 1-3일 소요

### 5.2 프로덕션 환경변수

```bash
# 프로덕션 환경
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_production_auth_token"
TWILIO_VERIFY_SERVICE_SID="VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_TEST_MODE="false"
```

### 5.3 요금 확인

Verify API 요금 (2024년 기준):

- **SMS 인증**: $0.05 per verification
- **음성 인증**: $0.15 per verification
- **국제 SMS**: 국가별 요금 상이

## 🔒 보안 주의사항

### 필수 보안 조치

1. **환경변수 보호**
   - `.env.local` 파일을 Git에 커밋하지 마세요
   - `.gitignore`에 `.env*` 추가 확인

2. **Auth Token 보호**
   - Auth Token은 절대 클라이언트 코드에 포함하지 마세요
   - 서버 환경에서만 사용

3. **Test Credentials**
   - 개발 환경과 프로덕션 환경 분리
   - 테스트용 계정과 프로덕션 계정 분리 권장

## 🚨 문제 해결

### 자주 발생하는 오류

1. **"Authentication Error"**

   ```
   해결: Account SID와 Auth Token 확인
   ```

2. **"Service not found"**

   ```
   해결: Verify Service SID 확인 (VA로 시작하는지)
   ```

3. **"Permission denied"**

   ```
   해결: 한국 번호 발송 승인 필요
   ```

4. **"Invalid phone number"**
   ```
   해결: +82 형식으로 전화번호 입력
   ```

### 로그 확인

```bash
# 개발 서버 콘솔에서 확인 가능한 로그
[Twilio] 인증 코드 발송 성공: VA123456...
[VerificationService] 코드 생성: +821012345678 -> 123456
```

## 📞 지원

### Twilio 고객 지원

- **Documentation**: https://www.twilio.com/docs/verify
- **Support**: https://support.twilio.com
- **Community**: https://www.twilio.com/community

### 프로젝트 지원

문제 발생 시 다음 정보와 함께 문의:

- 오류 메시지
- 브라우저 콘솔 로그
- 서버 콘솔 로그
- 사용한 전화번호 형식

---

## ✅ 체크리스트

설정 완료 후 다음 항목들을 확인하세요:

- [ ] Twilio 계정 생성 및 크레딧 확인
- [ ] Account SID 및 Auth Token 확인
- [ ] Verify Service 생성 및 Service SID 확인
- [ ] `.env.local` 파일 생성 및 환경변수 설정
- [ ] 테스트 페이지에서 정상 작동 확인
- [ ] 브라우저 콘솔에서 인증 코드 확인
- [ ] 프로덕션 배포 시 환경변수 업데이트

**🎉 설정 완료! 이제 안전하고 신뢰할 수 있는 SMS 인증 서비스를 사용할 수 있습니다.**
