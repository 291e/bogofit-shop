# 🛠️ 개발 환경 설정 가이드

## 📋 개요

이 가이드는 BogoFit Shop 프로젝트의 로컬 개발 환경을 설정하는 방법을 설명합니다.

## 🔧 시스템 요구사항

### Prerequisites

```bash
Node.js 18.0.0 이상
PostgreSQL 14 이상
npm 또는 yarn
Git
```

### 권장 개발 도구

- **IDE**: Visual Studio Code
- **확장 프로그램**:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Prisma
  - ESLint
  - Prettier

## 🚀 프로젝트 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd bogofit-shop
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
# 환경 변수 파일 복사
cp .env.example .env.local
```

`.env.local` 파일을 열어서 필요한 값들을 설정하세요. 자세한 내용은 [환경 변수 가이드](./ENVIRONMENT_VARIABLES.md)를 참조하세요.

### 4. 데이터베이스 설정

#### PostgreSQL 설치 및 실행

**Windows (using chocolatey):**

```bash
choco install postgresql
```

**macOS (using homebrew):**

```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 데이터베이스 생성

```bash
# PostgreSQL에 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE bogofit_shop;

# 사용자 생성 (선택사항)
CREATE USER bogofit_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bogofit_shop TO bogofit_user;

# 연결 종료
\q
```

#### Prisma 설정

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev

# Prisma Client 생성
npx prisma generate

# (선택사항) 샘플 데이터 시딩
npx prisma db seed
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하여 애플리케이션이 정상적으로 실행되는지 확인하세요.

## 🔍 개발 도구 설정

### ESLint & Prettier

프로젝트에는 ESLint와 Prettier가 미리 설정되어 있습니다.

```bash
# 코드 린팅
npm run lint

# 코드 포맷팅
npm run format
```

### Git Hooks (Husky)

커밋 전 자동 린팅/포맷팅을 위해 Husky가 설정되어 있습니다.

```bash
# Husky 설치 (이미 package.json에 포함됨)
npx husky install
```

### TypeScript 컴파일 확인

```bash
# TypeScript 타입 체크
npm run type-check
```

## 📁 개발 중 주요 명령어

### 데이터베이스 관련

```bash
# Prisma Studio 실행 (데이터베이스 GUI)
npx prisma studio

# 데이터베이스 리셋
npx prisma migrate reset

# 스키마 변경 후 마이그레이션
npx prisma migrate dev --name your_migration_name

# Prisma Client 재생성
npx prisma generate
```

### 빌드 및 테스트

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 실행
npm start

# 테스트 실행 (설정된 경우)
npm test
```

### 프로젝트 정리

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# Next.js 캐시 정리
npm run clean
# 또는
rm -rf .next
```

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌 (Port already in use)

```bash
# 포트 3000을 사용 중인 프로세스 확인
lsof -ti:3000

# 프로세스 종료
kill -9 <PID>

# 또는 다른 포트 사용
npm run dev -- -p 3001
```

#### 2. Prisma 연결 오류

```bash
# 데이터베이스 연결 확인
npx prisma db pull

# 마이그레이션 상태 확인
npx prisma migrate status
```

#### 3. 환경 변수 오류

- `.env` 파일이 올바른 위치(프로젝트 루트)에 있는지 확인
- 환경 변수 이름에 오타가 없는지 확인
- `NEXT_PUBLIC_` 접두사가 필요한 변수인지 확인

#### 4. Node.js 버전 문제

```bash
# 현재 Node.js 버전 확인
node --version

# nvm 사용 시 올바른 버전으로 전환
nvm use 18
```

### 로그 확인

개발 중 문제가 발생하면 다음 로그들을 확인하세요:

- **브라우저 콘솔**: F12 → Console 탭
- **터미널 로그**: 개발 서버 실행 중인 터미널
- **Prisma 로그**: 데이터베이스 쿼리 로그
- **Next.js 로그**: `.next` 폴더의 빌드 로그

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

## 🤝 개발 팀 규칙

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `bugfix/*`: 버그 수정 브랜치

### 커밋 메시지 규칙

```
type(scope): subject

feat(auth): 소셜 로그인 기능 추가
fix(cart): 장바구니 수량 업데이트 버그 수정
docs(readme): 설치 가이드 업데이트
style(ui): 버튼 컴포넌트 스타일 개선
refactor(api): 상품 API 구조 개선
test(auth): 로그인 테스트 케이스 추가
```

### 코드 스타일

- **TypeScript**: 모든 파일은 TypeScript로 작성
- **함수형 컴포넌트**: 클래스 컴포넌트 사용 금지
- **camelCase**: 파일명, 함수명, 변수명 모두 camelCase
- **명시적 타입**: `any` 타입 사용 금지

---

**💡 도움이 필요하시면 팀 채널에서 언제든지 문의하세요!**
