import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// 기본 이메일 설정
export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev", // 도메인 인증 후 변경 필요
  fromName: process.env.RESEND_FROM_NAME || "BogoFit Shop",
} as const;

// 이메일 전송 헬퍼 함수
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  react,
}: SendEmailOptions) => {
  try {
    const fromEmail = `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`;
    console.log(`📬 Sending email from: ${fromEmail}`);
    console.log(
      `📩 Sending email to: ${Array.isArray(to) ? to.join(", ") : to}`
    );
    console.log(`📋 Subject: ${subject}`);

    const result = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      react,
    });

    console.log(`✅ Resend API 응답:`, result);

    // Resend API가 성공했는지 확인
    if (result.data) {
      console.log(`📧 Email ID: ${result.data.id}`);
      return {
        success: true,
        data: result.data,
        emailId: result.data.id,
      };
    } else if (result.error) {
      console.error(`❌ Resend API 에러:`, result.error);
      return {
        success: false,
        error: result.error.message || "Resend API error",
        resendError: result.error,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
