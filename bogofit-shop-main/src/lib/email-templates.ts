import { render } from "@react-email/render";
import {
  VerificationEmail,
  VerificationEmailProps,
} from "@/components/emails/VerificationEmail";
import {
  PasswordResetEmail,
  PasswordResetEmailProps,
} from "@/components/emails/PasswordResetEmail";
import {
  WelcomeEmail,
  WelcomeEmailProps,
} from "@/components/emails/WelcomeEmail";
import {
  SignupVerificationEmail,
  SignupVerificationEmailProps,
} from "@/components/emails/SignupVerificationEmail";
import {
  EmailChangeVerificationEmail,
  EmailChangeVerificationEmailProps,
} from "@/components/emails/EmailChangeVerificationEmail";
import {
  AccountDeletionVerificationEmail,
  AccountDeletionVerificationEmailProps,
} from "@/components/emails/AccountDeletionVerificationEmail";
import {
  ProfileUpdateVerificationEmail,
  ProfileUpdateVerificationEmailProps,
} from "@/components/emails/ProfileUpdateVerificationEmail";
import {
  ExchangeRefundEmail,
  ExchangeRefundEmailProps,
} from "@/components/emails/ExchangeRefundEmail";

// 기존 인터페이스 호환성을 위한 타입 정의
export interface EmailTemplateData {
  userName: string;
  appUrl: string;
  supportEmail?: string;
}

export interface VerificationEmailData extends EmailTemplateData {
  verificationUrl: string;
  verificationCode: string;
}

export interface PasswordResetEmailData extends EmailTemplateData {
  temporaryPassword: string;
  userId: string;
  email: string;
}

// 새로운 이메일 타입 정의들
export interface SignupVerificationEmailData extends EmailTemplateData {
  verificationUrl: string;
  verificationCode: string;
}

export interface EmailChangeVerificationEmailData extends EmailTemplateData {
  verificationUrl: string;
  verificationCode: string;
  oldEmail: string;
  newEmail: string;
}

export interface AccountDeletionVerificationEmailData
  extends EmailTemplateData {
  verificationUrl: string;
  verificationCode: string;
  userId: string;
}

export interface ProfileUpdateVerificationEmailData extends EmailTemplateData {
  verificationUrl: string;
  verificationCode: string;
  updateType: string;
}

export interface ExchangeRefundEmailData extends EmailTemplateData {
  orderId: string;
  productTitle: string;
  amount: number;
  orderDate: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  requestType: "exchange" | "refund";
  reason: string;
  description: string;
}

// React Email 컴포넌트를 HTML 문자열로 렌더링하는 함수들

// 회원가입 인증 이메일 생성
export const generateVerificationEmail = async (
  data: VerificationEmailData
): Promise<string> => {
  const emailProps: VerificationEmailProps = {
    userName: data.userName,
    verificationUrl: data.verificationUrl,
    verificationCode: data.verificationCode,
    appUrl: data.appUrl,
  };

  return await render(VerificationEmail(emailProps));
};

// 비밀번호 초기화 이메일 생성
export const generatePasswordResetEmail = async (
  data: PasswordResetEmailData
): Promise<string> => {
  const emailProps: PasswordResetEmailProps = {
    userName: data.userName,
    temporaryPassword: data.temporaryPassword,
    userId: data.userId,
    email: data.email,
    appUrl: data.appUrl,
  };

  return await render(PasswordResetEmail(emailProps));
};

// 환영 이메일 생성
export const generateWelcomeEmail = async (
  data: EmailTemplateData
): Promise<string> => {
  const emailProps: WelcomeEmailProps = {
    userName: data.userName,
    appUrl: data.appUrl,
  };

  return await render(WelcomeEmail(emailProps));
};

// 회원가입 인증 이메일 생성
export const generateSignupVerificationEmail = async (
  data: SignupVerificationEmailData
): Promise<string> => {
  const emailProps: SignupVerificationEmailProps = {
    userName: data.userName,
    verificationUrl: data.verificationUrl,
    verificationCode: data.verificationCode,
    appUrl: data.appUrl,
  };

  return await render(SignupVerificationEmail(emailProps));
};

// 이메일 변경 인증 이메일 생성
export const generateEmailChangeVerificationEmail = async (
  data: EmailChangeVerificationEmailData
): Promise<string> => {
  const emailProps: EmailChangeVerificationEmailProps = {
    userName: data.userName,
    verificationUrl: data.verificationUrl,
    verificationCode: data.verificationCode,
    oldEmail: data.oldEmail,
    newEmail: data.newEmail,
    appUrl: data.appUrl,
  };

  return await render(EmailChangeVerificationEmail(emailProps));
};

// 계정 삭제 확인 이메일 생성
export const generateAccountDeletionVerificationEmail = async (
  data: AccountDeletionVerificationEmailData
): Promise<string> => {
  const emailProps: AccountDeletionVerificationEmailProps = {
    userName: data.userName,
    verificationUrl: data.verificationUrl,
    verificationCode: data.verificationCode,
    userId: data.userId,
    appUrl: data.appUrl,
  };

  return await render(AccountDeletionVerificationEmail(emailProps));
};

// 프로필 수정 인증 이메일 생성
export const generateProfileUpdateVerificationEmail = async (
  data: ProfileUpdateVerificationEmailData
): Promise<string> => {
  const emailProps: ProfileUpdateVerificationEmailProps = {
    userName: data.userName,
    verificationUrl: data.verificationUrl,
    verificationCode: data.verificationCode,
    updateType: data.updateType,
    appUrl: data.appUrl,
  };

  return await render(ProfileUpdateVerificationEmail(emailProps));
};

// 교환/반품 신청 이메일 생성
export const generateExchangeRefundEmail = async (
  data: ExchangeRefundEmailData
): Promise<string> => {
  const emailProps: ExchangeRefundEmailProps = {
    orderId: data.orderId,
    productTitle: data.productTitle,
    amount: data.amount,
    orderDate: data.orderDate,
    applicantName: data.applicantName,
    applicantPhone: data.applicantPhone,
    applicantEmail: data.applicantEmail,
    requestType: data.requestType,
    reason: data.reason,
    description: data.description,
    appUrl: data.appUrl,
  };

  return await render(ExchangeRefundEmail(emailProps));
};
