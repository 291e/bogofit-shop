# 📱 SMS API 연동 가이드 (ALIGO)

## 📋 개요

BogoFit Shop은 [ALIGO SMS API](https://smartsms.aligo.in/smsapi.html)를 연동하여 다양한 상황에서 SMS 알림을 전송합니다.

## 🚀 주요 기능

- **일반 문자 발송**: 동일한 내용을 최대 1,000명에게 동시 전송
- **대량 문자 발송**: 개별 내용을 최대 500명에게 동시 전송
- **메시지 타입 자동 판단**: SMS/LMS/MMS 자동 분류
- **발송 가능 건수 조회**: 잔여 포인트 확인
- **발송 내역 조회**: 전송 결과 및 상세 내역 확인
- **예약 발송**: 지정된 시간에 자동 발송
- **발송 취소**: 예약 문자 취소 기능

## 🛠️ 설정 방법

### 1. ALIGO 계정 설정

#### 1.1 회원가입

1. [ALIGO 홈페이지](https://smartsms.aligo.in)에서 회원가입
2. 포인트 충전 (테스트용으로 소액 충전 권장)

#### 1.2 발신번호 등록

1. ALIGO 관리자 페이지 로그인
2. **발신번호 관리** → **발신번호 등록**
3. 사용할 전화번호 입력 (사업자 번호 권장: `025114560`)
4. 인증 절차 완료 (문서 제출 필요)

#### 1.3 API 키 발급

1. **API 관리** → **API 키 관리**
2. 새 API 키 생성
3. 사용자 ID 확인 (로그인 ID)

### 2. 환경 변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```bash
# ALIGO SMS API 설정
ALIGO_API_KEY=your_aligo_api_key_here
ALIGO_USER_ID=your_aligo_user_id_here

# SMS 서비스 설정
SMS_DEFAULT_SENDER=025114560                    # 기본 발신번호 (ALIGO에 등록된 번호)
BUSINESS_NOTIFICATION_PHONE=01012345678         # 비즈니스 알림 수신번호
SMS_TEST_MODE=true                              # 개발환경에서는 테스트 모드

# 기타 설정
NEXT_PUBLIC_BASE_URL=http://localhost:3000       # 리뷰 링크용
```

## 📋 API 엔드포인트

### 1. 문자 발송 (일반)

**Endpoint**: `POST /api/sms/send`

#### 요청 예시

```javascript
const response = await fetch("/api/sms/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sender: "025114560",
    receiver: "01012345678,01087654321", // 쉼표로 구분된 수신번호
    msg: "안녕하세요! BogoFit Shop입니다.",
    testmodeYn: "Y", // 테스트 모드
  }),
});

const result = await response.json();
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "result_code": 1,
    "message": "success",
    "msg_id": "1114329000",
    "success_cnt": 2,
    "error_cnt": 0,
    "msg_type": "SMS"
  },
  "message": "문자 발송이 완료되었습니다."
}
```

### 2. 대량 문자 발송 (개별 내용)

**Endpoint**: `POST /api/sms/send-mass`

#### 요청 예시

```javascript
const response = await fetch("/api/sms/send-mass", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sender: "025114560",
    msgType: "SMS",
    receivers: [
      {
        receiver: "01012345678",
        destination: "홍길동",
        msg: "홍길동님, 주문이 완료되었습니다.",
      },
      {
        receiver: "01087654321",
        destination: "김철수",
        msg: "김철수님, 배송이 시작되었습니다.",
      },
    ],
    testmodeYn: "Y",
  }),
});
```

### 3. 발송 가능 건수 조회

**Endpoint**: `GET /api/sms/remain`

#### 요청 예시

```javascript
const response = await fetch("/api/sms/remain");
const result = await response.json();

