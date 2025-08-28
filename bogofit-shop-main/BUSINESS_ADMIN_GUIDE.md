# 🏷️ 브랜드 파트너 관리 시스템 가이드

## 📋 개요

BOGOFIT Shop의 브랜드 파트너 관리 시스템은 **입점 브랜드**를 위한 전용 관리 도구입니다. 상품 관리, 주문 처리, 정산 관리, 통계 분석 등 브랜드 운영에 필요한 핵심 기능을 제공합니다.

## 🎯 주요 기능 (최신 버전)

### 1. **📊 대시보드**

- 실시간 매출 및 주문 통계
- 브랜드별 성과 지표
- 최근 주문 현황
- 빠른 액션 버튼

### 2. **🛍️ 상품 관리**

- 상품 등록, 수정, 삭제
- 재고 관리 및 알림
- 상품 옵션 관리 (색상, 사이즈 등)
- Tiptap 에디터를 통한 상세 설명

### 3. **📦 주문 관리**

- 브랜드별 주문 목록
- 주문 상태 관리 (접수 → 준비 → 배송 → 완료)
- 배송 관리
- 반품/환불 처리

### 4. **📈 통계 및 분석**

- **매출 분석**: 기간별 매출, 성장률, 목표 대비 실적
- **상품 분석**: 베스트셀러, 재고 회전율, 수익률

### 5. **💰 정산 관리**

- 월별 정산 현황
- 수수료 계산 및 확인
- 정산 신청 및 처리 상태
- 정산 계좌 관리

### 6. **🏷️ 브랜드 설정**

- 브랜드명 및 로고 관리
- 브랜드 소개 편집
- 실시간 미리보기

## 🗑️ 제거된 기능

- ❌ **매장 관리**: 쇼핑몰에서 통합 관리
- ❌ **고객 관리**: 개인정보 보호 및 쇼핑몰 통합 관리
- ❌ **고객 분석**: 브랜드는 매출 중심 분석만 제공
- ❌ **복잡한 설정**: API 관리, 알림 설정 등 고급 기능

## 🚀 시작하기

### 1. 접근 권한

브랜드 파트너 시스템에 접근하려면:

1. **브랜드 계정 필요**: `user.isBusiness = true`
2. **로그인 상태**: 유효한 인증 토큰 필요
3. **브랜드 등록**: `Brand` 테이블에 등록된 브랜드
4. **승인 상태**: `brand.status = 'APPROVED'`

### 2. 접근 경로

```
https://your-domain.com/business
```

## 📁 시스템 구조 (최신)

```
src/
├── app/(Business)/                 # 브랜드 라우트 그룹
│   ├── layout.tsx                 # 브랜드 전용 레이아웃
│   └── business/
│       ├── page.tsx               # 대시보드
│       ├── products/
│       │   ├── page.tsx           # 상품 목록
│       │   ├── new/
│       │   │   └── page.tsx       # 상품 등록 (Tiptap 에디터)
│       │   └── inventory/
│       │       └── page.tsx       # 재고 관리
│       ├── orders/
│       │   ├── page.tsx           # 주문 목록 (미구현)
│       ├── shipping/
│       │   └── page.tsx           # 배송 관리 (미구현)
│       ├── refunds/
│       │   └── page.tsx           # 반품/환불 (미구현)
│       ├── analytics/
│       │   ├── sales/
│       │   │   └── page.tsx       # 매출 분석
│       │   └── products/
│       │       └── page.tsx       # 상품 분석
│       ├── settlement/
│       │   └── page.tsx           # 정산 관리
│       └── settings/
│           └── brand/
│               └── page.tsx       # 브랜드 설정
├── components/business/            # 브랜드 전용 컴포넌트
│   ├── BusinessSidebar.tsx        # 사이드바 (업데이트됨)
│   ├── BusinessRouteGuard.tsx     # 접근 권한 관리
│   └── TiptapEditor.tsx           # 상품 상세 에디터
├── contents/Business/              # 브랜드 데이터 센터
│   ├── menuItems.ts               # 사이드바 메뉴 (업데이트됨)
│   ├── analyticsData.ts           # 분석 데이터 (고객 데이터 제거)
│   ├── settlementData.ts          # 정산 데이터 (신규)
│   ├── inventoryData.ts           # 재고 데이터
│   ├── shippingData.ts            # 배송 데이터
│   ├── refundData.ts              # 환불 데이터
│   └── productFormData.ts         # 상품 폼 데이터
└── app/api/business/              # 브랜드 API (미구현)
    ├── route.ts                   # 브랜드 정보 CRUD
    ├── products/route.ts          # 상품 관리
    ├── orders/route.ts            # 주문 관리
    ├── settlement/route.ts        # 정산 관리
    └── analytics/route.ts         # 통계 데이터
```

