# BogoFit Shop 기능 요약

## 1. 핵심 기능

### 1.1. AI 가상 피팅 (Virtual Fitting)

- **기능**: 사용자가 자신의 사진을 업로드하면, 선택한 상품을 가상으로 입어본 이미지를 생성합니다.
- **기술**: AI 이미지 생성 모델을 사용하여 실제와 유사한 착용 모습을 제공합니다.
- **경로**:
  - 가상 피팅 생성 API: `/api/virtual-fitting/generate` (외부 AI 서버로 프록시)
  - 관련 UI: 상품 상세 페이지 내 가상 피팅 섹션

### 1.2. 동영상 패션 룩 (Video Lookbook)

- **기능**: 모델이 실제로 움직이는 동영상을 통해 다양한 각도와 움직임에서의 옷의 핏을 확인할 수 있습니다.
- **구현**: 상품 상세 페이지에 동영상 플레이어를 임베드하여 제공합니다.

### 1.3. TPO 기반 스타일 추천 (Style Recommendation)

- **기능**: 시간(Time), 장소(Place), 상황(Occasion)에 맞는 상품을 추천하는 큐레이션 기능입니다.
- **구현**: 메인 페이지 및 상품 카테고리 페이지에서 관련 상품들을 그룹화하여 노출합니다.

### 1.4. 글로벌 쇼핑 (Global Shopping)

- **기능**: 해외 브랜드 상품을 국내에서 쉽게 구매할 수 있도록 하는 구매 대행 서비스를 제공합니다.
- **구현**: `prisma/schema.prisma`의 `Product` 모델에 `shippingType` (DOMESTIC/OVERSEAS) 필드를 두어 국내/해외 배송 상품을 구분합니다.

## 2. 사용자 기능

### 2.1. 인증 (Authentication)

- **기능**: Google, Kakao 소셜 로그인 및 로컬 계정 로그인을 지원합니다.
- **기술 변경**: JWT httpOnly 쿠키 기반 인증으로 통합. 로컬 DB 우선 로그인, GraphQL/OAuth 토큰 폴백.
- **플로우**:
  1. 로컬 DB에 사용자/비밀번호가 있으면 직접 로그인
  2. 없거나 비밀번호가 null이면 GraphQL/OAuth 토큰으로 로그인 시도 후 로컬 DB에 사용자 저장(비번 null)
  3. 이후 동일 사용자 로그인 시 비번 null이면 GraphQL/OAuth 플로우로 유도
- **주요 경로**:
  - 로그인 페이지: `src/app/(Auth)/login/page.tsx`
  - Google 콜백: `src/app/(Auth)/auth/callback/google/page.tsx`
  - Kakao 콜백: `src/app/(Auth)/auth/callback/kakao/page.tsx`
  - 로그인 API: `src/app/api/auth/login/route.ts`
  - 현재 사용자: `src/app/api/auth/me/route.ts`

### 2.2. 마이페이지 (MyPage)

- **기능**: 주문 내역 조회, 배송 상태 확인, 주소록 관리, 회원 정보 수정 등의 기능을 제공합니다.
- **경로**: `src/app/(MyPage)` 디렉토리 하위에 관련 페이지들이 위치합니다.

### 2.3. SMS 알림 (SMS Notification)

- **기능**: 회원가입, 주문 완료, 배송 시작 등 주요 이벤트 발생 시 사용자에게 SMS 알림을 발송합니다.
- **기술**: Aligo SMS API를 연동하여 구현합니다.
- **경로**:
  - SMS 발송 로직: `src/lib/aligo.ts`
  - 테스트 페이지: `src/app/test-sms/page.tsx`

## 3. 쇼핑 기능

### 3.1. 상품 (Product)

- **기능**: 카테고리별 상품 목록, 상품 상세 정보, 검색 및 필터링 기능을 제공합니다.
- **데이터베이스**: `Product`, `ProductVariant` 모델을 통해 상품 정보와 옵션(색상, 사이즈)을 관리합니다.
- **경로**: `src/app/(Product)` 디렉토리 하위에 관련 페이지들이 위치합니다.
- **UI 개선**: 상품 상세 페이지 다중 옵션 선택, 옵션별 가격 합산 및 요약 표시.

### 3.2. 장바구니 (Cart)

- **기능**: 원하는 상품을 장바구니에 담고, 수량을 조절하며, 주문할 상품을 선택할 수 있습니다.
- **데이터베이스**: `Cart`, `CartItem` 모델을 통해 사용자별 장바구니 정보를 관리합니다.
- **경로**: `src/app/(Cart)` 디렉토리 하위에 관련 페이지들이 위치합니다.

### 3.3. 주문 및 결제 (Order & Payment)

- **기능**: 장바구니의 상품을 주문하고, Toss Payments를 통해 결제를 진행합니다. 비회원 주문도 지원합니다.
- **기술**: `@tosspayments/payment-sdk`를 사용하여 결제 연동을 구현합니다.
- **데이터베이스**: `Order`, `OrderItem`, `Payment` 모델을 통해 주문 및 결제 정보를 관리합니다.
- **경로**: `src/app/(Payment)` 디렉토리 하위에 관련 페이지들이 위치합니다.

## 4. 비즈니스 기능 (입점사)

### 4.1. 브랜드 관리 (Brand Management)

- **기능**: 입점 브랜드(파트너)가 자신의 상품을 등록 및 관리하고, 주문 내역을 확인하며, 정산 정보를 관리할 수 있는 시스템입니다.
- **데이터베이스**: `Brand`, `Settlement`, `BrandAnalytics` 등의 모델을 통해 브랜드 관련 정보를 관리합니다.
- **경로**: `src/app/(Business)` 디렉토리 하위에 관련 페이지들이 위치합니다.

### 4.2. Cafe24 연동

- **기능**: Cafe24 쇼핑몰의 상품 데이터를 OAuth 인증을 통해 BogoFit Shop으로 가져올 수 있습니다.
- **기술**: Cafe24 API를 사용하여 상품 정보를 동기화합니다.
- **경로**:
  - 연동 관련 로직: `src/lib/cafe24.ts`
  - 연동 페이지: `src/app/cafe24/page.tsx`

## 5. 기술 스택 및 아키텍처

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS, shadcn/ui
- **상태 관리**: Zustand
- **데이터베이스**: PostgreSQL
- **ORM**: Prisma
- **인증**: JWT httpOnly 쿠키 (로컬 + GraphQL/OAuth 폴백)
- **결제**: Toss Payments
- **SMS**: Aligo API
- **이미지 저장소**: AWS S3
- **AI 서버**: 외부 AI 서버 (EC2)

프로젝트는 기능별로 모듈화되어 있으며, `src/app` 디렉토리의 라우팅 구조를 통해 각 기능이 명확하게 분리되어 있습니다. `src/lib` 디렉토리에는 핵심 비즈니스 로직이, `prisma` 디렉토리에는 데이터베이스 스키마가 정의되어 있습니다.
