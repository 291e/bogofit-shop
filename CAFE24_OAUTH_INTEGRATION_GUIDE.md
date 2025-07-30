# 🛍️ Cafe24 OAuth 연동 완료 가이드

[카페24 개발자센터 공식 문서](https://developers.cafe24.com/app/front/app/refer/adminapisamplecode)를 기반으로 완전히 재구현된 OAuth 연동 시스템입니다.

## 🎉 **완료된 작업**

### ✅ **1. OAuth 엔드포인트 수정**

- **인증 URL**: `https://{mall_id}.cafe24.com/api/v2/oauth/authorize`
- **토큰 URL**: `https://{mall_id}.cafe24api.com/api/v2/oauth/token`
- 카페24 공식 문서 기준으로 정확한 엔드포인트 사용

### ✅ **2. 앱 설치/인증 프로세스 구현**

- **설치 페이지**: `/cafe24/install` - 사용자 친화적인 설치 인터페이스
- **인증 시작**: `/api/cafe24/oauth/authorize` - OAuth 인증 시작점
- **콜백 처리**: `/api/cafe24/oauth/callback` - 인증 결과 처리
- **성공 페이지**: `/cafe24/success` - 설치 완료 확인

### ✅ **3. Admin API 호출 로직**

- `cafe24OAuth.apiCall()` - 범용 API 호출 메서드
- `cafe24OAuth.getProducts()` - 상품 목록 조회
- `cafe24OAuth.getProduct()` - 상품 상세 조회
- 자동 토큰 갱신 및 재시도 로직 포함

### ✅ **4. 강화된 에러 핸들링**

- 상세한 에러 메시지 및 문제 해결 가이드
- 환경변수 누락 시 자동 설치 페이지 리디렉션
- API 호출 실패 시 자동 토큰 갱신 시도

### ✅ **5. OAuth 연동 상태 진단 API**

- **진단 API**: `/api/cafe24/status` - 연동 상태 종합 진단
- 환경변수, OAuth 설정, API 연결성 체크
- 문제 발생 시 구체적인 해결 방안 제시

---

## 🚀 **설정 방법**

### **1단계: 환경변수 설정**

`.env.local` 파일에 다음 환경변수를 설정하세요:

```bash
# Cafe24 OAuth 설정
CAFE24_MALL_ID="your-mall-id"
CAFE24_CLIENT_ID="your-client-id"
CAFE24_CLIENT_SECRET="your-client-secret"

# Base URL 설정
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### **2단계: 카페24 개발자센터 설정**

1. [카페24 개발자센터](https://developers.cafe24.com)에서 앱 생성
2. **리디렉션 URI** 등록:
   ```
   http://localhost:3000/api/cafe24/oauth/callback
   ```
3. **권한 스코프** 설정:
   - `mall.read_application` - 앱 정보 읽기
   - `mall.write_application` - 앱 정보 쓰기
   - `mall.read_product` - 상품 정보 읽기
   - `mall.read_category` - 카테고리 정보 읽기

### **3단계: OAuth 인증 시작**

```bash
# 개발 서버 실행
npm run dev

# OAuth 인증 시작
http://localhost:3000/api/cafe24/oauth/authorize
```

---

## 🔧 **사용 방법**

### **API 호출 예시**

```typescript
import { cafe24OAuth } from "@/lib/cafe24";

// 상품 목록 조회
const products = await cafe24OAuth.getProducts({ limit: 10 });

// 특정 상품 조회
const product = await cafe24OAuth.getProduct(12345);

// 커스텀 API 호출
const result = await cafe24OAuth.apiCall("/admin/categories", "GET");
```

### **연동 상태 확인**

```bash
# 진단 API 호출
curl http://localhost:3000/api/cafe24/status
```

**응답 예시:**

```json
{
  "success": true,
  "status": "healthy",
  "health_score": 100,
  "environment": {
    "CAFE24_MALL_ID": { "exists": true, "value": "yourmall" }
  },
  "oauth": {
    "configLoaded": true,
    "authUrlGenerated": true,
    "redirectUri": "http://localhost:3000/api/cafe24/oauth/callback"
  },
  "connectivity": {
    "hasAccessToken": true,
    "canCallAPI": true
  },
  "recommendations": ["✅ 모든 설정이 정상입니다!"]
}
```

---

## 🔍 **문제 해결**

### **자주 발생하는 문제**

1. **환경변수 오류**

   ```bash
   # 진단 API로 확인
   curl http://localhost:3000/api/cafe24/status

   # 누락된 환경변수 설정 후 서버 재시작
   npm run dev
   ```

2. **OAuth 인증 실패**

   - 카페24 개발자센터에서 리디렉션 URI 확인
   - Client ID/Secret 정보 재확인
   - 권한 스코프 설정 확인

3. **API 호출 실패**

   ```typescript
   // 토큰 상태 확인
   const hasToken = await cafe24OAuth.getAccessToken();
   console.log("Access Token:", !!hasToken);

   // 수동 토큰 갱신
   const newToken = await cafe24OAuth.refreshAccessToken();
   ```

### **디버깅 로그**

OAuth 연동 과정에서 다음과 같은 상세 로그가 출력됩니다:

```
=== Cafe24 OAuth 환경변수 확인 ===
✅ Cafe24 OAuth 설정 완료
🔗 Cafe24 OAuth 인증 URL 생성
🔗 Cafe24 토큰 교환 요청
✅ Cafe24 OAuth 인증 성공!
```

---

## 📚 **참고 자료**

- [카페24 개발자센터 - OAuth 인증](https://developers.cafe24.com/app/front/app/develop/oauth)
- [카페24 Admin API 샘플 코드](https://developers.cafe24.com/app/front/app/refer/adminapisamplecode)
- [카페24 API 문서](https://developers.cafe24.com/docs/api/admin)

---

## 🎯 **다음 단계**

OAuth 연동이 완료되었으니 이제 다음 기능들을 구현할 수 있습니다:

1. **상품 동기화** - Cafe24 상품을 BOGOFIT Shop과 동기화
2. **주문 연동** - 주문 정보 실시간 동기화
3. **재고 관리** - 실시간 재고 정보 업데이트
4. **AI 가상 피팅** - Cafe24 상품에 가상 피팅 기능 적용

모든 OAuth 인증 기반이 완료되어 이제 안정적으로 카페24 API를 활용할 수 있습니다! 🎉
