import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { generateAccountDeletionVerificationEmail } from "@/lib/email-templates";
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
    type: "account-deletion",
  });
  return `${baseUrl}/verify-email?${params.toString()}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🗑️ Account deletion verification request received");

    // 환경변수 확인
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is not set");
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, email, userName } = body;
    console.log(`🗑️ Account deletion request for: ${userId}, ${email}`);

    // 필수 필드 검증
    if (!userId || !email || !userName) {
      return NextResponse.json(
        { success: false, message: "UserId, email, and userName are required" },
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

    // TODO: 데이터베이스에서 사용자 확인
    // 예시:
    // const user = await getUserByUserIdAndEmail(userId, email);
    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, message: "User not found with provided credentials" },
    //     { status: 404 }
    //   );
    // }

    // 인증 코드 및 URL 생성
    const verificationCode = generateVerificationCode();
    const verificationUrl = generateVerificationUrl(email, verificationCode);

    // 인증 코드를 저장소에 저장
    verificationStore.saveCode(
      email,
      verificationCode,
      userId,
      "account-deletion"
    );

    // 개발 환경에서는 도메인 인증된 이메일로만 전송 가능
    const devEmail = "metabank3d@gmail.com";
    const actualRecipient =
      process.env.NODE_ENV === "development" ? devEmail : email;

    if (process.env.NODE_ENV === "development" && email !== devEmail) {
      console.log(`⚠️ 개발 모드: ${email} → ${devEmail}로 전송`);
    }

    // 이메일 템플릿 데이터 준비
    const emailData = {
      userName,
      appUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      verificationUrl,
      verificationCode,
      userId,
      supportEmail: "bogofit@naver.com",
    };

    console.log(
      `📨 Attempting to send account deletion verification to: ${actualRecipient}`
    );
    console.log(`🔑 Using verification code: ${verificationCode}`);

    // 이메일 전송
    const emailResult = await sendEmail({
      to: actualRecipient,
      subject:
        process.env.NODE_ENV === "development"
          ? `⚠️ BogoFit Shop - 계정 삭제 확인 (원래 수신자: ${email})`
          : "⚠️ BogoFit Shop - 계정 삭제 확인이 필요합니다",
      html: await generateAccountDeletionVerificationEmail(emailData),
    });

    console.log(`📤 Email result:`, JSON.stringify(emailResult, null, 2));

    if (!emailResult.success) {
      console.error(
        "❌ Failed to send account deletion verification:",
        emailResult.error
      );
      console.error("❌ Resend error details:", emailResult.resendError);

      // 실패 시 저장된 인증번호 삭제
      verificationStore.deleteCode(email, "account-deletion");
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
      `✅ Account deletion verification sent successfully to: ${actualRecipient}`
    );
    console.log(`📧 Email ID: ${emailResult.emailId}`);

    return NextResponse.json({
      success: true,
      message: "Account deletion verification sent successfully",
      // 보안상 추가 정보는 포함하지 않음
    });
  } catch (error) {
    console.error("Send account deletion verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
