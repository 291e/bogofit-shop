# AWS S3 버킷 설정 완전 가이드

## 🚀 1단계: S3 버킷 생성

### 1.1 AWS 콘솔 접속

1. [AWS S3 콘솔](https://s3.console.aws.amazon.com/) 접속
2. **"버킷 만들기"** 버튼 클릭

### 1.2 기본 설정

- **버킷 이름**: `bogofit-images` (또는 원하는 고유한 이름)
- **AWS 리전**: `아시아 태평양(서울) ap-northeast-2`

### 1.3 객체 소유권

- **객체 소유권**: `ACL 비활성화됨(권장)`

### 1.4 퍼블릭 액세스 차단 설정

```
✅ 모든 퍼블릭 액세스 차단 해제 (이미지 공개 접근을 위해)
⬜ 새 액세스 제어 목록(ACL)을 통해 부여된 버킷 및 객체에 대한 퍼블릭 액세스 차단
⬜ 임의의 액세스 제어 목록(ACL)을 통해 부여된 버킷 및 객체에 대한 퍼블릭 액세스 차단
⬜ 새 퍼블릭 버킷 또는 액세스 지점 정책을 통해 부여된 버킷 및 객체에 대한 퍼블릭 액세스 차단
⬜ 임의의 퍼블릭 버킷 또는 액세스 지점 정책을 통해 부여된 버킷 및 객체에 대한 퍼블릭 액세스 차단
```

### 1.5 버킷 버전 관리

- **버킷 버전 관리**: `비활성화` (비용 절약)

### 1.6 암호화

- **기본 암호화**: `Amazon S3 관리 키(SSE-S3)` 선택

### 1.7 버킷 생성 완료

- **"버킷 만들기"** 클릭

---

## 🔧 2단계: CORS 설정

### 2.1 CORS 설정 접근

1. 생성된 버킷 클릭
2. **"권한"** 탭 선택
3. **"CORS(Cross-origin resource sharing)"** 섹션 찾기
4. **"편집"** 버튼 클릭

### 2.2 CORS 규칙 입력

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://your-domain.com"
    ],
    "ExposeHeaders": ["ETag", "x-amz-meta-custom-header"],
    "MaxAgeSeconds": 3000
  }
]
```

### 2.3 CORS 저장

- **"변경 사항 저장"** 클릭

---

## 🔐 3단계: IAM 사용자 생성

### 3.1 IAM 콘솔 접속

1. [AWS IAM 콘솔](https://console.aws.amazon.com/iam/) 접속
2. **"사용자"** → **"사용자 추가"** 클릭

### 3.2 사용자 정보

- **사용자 이름**: `bogofit-s3-user`
- **액세스 유형**: `프로그래밍 방식 액세스` 선택

### 3.3 권한 설정

**옵션 1: 기존 정책 직접 연결**

- `AmazonS3FullAccess` 선택 (개발용)

**옵션 2: 사용자 지정 정책 (권장)**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::bogofit-images/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::bogofit-images"
    }
  ]
}
```

### 3.4 액세스 키 생성

1. 사용자 생성 완료 후 **액세스 키 ID**와 **비밀 액세스 키** 저장
2. **⚠️ 중요**: 비밀 키는 다시 볼 수 없으므로 안전한 곳에 보관

---

## 📁 4단계: 버킷 정책 설정 (선택사항)

### 4.1 퍼블릭 읽기 권한 (이미지 공개 접근용)

1. 버킷 → **"권한"** → **"버킷 정책"**
2. 다음 정책 입력:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bogofit-images/*"
    }
  ]
}
```

---

## 🌍 5단계: 환경 변수 설정

### 5.1 `.env.local` 파일 생성/수정

```bash
# AWS S3 설정
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=AKIA...  # IAM 사용자 액세스 키
AWS_SECRET_ACCESS_KEY=...  # IAM 사용자 비밀 키
AWS_S3_BUCKET=bogofit-images
```

### 5.2 `.env.example` 파일 업데이트

```bash
# AWS S3 설정 (실제 값은 .env.local에 설정)
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=your_bucket_name_here
```

---

## ✅ 6단계: 테스트

### 6.1 업로드 테스트

1. 상품 등록 페이지에서 이미지 업로드 시도
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. S3 콘솔에서 업로드된 파일 확인

### 6.2 접근 테스트

- 업로드된 이미지 URL로 직접 접근하여 이미지 표시 확인

---

## 🚨 보안 주의사항

### 7.1 프로덕션 환경

- **CORS Origins**: 실제 도메인으로 변경
- **IAM 권한**: 최소 권한 원칙 적용
- **버킷 정책**: 필요한 경우에만 퍼블릭 액세스 허용

### 7.2 비용 관리

- **수명 주기 정책**: 오래된 파일 자동 삭제
- **스토리지 클래스**: 적절한 스토리지 클래스 선택

### 7.3 모니터링

- **CloudTrail**: API 호출 로깅
- **CloudWatch**: 사용량 모니터링

---

## 🔍 문제 해결

### CORS 오류 발생 시

1. CORS 설정 재확인
2. 브라우저 캐시 삭제
3. Origins에 현재 도메인 포함 여부 확인

### 업로드 실패 시

1. IAM 권한 확인
2. 버킷 정책 확인
3. 환경 변수 확인
4. 파일 크기 제한 확인

### 이미지 접근 불가 시

1. 퍼블릭 액세스 차단 설정 확인
2. 버킷 정책 확인
3. 파일 업로드 완료 여부 확인

---

**✅ 이 가이드를 따라하면 S3 이미지 업로드가 정상 작동합니다!** 🎉
