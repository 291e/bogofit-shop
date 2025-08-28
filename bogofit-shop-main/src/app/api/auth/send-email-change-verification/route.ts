import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { generateEmailChangeVerificationEmail } from "@/lib/email-templates";
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
    type: "email-change",
  });
  return `${baseUrl}/verify-email?${params.toString()}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log("📧 Email change verification request received");

    // 환경변수 확인
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is not set");
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, oldEmail, newEmail, userName } = body;
    console.log(
      `📧 Email change request: ${userId}, ${oldEmail} → ${newEmail}`
    );

    // 필수 필드 검증
    if (!userId || !oldEmail || !newEmail || !userName) {
      return NextResponse.json(
        {
          success: false,
          message: "UserId, oldEmail, newEmail, and userName are required",
        },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid new email format" },
        { status: 400 }
      );
    }

    // 같은 이메일 확인
    if (oldEmail === newEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "New email must be different from current email",
        },
        { status: 400 }
      );
    }

    // TODO: 데이터베이스에서 사용자 확인 및 새 이메일 중복 확인
    // 예시:
    // const user = await getUserByUserId(userId);
    // if (!user || user.email !== oldEmail) {
    //   return NextResponse.json(
    //     { success: false, message: "Invalid user credentials" },
    //     { status: 404 }
    //   );
    // }
    // const existingUser = await getUserByEmail(newEmail);
    // if (existingUser) {
    //   return NextResponse.json(
    //     { success: false, message: "New email already exists" },
    //     { status: 409 }
    //   );
    // }

    // 인증 코드 및 URL 생성
    const verificationCode = generateVerificationCode();
    const verificationUrl = generateVerificationUrl(newEmail, verificationCode);

    // 인증 코드를 저장소에 저장 (새 이메일 주소로 저장, 메타데이터에 추가 정보)
    verificationStore.saveCode(
      newEmail,
      verificationCode,
      userId,
      "email-change",
      { oldEmail, newEmail } // 메타데이터로 이메일 변경 정보 저장
    );

    // 개발 환경에서는 도메인 인증된 이메일로만 전송 가능
    const devEmail = "metabank3d@gmail.com";
    const actualRecipient =
      process.env.NODE_ENV === "development" ? devEmail : newEmail;

    if (process.env.NODE_ENV === "development" && newEmail !== devEmail) {
      console.log(`⚠️ 개발 모드: ${newEmail} → ${devEmail}로 전송`);
    }

    // 이메일 템플릿 데이터 준비
    const emailData = {
      userName,
      appUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      verificationUrl,
      verificationCode,
      oldEmail,
      newEmail,
      supportEmail: "bogofit@naver.com",
    };

    console.log(
      `📨 Attempting to send email change verification to: ${actualRecipient}`
    );
    console.log(`🔑 Using verification code: ${verificationCode}`);

    // 이메일 전송 (새 이메일 주소로)
    const emailResult = await sendEmail({
      to: actualRecipient,
      subject:
        process.env.NODE_ENV === "development"
          ? `🔄 BogoFit Shop - 이메일 변경 인증 (원래 수신자: ${newEmail})`
          : "🔄 BogoFit Shop - 이메일 주소 변경 인증이 필요합니다",
      html: await generateEmailChangeVerificationEmail(emailData),
    });

    console.log(`📤 Email result:`, JSON.stringify(emailResult, null, 2));

    if (!emailResult.success) {
      console.error(
        "❌ Failed to send email change verification:",
        emailResult.error
      );
      console.error("❌ Resend error details:", emailResult.resendError);

      // 실패 시 저장된 인증번호 삭제
      verificationStore.deleteCode(newEmail, "email-change");
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
      `✅ Email change verification sent successfully to: ${actualRecipient}`
    );
    console.log(`📧 Email ID: ${emailResult.emailId}`);

    return NextResponse.json({
      success: true,
      message: "Email change verification sent successfully",
      targetEmail: newEmail, // 클라이언트에서 어디로 보냈는지 알 수 있도록
    });
  } catch (error) {
    console.error("Send email change verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
