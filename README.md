# BogoFit Shop

## 프로젝트 개요

BogoFit Shop은 Next.js 14와 Prisma를 활용한 현대적인 쇼핑몰 플랫폼입니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: PostgreSQL
- **ORM**: Prisma
- **인증**: NextAuth.js
- **결제**: Toss Payments
- **배포**: Vercel

## 주요 기능

1. **회원 관리**

   - 소셜 로그인 (Google, Kakao)
   - 회원가입/로그인
   - 프로필 관리
   - 주소 관리

2. **상품 관리**

   - 상품 등록/수정/삭제
   - 상품 옵션 관리
   - 상품 검색 및 필터링
   - 연관 추천
   - 검색·필터 고급화

3. **장바구니**

   - 장바구니 담기
   - 수량 변경
   - 옵션 변경
   - 장바구니 비우기

4. **주문/결제**

   - 주문 생성
   - 결제 처리 (Toss Payments)
   - 주문 내역 조회
   - 주문 상태 관리

5. **쿠폰 시스템**

   - 쿠폰 발급
   - 쿠폰 사용
   - 쿠폰 관리

6. **리뷰 시스템**
   - 상품 리뷰 작성
   - 리뷰 관리
   - 평점 시스템

## 데이터베이스 스키마

### User

- 기본 회원 정보
- 소셜 로그인 연동
- 주소 관리
- 장바구니
- 주문 내역
- 리뷰
- 쿠폰

### Product

- 상품 기본 정보
- 상품 옵션 (ProductVariant)
- 재고 관리
- 리뷰 연동

### Cart

- 장바구니 아이템 관리
- 상품 옵션 연동
- 수량 관리

### Order

- 주문 정보
- 결제 정보
- 쿠폰 사용
- 주문 상태 관리

### Coupon

- 쿠폰 정보
- 사용자별 쿠폰 발급
- 쿠폰 사용 내역

## 섹션별 작업 계획

### 1. 기본 설정 및 인증 (1주)

- [x] Next.js 14 프로젝트 설정
- [x] Prisma 설정
- [x] Tailwind CSS 설정
- [ ] NextAuth.js 설정
- [ ] 소셜 로그인 구현

### 2. 회원 관리 (1주)

- [ ] 회원가입/로그인 페이지
- [ ] 프로필 관리
- [ ] 주소 관리
- [ ] 소셜 로그인 연동

### 3. 상품 관리 (2주)

- [ ] 상품 등록/수정/삭제
- [ ] 상품 옵션 관리
- [ ] 재고 관리
- [ ] 상품 검색/필터링

### 4. 장바구니 (1주)

- [ ] 장바구니 기능
- [ ] 수량/옵션 변경
- [ ] 장바구니 UI

### 5. 주문/결제 (2주)

- [ ] 주문 프로세스
- [ ] Toss Payments 연동
- [ ] 주문 내역 관리
- [ ] 주문 상태 관리

### 6. 쿠폰 시스템 (1주)

- [ ] 쿠폰 발급
- [ ] 쿠폰 사용
- [ ] 쿠폰 관리

### 7. 리뷰 시스템 (1주)

- [ ] 리뷰 작성
- [ ] 리뷰 관리
- [ ] 평점 시스템

### 8. UI/UX 개선 (1주)

- [ ] 반응형 디자인
- [ ] 성능 최적화
- [ ] 접근성 개선

### 9. 테스트 및 배포 (1주)

- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] Vercel 배포
- [ ] 모니터링 설정

## 시작하기

1. 저장소 클론

```bash
git clone https://github.com/yourusername/bogofit-shop.git
cd bogofit-shop
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

```bash
cp .env.example .env
```

4. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

5. 개발 서버 실행

```bash
npm run dev
```

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

MIT License
