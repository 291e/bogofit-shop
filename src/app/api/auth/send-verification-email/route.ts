import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { generateSignupVerificationEmail } from "@/lib/email-templates";
import { verificationStore } from "@/lib/verification-store";

// 인증 코드 생성 함수
function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 인증 URL 생성 함수
function generateVerificationUrl(email: string, code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const params = new URLSearchParams({
    email: encodeURIComponent(email),
    code,
  });
  return `${baseUrl}/verify-email?${params.toString()}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log("📧 Signup verification request received");

    // 환경변수 확인
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is not set");
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, userName, userId } = body;
    console.log(
      `📧 Signup request for userName: ${userName}, email: ${email}, userId: ${userId}`
    );

    // 필수 필드 검증
    if (!email || !userName || !userId) {
      return NextResponse.json(
        { success: false, message: "Email, userName, and userId are required" },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // TODO: 데이터베이스에서 이메일 중복 확인
    // 예시:
    // const existingUser = await getUserByEmail(email);
    // if (existingUser) {
    //   return NextResponse.json(
    //     { success: false, message: "Email already exists" },
    //     { status: 409 }
    //   );
    // }

    // 인증 코드 및 URL 생성
    const verificationCode = generateVerificationCode();
    const verificationUrl = generateVerificationUrl(email, verificationCode);

    // 인증 코드를 저장소에 저장
    verificationStore.saveCode(email, verificationCode, userId, "signup");

    // 도메인 인증 상태에 따른 이메일 전송 설정
    const isDomainVerified = process.env.RESEND_DOMAIN_VERIFIED === "true";
    const fallbackEmail = "metabank3d@gmail.com";
    const actualRecipient = isDomainVerified ? email : fallbackEmail;

    if (!isDomainVerified && email !== fallbackEmail) {
      console.log(`⚠️ 도메인 미인증: ${email} → ${fallbackEmail}로 전송`);
      console.log(
        `💡 도메인 인증 완료 후 RESEND_DOMAIN_VERIFIED=true 설정하세요`
      );
    } else if (isDomainVerified) {
      console.log(`✅ 도메인 인증됨: ${email}로 직접 전송`);
    }

    // 이메일 템플릿 데이터 준비
    const emailData = {
      userName,
      appUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      verificationUrl,
      verificationCode,
      supportEmail: "bogofit@naver.com",
    };

    console.log(
      `📨 Attempting to send signup verification email to: ${actualRecipient}`
    );
    console.log(`🔑 Using verification code: ${verificationCode}`);

    // 이메일 전송
    const emailResult = await sendEmail({
      to: actualRecipient,
      subject: isDomainVerified
        ? "🎉 BogoFit Shop - 회원가입 인증을 완료해 주세요"
        : `🎉 BogoFit Shop - 회원가입 인증 (원래 수신자: ${email})`,
      html: await generateSignupVerificationEmail(emailData),
    });

    console.log(`📤 Email result:`, JSON.stringify(emailResult, null, 2));

    // 🔍 이메일 전송 후 Store 상태 확인
    console.log(`🔍 [AFTER EMAIL SENT] Store debug:`);
    verificationStore.debugStore();

    if (!emailResult.success) {
      console.error(
        "❌ Failed to send signup verification email:",
        emailResult.error
      );
      console.error("❌ Resend error details:", emailResult.resendError);

      // 실패 시 저장된 인증번호 삭제
      verificationStore.deleteCode(email, "signup");
      return NextResponse.json(
        {
          success: false,
          message: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.",
          error: emailResult.error,
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ Signup verification email sent successfully to: ${actualRecipient}`
    );
    console.log(`📧 Email ID: ${emailResult.emailId}`);

    return NextResponse.json({
      success: true,
      message: "Signup verification email sent successfully",
      // 보안상 인증 코드는 응답에 포함하지 않음
    });
  } catch (error) {
    console.error("Send verification email error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