console.log(`SMS: ${result.data.SMS_CNT}건`);
console.log(`LMS: ${result.data.LMS_CNT}건`);
console.log(`MMS: ${result.data.MMS_CNT}건`);
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "result_code": 1,
    "message": "success",
    "SMS_CNT": 1000,
    "LMS_CNT": 500,
    "MMS_CNT": 100
  },
  "message": "잔여 건수 조회가 완료되었습니다."
}
```

### 4. 발송 내역 조회

**Endpoint**: `GET /api/sms/history`

#### 쿼리 파라미터

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 건수 (기본값: 50, 최대 500)
- `start_date`: 조회 시작일 (YYYYMMDD 형식)
- `end_date`: 조회 종료일 (YYYYMMDD 형식)

#### 요청 예시

```javascript
const response = await fetch(
  "/api/sms/history?page=1&limit=20&start_date=20241201&end_date=20241231"
);
const result = await response.json();
```

### 5. 예약 문자 취소

**Endpoint**: `POST /api/sms/cancel`

#### 요청 예시

```javascript
const response = await fetch("/api/sms/cancel", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    msg_id: "1114329000", // 발송 시 받은 메시지 ID
  }),
});
```

## 📝 메시지 타입 및 제한사항

### 메시지 타입 자동 분류

| 타입    | 글자 수           | 바이트 수        | 특징              |
| ------- | ----------------- | ---------------- | ----------------- |
| **SMS** | 한글 45자 내외    | 90바이트 이하    | 단문 메시지       |
| **LMS** | 한글 1,000자 내외 | 2,000바이트 이하 | 장문 메시지       |
| **MMS** | LMS + 이미지      | 2,000바이트 이하 | 멀티미디어 메시지 |

### 글자 수 계산 예시

```javascript
// 한글: 2바이트, 영문/숫자: 1바이트
const message = "안녕하세요! Hello 123";
// 한글 6자(12바이트) + 영문/숫자/공백 9자(9바이트) = 21바이트 (SMS)
```

## 🎯 비즈니스 로직 연동

### 자동 SMS 발송 시나리오

#### 1. 주문 완료 시

```javascript
// 결제 성공 후 자동 발송 (src/app/api/confirm/payment/route.ts)
await SmsNotificationService.sendOrderCompletedSms({
  customerPhone: "01012345678",
  customerName: "홍길동",
  orderId: "order_123",
  amount: 29000,
  recipientName: "홍길동",
  address: "서울시 강남구 테헤란로 123",
  testMode: isTestMode,
});
```

#### 2. 배송 시작 시

```javascript
// 주문 상태를 SHIPPING으로 변경 시 자동 발송
await SmsNotificationService.sendShippingStartedSms({
  customerPhone: "01012345678",
  customerName: "홍길동",
  orderId: "order_123",
  trackingNumber: "1234567890123",
  courierCompany: "CJ대한통운",
  testMode: isTestMode,
});
```

#### 3. 회원가입 시

```javascript
// 신규 회원 가입 시 환영 메시지
await SmsNotificationService.sendWelcomeSms({
  customerPhone: "01012345678",
  customerName: "홍길동",
  testMode: isTestMode,
});
```

### 메시지 템플릿

시스템에서 사용하는 기본 메시지 템플릿들:

```javascript
// src/lib/sms-notifications.ts
export const SMS_TEMPLATES = {
  ORDER_COMPLETED: (data) =>
    `[BogoFit] ${data.customerName}님, 주문이 완료되었습니다!\n` +
    `주문번호: ${data.orderId}\n` +
    `결제금액: ${data.amount.toLocaleString()}원\n` +
    `배송지: ${data.address}\n` +
    `감사합니다!`,

  SHIPPING_STARTED: (data) =>
    `[BogoFit] ${data.customerName}님, 주문하신 상품이 발송되었습니다!\n` +
    `주문번호: ${data.orderId}\n` +
    `운송장번호: ${data.trackingNumber || "준비중"}\n` +
    `택배사: ${data.courierCompany || "CJ대한통운"}\n` +
    `1-2일 내 도착 예정입니다.`,

  WELCOME_USER: (data) =>
    `[BogoFit] ${data.customerName}님, 회원가입을 환영합니다!\n` +
    `첫 구매 10% 할인쿠폰이 지급되었습니다.\n` +
    `지금 바로 쇼핑해보세요!`,
};
```

## 🧪 테스트 방법

### 1. 테스트 페이지 사용

프로젝트에 내장된 테스트 페이지를 활용하세요:

```
http://localhost:3000/test-sms
```

### 2. API 직접 테스트

#### Postman/Thunder Client 사용

```bash
POST http://localhost:3000/api/sms/send
Content-Type: application/json

{
  "sender": "025114560",
  "receiver": "01012345678",
  "msg": "테스트 메시지입니다.",
  "testmodeYn": "Y"
}
```

#### cURL 사용

```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "025114560",
    "receiver": "01012345678",
    "msg": "테스트 메시지입니다.",
    "testmodeYn": "Y"
  }'
```

### 3. 단위 테스트 (추천)

```javascript
// __tests__/sms.test.js
import { AligoClient } from "@/lib/aligo";

