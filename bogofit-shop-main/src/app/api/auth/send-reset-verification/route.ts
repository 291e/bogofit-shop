import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { generateVerificationEmail } from "@/lib/email-templates";
import { verificationStore } from "@/lib/verification-store";

// 인증 코드 생성 함수
function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 인증 URL 생성 함수 (비밀번호 초기화용)
function generateVerificationUrl(email: string, code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const params = new URLSearchParams({
    email: encodeURIComponent(email),
    code,
    type: "password-reset", // 비밀번호 초기화용임을 구분
  });
  return `${baseUrl}/verify-reset?${params.toString()}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Password reset verification request received");

    // 환경변수 확인
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is not set");
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, email } = body;
    console.log(`📧 Request for userId: ${userId}, email: ${email}`);

    // 필수 필드 검증
    if (!userId || !email) {
      return NextResponse.json(
        { success: false, message: "User ID and email are required" },
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
      "password-reset"
    );

    // 이메일 템플릿 데이터 준비
    const emailData = {
      userName: userId, // TODO: 실제 사용자 이름으로 교체
      appUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      verificationUrl,
      verificationCode,
      supportEmail: "bogofit@naver.com",
    };

    // 이메일 제목을 비밀번호 초기화용으로 변경
    console.log(`📨 Attempting to send email to: ${email}`);
    console.log(`🔑 Using verification code: ${verificationCode}`);

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

    const emailResult = await sendEmail({
      to: actualRecipient,
      subject: isDomainVerified
        ? "BogoFit Shop - 비밀번호 초기화 인증번호입니다"
        : `BogoFit Shop - 비밀번호 초기화 인증번호 (원래 수신자: ${email})`,
      html: await generateVerificationEmail(emailData),
    });

    console.log(`📤 Email result:`, JSON.stringify(emailResult, null, 2));

    if (!emailResult.success) {
      console.error(
        "❌ Failed to send reset verification email:",
        emailResult.error
      );
      console.error("❌ Resend error details:", emailResult.resendError);

      // 실패 시 저장된 인증번호 삭제
      verificationStore.deleteCode(email, "password-reset");
      return NextResponse.json(
        {
          success: false,
          message: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.",
          error: emailResult.error,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Verification email sent successfully to: ${email}`);
    console.log(`📧 Email ID: ${emailResult.emailId}`);

    return NextResponse.json({
      success: true,
      message: "Reset verification email sent successfully",
      // 보안상 인증 코드는 응답에 포함하지 않음
    });
  } catch (error) {
    console.error("Send reset verification email error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
