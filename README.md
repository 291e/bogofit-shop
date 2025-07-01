# 🛍️ BogoFit Shop

## 📋 프로젝트 개요

BogoFit Shop은 **AI 가상 피팅 기술**을 중심으로 한 혁신적인 쇼핑몰 플랫폼입니다. 사용자가 실제로 옷을 입어보지 않고도 AI를 통해 가상으로 착용해볼 수 있는 차세대 온라인 쇼핑 경험을 제공합니다.

## 🎯 핵심 차별화 포인트

- **🤖 AI 가상 피팅**: 실시간 이미지 및 비디오 생성으로 실제 착용감 체험
- **🎬 동영상 패션 룩**: 움직임과 각도별 착용 모습 확인 가능
- **✨ TPO 스타일 추천**: AI 기반 상황별 최적 코디네이션 제안
- **🌏 글로벌 쇼핑**: 해외 브랜드 통합 구매 대행 서비스

## 🛠️ 기술 스택

### Frontend

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **애니메이션**: Framer Motion
- **상태관리**: Zustand
- **UI 컴포넌트**: shadcn/ui

### Backend

- **데이터베이스**: PostgreSQL
- **ORM**: Prisma
- **인증**: NextAuth.js (Google, Kakao)
- **결제**: Toss Payments API
- **AI 서비스**: 커스텀 가상 피팅 API

### DevOps & Tools

- **배포**: Apach
- **패키지 매니저**: npm
- **코드 품질**: ESLint, Prettier
- **타입 체킹**: TypeScript

## ✨ 주요 기능

### 🤖 AI 가상 피팅 시스템

- **실시간 가상 착용**: 사용자 사진에 의류를 실시간으로 합성
- **동영상 생성**: 정적 이미지를 동적 영상으로 변환 (PRO 기능)
- **진행률 표시**: 처리 과정을 시각적으로 표시하는 프로그레스 바
- **다중 아이템 지원**: 상의, 하의, 액세서리 동시 착용
- **포즈 및 핏 자동 조정**: AI가 체형에 맞는 자연스러운 착용감 구현

### 👤 회원 관리 시스템

- **소셜 로그인**: Google, Kakao 간편 로그인
- **게스트 주문**: 비회원도 주문 가능
- **프로필 관리**: 개인정보 수정 및 관리
- **주소록 관리**: 다중 배송지 등록 및 기본 주소 설정

### 🛒 상품 & 쇼핑

- **카테고리별 상품**: 상의, 하의, 아우터, 원피스 분류
- **배지 시스템**: BEST, NEW, 할인 등 상품 태그
- **스마트 검색**: 실시간 검색 및 필터링
- **특별 기획전**: BEST/NEW/추천 상품 큐레이션
- **연관 상품 추천**: AI 기반 개인화 추천

### 🛍️ 장바구니 & 주문

- **실시간 장바구니**: 즉시 반영되는 장바구니 시스템
- **옵션 변경**: 사이즈, 색상 등 옵션 실시간 변경
- **게스트 결제**: 회원가입 없이도 주문 가능
- **Toss Payments 연동**: 안전하고 빠른 결제 시스템

### 💳 결제 & 주문 관리

- **다양한 결제 수단**: 카드, 계좌이체, 간편결제
- **주문 내역 조회**: 실시간 주문 상태 확인
- **배송 추적**: 주문부터 배송완료까지 전 과정 추적
- **주문 취소/교환**: 간편한 주문 변경 시스템

### 🏆 리뷰 & 평가 시스템

- **별점 리뷰**: 5단계 별점 평가 시스템
- **리뷰 필터링**: 별점별, 최신순 정렬 및 필터
- **리뷰 통계**: 평균 별점 및 분포도 시각화
- **포토 리뷰**: 이미지와 함께하는 상세 리뷰

### 🌍 글로벌 쇼핑 서비스

- **해외 직구 대행**: 전 세계 브랜드 통합 주문
- **실시간 환율**: 자동 환율 적용 및 총 비용 계산
- **배송비 계산**: 상품별 정확한 해외 배송비 산출
- **통관 서비스**: 복잡한 통관 절차 대행

### 📱 마이페이지

- **주문 내역**: 전체 주문 이력 관리
- **쿠폰 관리**: 보유 쿠폰 및 사용 내역
- **최근 본 상품**: 개인화된 상품 히스토리
- **주소록**: 다중 배송지 관리

## 🗄️ 데이터베이스 스키마

### 👤 User (사용자)

```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  provider    String?   // google, kakao
  providerId  String?
  image       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // 관계
  orders      Order[]
  cartItems   CartItem[]
  addresses   Address[]
  reviews     Review[]
  userCoupons UserCoupon[]
}
```

### 🛍️ Product (상품)

```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  description String?
  price       Int
  imageUrl    String
  category    String
  badge       String?  // BEST, NEW, SALE 등
  stock       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 관계
  cartItems   CartItem[]
  orderItems  OrderItem[]
  reviews     Review[]
  images      ProductImage[]
}
```

### 🛒 Cart & Order (장바구니 & 주문)