## 🗄️ 데이터베이스 구조 분석 및 개선 방안

### 📊 현재 DB 구조 분석

#### ✅ 기존 유지 테이블

```sql
-- 사용자 관리
User (id, userId, isBusiness, email, name, phoneNumber, ...)
Provider (소셜 로그인)
Address (배송지 관리)

-- 상품 관리
Product (id, title, price, category, imageUrl, badge, ...)
ProductVariant (옵션 관리: 색상, 사이즈 등)

-- 주문 관리
Order (주문 정보)
OrderItem (주문 상품)
Payment (결제 정보)

-- 기타
Review, Coupon, Event, Notice, Faq
```

#### ❌ 수정 필요한 기존 테이블

**1. Product 테이블**

```sql
-- 현재: storeName (String) - 하드코딩된 매장명
-- 개선: brandId (Int) - Brand 테이블과 외래키 연결

-- 추가 필요 필드
detailedDescription  String?    -- Tiptap 에디터 HTML 출력
status              ProductStatus @default(PENDING)  -- 승인 상태
brandId             Int                              -- 브랜드 연결
```

**2. Order 테이블**

```sql
-- 추가 필요 필드 (브랜드별 주문 추적)
brandId          Int?           -- 주문의 주요 브랜드
totalCommission  Float?         -- 브랜드 수수료
settlementStatus SettlementStatus @default(PENDING)
```

### 🆕 신규 추가 필요 테이블

#### **1. Brand 테이블 (핵심)**

```sql
model Brand {
  id              Int           @id @default(autoincrement())
  name            String        @unique           -- 브랜드명
  slug            String        @unique           -- URL용 슬러그
  logoUrl         String?                         -- 브랜드 로고
  description     String?                         -- 브랜드 소개
  businessNumber  String?       @unique           -- 사업자번호

  -- 브랜드 상태
  status          BrandStatus   @default(PENDING) -- 승인 상태
  isActive        Boolean       @default(true)    -- 활성화 상태

  -- 정산 정보
  commissionRate  Float         @default(5.0)     -- 수수료율 (%)
  bankAccount     String?                         -- 정산 계좌
  bankCode        String?                         -- 은행 코드
  accountHolder   String?                         -- 예금주

  -- 브랜드 설정
  settings        Json?                           -- 브랜드별 설정 (JSON)

  -- 관계
  users           User[]                          -- 브랜드 관리자들 (1:N)
  products        Product[]                       -- 브랜드 상품들
  settlements     Settlement[]                    -- 정산 내역

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum BrandStatus {
  PENDING        -- 승인 대기
  APPROVED       -- 승인 완료
  REJECTED       -- 승인 거부
  SUSPENDED      -- 일시 중단
}

enum ProductStatus {
  PENDING        -- 승인 대기
  APPROVED       -- 승인 완료
  REJECTED       -- 승인 거부
  DRAFT          -- 임시 저장
}
```

#### **2. UserGrade 테이블 (회원등급 관리)**

