// React Email 개발용 미리보기 파일
// 이 파일은 react-email preview를 위한 것입니다.

export { VerificationEmail } from "../src/components/emails/VerificationEmail";
export { PasswordResetEmail } from "../src/components/emails/PasswordResetEmail";
export { WelcomeEmail } from "../src/components/emails/WelcomeEmail";
export { BaseEmail } from "../src/components/emails/BaseEmail";

// 미리보기용 샘플 데이터
export const verificationEmailProps = {
  userName: "홍길동",
  verificationUrl:
    "https://bogofit.com/verify-email?code=ABC123&email=test@example.com",
  verificationCode: "ABC123",
  appUrl: "https://bogofit.com",
};

export const passwordResetEmailProps = {
  userName: "홍길동",
  temporaryPassword: "TempPass123",
  userId: "honggildong",
  appUrl: "https://bogofit.com",
};

export const welcomeEmailProps = {
  userName: "홍길동",
  appUrl: "https://bogofit.com",
};