```prisma
model CartItem {
  id        String @id @default(cuid())
  userId    String?
  productId String
  quantity  Int    @default(1)
  size      String?
  color     String?

  user      User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Order {
  id            String      @id @default(cuid())
  userId        String?
  guestEmail    String?     // 게스트 주문용
  totalAmount   Int
  status        OrderStatus @default(PENDING)
  createdAt     DateTime    @default(now())

  user          User?       @relation(fields: [userId], references: [id])
  orderItems    OrderItem[]
  payment       Payment?
}
```

### 💳 Payment (결제)

```prisma
model Payment {
  id              String        @id @default(cuid())
  orderId         String        @unique
  paymentKey      String?
  amount          Int
  method          String?
  status          PaymentStatus @default(PENDING)
  approvedAt      DateTime?

  order           Order         @relation(fields: [orderId], references: [id])
}
```

### 📍 Address (주소)

```prisma
model Address {
  id          String  @id @default(cuid())
  userId      String
  name        String
  phone       String
  address     String
  detailAddress String?
  zipCode     String
  isDefault   Boolean @default(false)

  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 📂 프로젝트 구조

```
bogofit-shop/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (Auth)/            # 인증 관련 페이지
│   │   ├── (Cart)/            # 장바구니 페이지
│   │   ├── (MyPage)/          # 마이페이지
│   │   ├── (Payment)/         # 결제 관련 페이지
│   │   ├── (Product)/         # 상품 관련 페이지
│   │   └── api/               # API Routes
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── about/            # About 페이지 컴포넌트
│   │   ├── auth/             # 인증 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── main/             # 메인 페이지 컴포넌트
│   │   ├── myPage/           # 마이페이지 컴포넌트
│   │   ├── payment/          # 결제 컴포넌트
│   │   ├── product/          # 상품 컴포넌트
│   │   └── ui/               # shadcn/ui 컴포넌트
│   ├── hooks/                # 커스텀 훅
│   ├── store/                # Zustand 상태 관리
│   ├── types/                # TypeScript 타입 정의
│   └── lib/                  # 유틸리티 함수
├── prisma/                   # Prisma 스키마 및 마이그레이션
└── public/                   # 정적 파일
```

## 🚀 현재 구현 상태

### ✅ 완료된 기능

#### 🔧 기본 인프라

- [x] Next.js 14 App Router 설정
- [x] TypeScript 전면 적용
- [x] Tailwind CSS + shadcn/ui 스타일링
- [x] Prisma ORM 및 PostgreSQL 연동
- [x] Framer Motion 애니메이션

#### 🔐 인증 시스템

- [x] NextAuth.js 소셜 로그인 (Google, Kakao)
- [x] 회원가입/로그인 플로우
- [x] 게스트 주문 지원
- [x] 세션 관리

#### 🛍️ 상품 시스템

- [x] 상품 목록 및 상세 페이지
- [x] 카테고리별 상품 분류
- [x] 상품 검색 및 필터링
- [x] 배지 시스템 (BEST, NEW 등)
- [x] 상품 이미지 다중 지원

#### 🤖 AI 가상 피팅

- [x] 실시간 이미지 생성
- [x] 동영상 변환 (PRO 기능)
- [x] 진행률 표시 시스템
- [x] 파일 업로드 및 검증
- [x] 샘플 이미지 제공

#### 🛒 쇼핑 기능

- [x] 실시간 장바구니 시스템
- [x] 상품 옵션 선택 (사이즈, 색상)
- [x] 주문 생성 및 관리
- [x] Toss Payments 결제 연동

#### 👤 사용자 기능

- [x] 마이페이지 (주문내역, 쿠폰, 주소록)
- [x] 다중 주소 관리
- [x] 최근 본 상품
- [x] 프로필 관리

#### ⭐ 리뷰 시스템

- [x] 별점 평가 시스템
- [x] 리뷰 작성 및 조회
- [x] 리뷰 통계 및 필터링
- [x] 평점 분포도 시각화

#### 🌍 추가 서비스

- [x] 글로벌 쇼핑 대행 서비스
- [x] 반응형 웹 디자인
- [x] 모바일 최적화
- [x] About 페이지 및 브랜딩

### 🔄 진행 중/예정 기능

#### 🎯 단기 목표

- [ ] 관리자 패널 구축
- [ ] 상품 재고 관리 시스템
- [ ] 쿠폰 시스템 고도화
- [ ] 배송 추적 시스템
- [ ] 알림 시스템 (이메일, 푸시)

#### 🚀 중장기 목표

- [ ] AI 스타일 추천 시스템
- [ ] 사용자 행동 분석
- [ ] A/B 테스트 시스템
- [ ] 다국어 지원
- [ ] 모바일 앱 개발

## 🛠️ 개발 환경 설정

### Prerequisites

```bash
Node.js 18.0.0 이상
PostgreSQL 14 이상
npm 또는 yarn
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

### 환경 변수

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
TOSS_PAYMENTS_SECRET_KEY="your-toss-secret"
```

## 📈 성능 및 최적화

- **Image Optimization**: Next.js Image 컴포넌트 활용
- **Code Splitting**: 페이지별 자동 코드 분할
- **Lazy Loading**: 컴포넌트 지연 로딩
- **Caching**: API 응답 캐싱 및 SWR 활용
- **Database Optimization**: Prisma 쿼리 최적화

## 🤝 기여 방법

1. 이 프로젝트를 Fork합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다