```sql
model UserGrade {
  id              Int           @id @default(autoincrement())
  name            String        @unique           -- 등급명 (일반, VIP, VVIP)
  slug            String        @unique           -- 등급 코드 (normal, vip, vvip)
  description     String?                         -- 등급 설명

  -- 혜택 설정
  discountRate    Float         @default(0)       -- 기본 할인율 (%)
  pointRate       Float         @default(1.0)     -- 포인트 적립율 (배수)
  freeShipping    Boolean       @default(false)   -- 무료배송 여부

  -- 등급 조건
  minOrderAmount  Float         @default(0)       -- 최소 주문 금액
  minOrderCount   Int           @default(0)       -- 최소 주문 횟수

  -- 등급 관리
  isActive        Boolean       @default(true)
  sortOrder       Int           @default(0)       -- 정렬 순서

  users           User[]                          -- 이 등급의 사용자들

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

#### **3. Settlement 테이블 (정산 관리)**

```sql
model Settlement {
  id              String        @id @default(cuid())
  brand           Brand         @relation(fields: [brandId], references: [id])
  brandId         Int

  -- 정산 기간
  periodStart     DateTime                        -- 정산 시작일
  periodEnd       DateTime                        -- 정산 종료일
  settlementDate  DateTime?                       -- 실제 정산일

  -- 금액 계산
  totalSales      Float                           -- 총 매출
  totalOrders     Int                             -- 총 주문 건수
  commission      Float                           -- 수수료
  commissionRate  Float                           -- 수수료율
  adjustments     Float         @default(0)       -- 조정 금액
  finalAmount     Float                           -- 최종 정산 금액

  -- 정산 상태
  status          SettlementStatus @default(PENDING)

  -- 계좌 정보 (정산 시점)
  bankAccount     String?
  bankCode        String?
  accountHolder   String?

  -- 메모 및 첨부
  notes           String?                         -- 정산 메모
  attachments     String[]                        -- 첨부 파일 URLs

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum SettlementStatus {
  PENDING         -- 정산 대기
  PROCESSING      -- 정산 처리중
  COMPLETED       -- 정산 완료
  FAILED          -- 정산 실패
  CANCELLED       -- 정산 취소
}
```

#### **4. BrandAnalytics 테이블 (통계 데이터 캐시)**

```sql
model BrandAnalytics {
  id              Int           @id @default(autoincrement())
  brand           Brand         @relation(fields: [brandId], references: [id])
  brandId         Int

  -- 분석 기간
  period          String                          -- 'YYYY-MM' or 'YYYY-MM-DD'
  periodType      PeriodType                      -- DAILY, MONTHLY, YEARLY

  -- 매출 지표
  totalRevenue    Float         @default(0)
  totalOrders     Int           @default(0)
  totalProducts   Int           @default(0)
  averageOrderValue Float       @default(0)

  -- 상품 지표
  bestSellingProduct String?                      -- 베스트셀러 상품 ID
  totalProductViews  Int        @default(0)
  conversionRate     Float      @default(0)

  -- 기타 지표
  returnsCount    Int           @default(0)
  refundsAmount   Float         @default(0)
  reviewsCount    Int           @default(0)
  averageRating   Float         @default(0)

  calculatedAt    DateTime      @default(now())

  @@unique([brandId, period, periodType])
}

enum PeriodType {
  DAILY
  MONTHLY
  YEARLY
}
```

#### **5. TermsAgreement 테이블 (약관 동의 관리)**

```sql
model TermsAgreement {
  id              Int           @id @default(autoincrement())
  user            User          @relation(fields: [userId], references: [id])
  userId          String

  -- 약관 정보
  termsType       TermsType                       -- 약관 종류
  termsVersion    String                          -- 약관 버전
  content         String?                         -- 약관 내용 (요약)

  -- 동의 정보
  isAgreed        Boolean                         -- 동의 여부
  agreedAt        DateTime?                       -- 동의 일시
  ipAddress       String?                         -- 동의 IP
  userAgent       String?                         -- 동의 브라우저

  -- 철회 정보
  isWithdrawn     Boolean       @default(false)   -- 동의 철회 여부
  withdrawnAt     DateTime?                       -- 철회 일시
  withdrawReason  String?                         -- 철회 사유

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([userId, termsType, termsVersion])
}

enum TermsType {
  SERVICE         -- 서비스 이용약관
  PRIVACY         -- 개인정보 처리방침
  MARKETING       -- 마케팅 수신 동의
  LOCATION        -- 위치정보 이용약관
  THIRDPARTY      -- 제3자 정보제공 동의
}
```

#### **6. UserLog 테이블 (사용자 활동 로그)**

```sql
model UserLog {
  id              String        @id @default(cuid())
  user            User?         @relation(fields: [userId], references: [id])
  userId          String?                         -- 비회원 로그도 기록 가능

  -- 활동 정보
  action          LogAction                       -- 활동 종류
  category        String?                         -- 카테고리 (auth, order, product 등)
  description     String?                         -- 활동 설명

  -- 대상 정보
  targetType      String?                         -- 대상 타입 (Product, Order 등)
  targetId        String?                         -- 대상 ID

  -- 세션 정보
  sessionId       String?                         -- 세션 ID
  ipAddress       String?                         -- IP 주소
  userAgent       String?                         -- 브라우저 정보

  -- 추가 데이터
  metadata        Json?                           -- 추가 메타데이터 (JSON)

  -- 결과 정보
  isSuccess       Boolean       @default(true)    -- 성공 여부
  errorMessage    String?                         -- 에러 메시지

  createdAt       DateTime      @default(now())

  @@index([userId, createdAt])
  @@index([action, createdAt])
}

enum LogAction {
  LOGIN           -- 로그인
  LOGOUT          -- 로그아웃
  REGISTER        -- 회원가입
  PASSWORD_RESET  -- 비밀번호 재설정

  VIEW_PRODUCT    -- 상품 조회
  ADD_TO_CART     -- 장바구니 추가
  REMOVE_FROM_CART -- 장바구니 제거

  CREATE_ORDER    -- 주문 생성
  CANCEL_ORDER    -- 주문 취소
  PAYMENT_SUCCESS -- 결제 성공
  PAYMENT_FAIL    -- 결제 실패

  WRITE_REVIEW    -- 리뷰 작성
  UPDATE_PROFILE  -- 프로필 수정

  BUSINESS_LOGIN  -- 비즈니스 로그인
  BUSINESS_ACTION -- 비즈니스 활동
}
```

### 🔄 기존 테이블 수정사항

#### **1. User 테이블 수정**

```sql
model User {
  // ... 기존 필드들

  -- 브랜드 관련 추가 (1:1 관계로 단순화)
  brandId         Int?                            -- 소속 브랜드 (nullable)
  brand           Brand?        @relation(fields: [brandId], references: [id])

  -- 회원등급 추가
  gradeId         Int?                            -- 회원등급
  grade           UserGrade?    @relation(fields: [gradeId], references: [id])

  -- 비즈니스 추가 정보
  businessProfile Json?                           -- 비즈니스 프로필 (JSON)
  lastBusinessLogin DateTime?                     -- 마지막 비즈니스 로그인

  -- 새로운 관계 추가
  termsAgreements TermsAgreement[]                -- 약관 동의 내역
  userLogs        UserLog[]                       -- 사용자 활동 로그
}
```

#### **2. Product 테이블 수정**

```sql
model Product {
  // ... 기존 필드들

  -- storeName 필드 제거 (product.brand.name으로 접근)
  -- 브랜드 연결 (필수로 변경 예정)
  brandId         Int                              -- 브랜드 연결 (필수)
  brand           Brand         @relation(fields: [brandId], references: [id])

  -- 추가 필드
  status          ProductStatus @default(PENDING)  -- 신규 상품은 승인 대기
  detailedDescription String?                      -- Tiptap HTML 출력
  sku             String?       @unique             -- 상품 코드

  -- 브랜드 관련 통계
  totalSales      Float         @default(0)         -- 누적 판매액
  totalSold       Int           @default(0)         -- 누적 판매량

  -- 승인 관련
  approvedAt      DateTime?                        -- 승인 일시
  approvedBy      String?                          -- 승인자 ID
  rejectionReason String?                          -- 거부 사유
}
```

#### **3. Order 테이블 수정**

```sql
model Order {
  // ... 기존 필드들

  -- 브랜드 관련 추가
  brandId         Int?                             -- 주요 브랜드 (단일 브랜드 주문용)
  brand           Brand?        @relation(fields: [brandId], references: [id])

  -- 정산 관련
  totalCommission Float?                           -- 총 수수료
  settlementStatus SettlementStatus @default(PENDING)
  settlementId    String?                          -- 정산 ID 연결
  settlement      Settlement?   @relation(fields: [settlementId], references: [id])
}
```

## 🔧 API 구조 설계

### **1. 브랜드 관리 API**

```typescript
// GET /api/business/brand
// 현재 사용자의 브랜드 정보 조회

// PUT /api/business/brand
// 브랜드 정보 수정 (이름, 로고, 설명)

// POST /api/business/brand/logo
// 브랜드 로고 업로드
```

### **2. 상품 관리 API**

```typescript
// GET /api/business/products
// 브랜드별 상품 목록 (페이지네이션, 필터링)

// POST /api/business/products
// 새 상품 등록 (승인 대기 상태로)

// PUT /api/business/products/[id]
// 상품 정보 수정

// DELETE /api/business/products/[id]
// 상품 삭제 (soft delete)

// GET /api/business/products/inventory
// 재고 현황 조회

// PUT /api/business/products/[id]/inventory
// 재고 수량 업데이트
```

### **3. 주문 관리 API**

```typescript
// GET /api/business/orders
// 브랜드별 주문 목록

// PUT /api/business/orders/[id]/status
// 주문 상태 변경 (준비중, 배송중 등)

// GET /api/business/orders/[id]
// 주문 상세 정보
```

### **4. 정산 관리 API**

```typescript
// GET /api/business/settlement
// 정산 내역 조회

// POST /api/business/settlement/request
// 정산 신청

// GET /api/business/settlement/calculate
// 정산 예상 금액 계산

// PUT /api/business/settlement/account
// 정산 계좌 정보 수정
```

### **5. 통계 분석 API**

```typescript
// GET /api/business/analytics/sales
// 매출 분석 데이터

// GET /api/business/analytics/products
// 상품 분석 데이터

// GET /api/business/analytics/dashboard
// 대시보드 요약 통계
```

## 🚀 마이그레이션 전략

### **1단계: 핵심 테이블 생성**

```sql
-- 1. Brand, UserGrade, TermsAgreement, UserLog 테이블 생성
-- 2. 기존 Product의 storeName을 기반으로 Brand 데이터 생성
-- 3. isBusiness=true 사용자들의 brandId 연결 (1:1 관계)
-- 4. 기본 회원등급 데이터 생성 (일반, VIP, VVIP)
```

### **2단계: 점진적 이관**

```sql
-- 1. Product 테이블에 brandId 추가 (nullable)
-- 2. 기존 상품들의 brandId 업데이트
-- 3. 신규 상품부터 승인 프로세스 적용
```

### **3단계: 정산 시스템 구축**

```sql
-- 1. Settlement 테이블 활용한 정산 로직 구현
-- 2. 기존 주문들의 수수료 계산 및 이관
-- 3. 정산 신청/처리 프로세스 구축
```

## 🔐 보안 및 권한 관리

### **1. 브랜드별 데이터 격리**

```typescript
// 사용자의 브랜드 소속 확인 (단순화된 1:1 관계)
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { brand: true },
});