describe("SMS API 테스트", () => {
  test("문자 발송 테스트", async () => {
    const result = await AligoClient.sendSms({
      sender: "025114560",
      receiver: "01012345678",
      msg: "테스트 메시지",
      testmode_yn: "Y",
    });

    expect(result.result_code).toBe("1");
  });
});
```

## ⚠️ 주의사항 및 제한사항

### 발신번호 제한

- **사전 등록 필수**: ALIGO에 등록되지 않은 번호는 사용 불가
- **사업자 번호 권장**: 일반 개인 번호는 스팸 차단될 가능성 높음
- **인증 절차**: 번호 등록 시 사업자등록증 등 증빙서류 필요

### 테스트 모드

- **포인트 차감 없음**: `testmodeYn: "Y"` 설정 시 실제 발송되지 않음
- **개발 환경 권장**: 프로덕션에서는 `SMS_TEST_MODE=false` 설정 필요
- **응답 확인**: 테스트 모드에서도 정상적인 API 응답 수신

### 과금 및 포인트

- **포인트제 운영**: SMS 1건당 약 20원, LMS 1건당 약 50원
- **자동 차감**: 테스트 모드가 아닌 경우 즉시 포인트 차감
- **잔여 포인트 모니터링**: 정기적으로 잔여 건수 확인 필요

### 발송 제한

- **일일 발송량**: 계정별 일일 발송 한도 존재
- **수신 거부**: 080 수신거부 서비스 의무 적용
- **광고성 메시지**: `(광고)` 표시 의무, 야간 발송 제한

### 예약 발송

- **최소 예약 시간**: 현재 시간 기준 10분 이후부터 가능
- **취소 제한**: 발송 5분 전까지만 취소 가능
- **시간 형식**: `YYYYMMDDHHMM` 형식 (예: 202412251430)

## 🔍 에러 코드 및 문제 해결

### 주요 에러 코드

| 코드 | 의미            | 해결 방법                   |
| ---- | --------------- | --------------------------- |
| 1    | 성공            | -                           |
| -101 | 인증 오류       | API 키, 사용자 ID 확인      |
| -102 | 잘못된 파라미터 | 요청 데이터 형식 확인       |
| -201 | 포인트 부족     | ALIGO에서 포인트 충전       |
| -301 | 잘못된 전화번호 | 수신번호 형식 확인          |
| -302 | 미등록 발신번호 | ALIGO에서 발신번호 등록     |
| -804 | 취소 시간 초과  | 발송 5분 전까지만 취소 가능 |

### 일반적인 문제 해결

#### 1. "미등록 발신번호" 오류

```bash
# 해결 방법
1. ALIGO 관리자 페이지 로그인
2. 발신번호 관리에서 번호 등록 상태 확인
3. 미등록 시 새로 등록 (인증 절차 필요)
4. SMS_DEFAULT_SENDER 환경변수 값 확인
```

#### 2. "포인트 부족" 오류

```bash
# 해결 방법
1. GET /api/sms/remain 으로 잔여 건수 확인
2. ALIGO 홈페이지에서 포인트 충전
3. 테스트 시에는 testmodeYn: "Y" 설정
```

#### 3. API 응답 timeout

```bash
# 해결 방법
1. 네트워크 연결 상태 확인
2. ALIGO 서버 상태 확인
3. API 키 유효성 재확인
4. 요청 데이터 크기 제한 확인
```

## 📊 모니터링 및 로그

### 발송 현황 모니터링

```javascript
// 일일 발송 현황 체크
const checkDailyStats = async () => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const history = await fetch(
    `/api/sms/history?start_date=${today}&end_date=${today}`
  );
  const remain = await fetch("/api/sms/remain");

  console.log("오늘 발송:", history);
  console.log("잔여 건수:", remain);
};
```

### 로그 설정

시스템 로그에서 SMS 관련 로그를 확인할 수 있습니다:

```javascript
// 성공 로그
console.log(`[SMS] 발송 성공: ${phone} - ${message.substring(0, 20)}...`);

// 실패 로그
console.error(`[SMS] 발송 실패: ${phone} - ${error.message}`);

// 테스트 모드 로그
console.log(`[SMS] 테스트 모드 발송: ${phone}`);
```

## 📚 추가 리소스

- **ALIGO 공식 문서**: https://smartsms.aligo.in/smsapi.html
- **ALIGO 관리자 페이지**: https://smartsms.aligo.in/admin/
- **프로젝트 Swagger 문서**: http://localhost:3000/api/docs/ui

---

**💡 SMS 발송 관련 문의사항이 있으시면 개발팀에 연락주세요!**
