# 🛍️ BogoFit Shop

## 📋 프로젝트 개요

BogoFit Shop은 **AI 가상 피팅 기술**을 중심으로 한 혁신적인 쇼핑몰 플랫폼입니다. 사용자가 실제로 옷을 입어보지 않고도 AI를 통해 가상으로 착용해볼 수 있는 차세대 온라인 쇼핑 경험을 제공합니다.

## 🎯 핵심 차별화 포인트

- **🤖 AI 가상 피팅**: 실시간 이미지 및 비디오 생성으로 실제 착용감 체험
- **🎬 동영상 패션 룩**: 움직임과 각도별 착용 모습 확인 가능
- **✨ TPO 스타일 추천**: AI 기반 상황별 최적 코디네이션 제안
- **🌏 글로벌 쇼핑**: 해외 브랜드 통합 구매 대행 서비스
- **📱 SMS 알림 시스템**: ALIGO API 연동을 통한 실시간 주문/배송 알림

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
- **SMS**: ALIGO API
- **AI 서비스**: 커스텀 가상 피팅 API

### 외부 연동

- **Cafe24**: OAuth 연동을 통한 쇼핑몰 상품 데이터 연동
- **AWS S3**: 이미지 저장소
- **AI 서버**: 가상 피팅 이미지/비디오 생성

## 📚 프로젝트 문서

### 🚀 시작하기

- **[개발 환경 설정 가이드](./DEVELOPMENT_SETUP.md)** - 로컬 개발 환경 구축
- **[환경 변수 설정 가이드](./ENVIRONMENT_VARIABLES.md)** - 필수/선택 환경 변수 설정

### 🏗️ 아키텍처 및 시스템

- **[데이터베이스 스키마 가이드](./DATABASE_SCHEMA.md)** - Prisma 스키마 및 ERD
- **[프로젝트 아키텍처](./ARCHITECTURE.md)** - 전체 시스템 구조
- **[API 문서](./API_DOCUMENTATION.md)** - REST API 엔드포인트 가이드

### 🔧 핵심 기능

- **[AI 가상 피팅 가이드](./AI_VIRTUAL_FITTING_GUIDE.md)** - AI 피팅 시스템 구현
- **[결제 시스템 가이드](./PAYMENT_SYSTEM_GUIDE.md)** - Toss Payments 연동
- **[인증 시스템 가이드](./AUTHENTICATION_GUIDE.md)** - NextAuth.js 소셜 로그인
- **[SMS API 가이드](./SMS_API_GUIDE.md)** - ALIGO SMS 연동

### 🛍️ 외부 서비스 연동

- **[Cafe24 연동 가이드](./CAFE24_SETUP.md)** - Cafe24 OAuth 설정
- **[AWS S3 CORS 설정](./AWS_S3_CORS_SETUP.md)** - 이미지 업로드 설정
- **[비즈니스 관리자 가이드](./BUSINESS_ADMIN_GUIDE.md)** - 브랜드 파트너 시스템

### 🚢 배포 및 운영

- **[배포 가이드](./DEPLOYMENT_GUIDE.md)** - 프로덕션 배포 방법
- **[기여자 가이드](./CONTRIBUTING.md)** - 프로젝트 기여 방법