if (!user?.isBusiness || !user.brand || user.brandId !== targetBrandId) {
  throw new UnauthorizedError();
}
```

### **2. 회원등급 기반 혜택 제어**

```typescript
// 회원등급별 혜택 적용
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { grade: true },
});

// grade.discountRate: 기본 할인율
// grade.pointRate: 포인트 적립율
// grade.freeShipping: 무료배송 여부
const finalPrice = calculatePriceWithGrade(basePrice, user.grade);
```

### **3. 활동 로그 기록**

```typescript
// 중요 활동 자동 로깅
await prisma.userLog.create({
  data: {
    userId,
    action: "BUSINESS_ACTION",
    category: "product",
    description: "상품 등록",
    targetType: "Product",
    targetId: productId,
    ipAddress,
    userAgent,
    metadata: { productData: sanitizedData },
  },
});
```

## 📊 성능 최적화

### **1. 인덱스 설계**

```sql
-- 브랜드별 상품 조회 최적화
CREATE INDEX idx_product_brand_status ON Product(brandId, status);

-- 브랜드별 주문 조회 최적화
CREATE INDEX idx_order_brand_date ON Order(brandId, createdAt);

-- 정산 조회 최적화
CREATE INDEX idx_settlement_brand_period ON Settlement(brandId, periodStart, periodEnd);
```

### **2. 통계 데이터 캐싱**

```typescript
// BrandAnalytics 테이블을 통한 사전 계산된 통계
// 일별/월별 배치 작업으로 통계 데이터 업데이트
// Redis 캐싱으로 실시간 조회 성능 향상
```

## 🎯 향후 개발 로드맵

### **Phase 1: 핵심 기능 구현 (4주)**

- [ ] 브랜드 DB 스키마 구축 (Brand, UserGrade, TermsAgreement, UserLog)
- [ ] 회원등급 시스템 구현 (할인율, 포인트, 무료배송)
- [ ] 브랜드 설정 페이지 완성 (1:1 관계로 단순화)
- [ ] 상품 관리 API 연동 (승인 프로세스 포함)
- [ ] 기본 통계 대시보드
- [ ] 활동 로그 시스템 구축

### **Phase 2: 주문 및 정산 (4주)**

- [ ] 주문 관리 시스템 구축
- [ ] 정산 관리 시스템 구축
- [ ] 배송 관리 기능
- [ ] 환불 처리 기능

### **Phase 3: 고도화 (4주)**

- [ ] 고급 통계 분석
- [ ] 브랜드별 프로모션
- [ ] 모바일 최적화
- [ ] 알림 시스템

### **Phase 4: 확장 기능 (추후)**

- [ ] 다중 브랜드 관리
- [ ] API 외부 연동
- [ ] AI 기반 상품 추천
- [ ] 글로벌 진출 지원

---

**💡 참고사항**:

- 현재 시스템은 Mock 데이터로 구동됨
- **단순화된 구조**: BrandUser 테이블 제거, User-Brand 1:1 관계로 변경
- **storeName 필드 제거**: product.brand.name으로 접근하여 중복 제거
- **새로운 기능**: 회원등급 시스템, 약관 동의 관리, 활동 로그 시스템
- 점진적 이관 전략을 통해 기존 데이터 손실 없이 개선 가능
