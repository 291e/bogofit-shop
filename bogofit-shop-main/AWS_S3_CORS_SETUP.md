# S3 CORS 설정 가이드

## AWS S3 콘솔에서 CORS 설정

1. **AWS S3 콘솔 접속**

   - https://s3.console.aws.amazon.com/

2. **버킷 선택**

   - `bogofit-images` 버킷 클릭

3. **권한 탭 → CORS 설정**

   - "권한" 탭 클릭
   - "CORS(Cross-origin resource sharing)" 섹션 찾기
   - "편집" 버튼 클릭

4. **CORS 규칙 추가**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. **변경 사항 저장**

## 환경 변수 설정

`.env.local` 파일에 AWS 설정 추가:

```bash
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=bogofit-images
```

## 주의사항

- 개발 환경: `http://localhost:3000`
- 프로덕션 환경: 실제 도메인으로 변경 필요
- AWS 키는 보안상 IAM 사용자로 제한된 권한만 부여