## ⚡ 빠른 시작

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd bogofit-shop
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local 파일을 열어서 필요한 값들을 설정
```

자세한 환경 변수 설정은 **[환경 변수 가이드](./ENVIRONMENT_VARIABLES.md)**를 참조하세요.

### 3. 데이터베이스 설정

```bash
# PostgreSQL 데이터베이스 생성 후
npx prisma migrate dev
npx prisma generate
```

자세한 설정은 **[개발 환경 설정 가이드](./DEVELOPMENT_SETUP.md)**를 참조하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하여 확인하세요.

## 🎯 주요 기능 현황

### ✅ 구현 완료

- **🔐 인증 시스템**: Google, Kakao 소셜 로그인
- **🛍️ 상품 관리**: 카테고리별 상품, 검색, 필터링
- **🤖 AI 가상 피팅**: 실시간 이미지 생성, 동영상 변환
- **🛒 쇼핑 기능**: 장바구니, 주문, 결제 (Toss Payments)
- **📱 SMS 알림**: 주문 완료, 배송 시작, 회원가입 환영 SMS
- **👤 사용자 기능**: 마이페이지, 주문내역, 주소록 관리
- **⭐ 리뷰 시스템**: 별점 평가, 리뷰 작성 및 조회
- **🏷️ 브랜드 시스템**: 입점 브랜드 관리, 상품 승인 시스템
- **🌍 Cafe24 연동**: OAuth 연동을 통한 상품 데이터 동기화

### 🔄 진행 중

- **📊 분석 대시보드**: 브랜드별 매출 분석
- **💰 정산 시스템**: 브랜드별 자동 정산 처리
- **📧 이메일 알림**: 주문 상태 변경 알림

### 📅 계획 중

- **🎯 개인화 추천**: AI 기반 상품 추천 시스템
- **📈 A/B 테스트**: 실험 기반 UX 최적화
- **🌐 다국어 지원**: 글로벌 서비스 확장

## 🚀 주요 API 엔드포인트

| 카테고리      | 엔드포인트                           | 설명           |
| ------------- | ------------------------------------ | -------------- |
| **인증**      | `POST /api/auth/login`               | 소셜 로그인    |
| **상품**      | `GET /api/products`                  | 상품 목록 조회 |
| **장바구니**  | `POST /api/cart`                     | 장바구니 추가  |
| **주문**      | `POST /api/order`                    | 주문 생성      |
| **결제**      | `POST /api/confirm/payment`          | 결제 승인      |
| **SMS**       | `POST /api/sms/send`                 | SMS 발송       |
| **가상 피팅** | `POST /api/virtual-fitting/generate` | AI 피팅 생성   |

전체 API 문서는 **[API 문서](./API_DOCUMENTATION.md)**를 참조하세요.

## 🧪 테스트 및 개발 도구

### 개발 도구

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사
npm run type-check   # TypeScript 타입 체크
```

### 데이터베이스 관리

```bash
npx prisma studio    # 데이터베이스 GUI
npx prisma migrate dev   # 마이그레이션 실행
npx prisma generate  # Prisma Client 재생성
```

### 테스트 페이지

- **SMS 테스트**: `http://localhost:3000/test-sms`
- **API 문서**: `http://localhost:3000/api/docs/ui`

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면 **[기여자 가이드](./CONTRIBUTING.md)**를 먼저 읽어보세요.

### 기여 절차

1. 이 저장소를 Fork합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📞 지원 및 문의

### 기술 지원

- **개발 관련**: [개발 환경 설정 가이드](./DEVELOPMENT_SETUP.md)
- **API 문의**: [API 문서](./API_DOCUMENTATION.md)
- **배포 문의**: [배포 가이드](./DEPLOYMENT_GUIDE.md)

### 기능별 문의

- **AI 가상 피팅**: [AI 가상 피팅 가이드](./AI_VIRTUAL_FITTING_GUIDE.md)
- **결제 시스템**: [결제 시스템 가이드](./PAYMENT_SYSTEM_GUIDE.md)
- **SMS 알림**: [SMS API 가이드](./SMS_API_GUIDE.md)
- **Cafe24 연동**: [Cafe24 연동 가이드](./CAFE24_SETUP.md)

### 버그 리포트 및 기능 요청

GitHub Issues를 통해 버그 리포트나 기능 요청을 해주세요.

## 📝 라이선스

이 프로젝트는 [MIT 라이선스](./LICENSE) 하에 공개되어 있습니다.

---

## 🏆 프로젝트 하이라이트

### 🎨 현대적인 UI/UX

- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- **다크 모드**: 사용자 선호도에 따른 테마 전환
- **접근성**: WCAG 가이드라인 준수

### ⚡ 최적화된 성능

- **Next.js 14**: 최신 App Router 활용
- **Image Optimization**: 자동 이미지 최적화
- **코드 분할**: 페이지별 자동 코드 분할
- **캐싱**: API 응답 캐싱 및 SWR 활용

### 🔒 보안 강화

- **환경 변수 관리**: 민감한 정보 안전 보관
- **API 인증**: JWT 기반 인증 시스템
- **데이터 검증**: 입력값 검증 및 SQL 인젝션 방지
- **HTTPS**: 모든 데이터 전송 암호화

### 🌍 확장성 고려

- **마이크로서비스 아키텍처**: 기능별 독립적 확장 가능
- **외부 API 연동**: Cafe24, Toss Payments, ALIGO 등
- **국제화 준비**: 다국어 지원 기반 구조

---

**💡 더 자세한 정보는 각 문서를 참조하시고, 궁금한 점이 있으시면 언제든지 문의해주세요!**

**🚀 BogoFit Shop과 함께 혁신적인 쇼핑 경험을 만들어가세요!**
