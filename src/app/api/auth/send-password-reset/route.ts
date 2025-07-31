import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { generatePasswordResetEmail } from "@/lib/email-templates";

// 임시 비밀번호 생성 함수
function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

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

    // 임시 비밀번호 생성
    const temporaryPassword = generateTemporaryPassword();

    // TODO: 데이터베이스에서 사용자 비밀번호 업데이트
    // 예시:
    // const hashedPassword = await hashPassword(temporaryPassword);
    // await updateUserPassword(userId, hashedPassword);
    //
    // 또는 비밀번호 재설정 토큰 방식:
    // const resetToken = generateResetToken();
    // await savePasswordResetToken(userId, resetToken, expiresAt);

    console.log(
      `Generated temporary password for ${userId}: ${temporaryPassword}`
    );

    // 이메일 템플릿 데이터 준비
    const emailData = {
      userName: userId, // TODO: 실제 사용자 이름으로 교체
      appUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      temporaryPassword,
      userId,
      supportEmail: "bogofit@naver.com",
    };

    // 이메일 전송
    const emailResult = await sendEmail({
      to: email,
      subject: "BogoFit Shop - 비밀번호가 초기화되었습니다",
      html: await generatePasswordResetEmail(emailData),
    });

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      return NextResponse.json(
        { success: false, message: "Failed to send password reset email" },
        { status: 500 }
      );
    }

    // TODO: 보안 로그 기록
    // 예: await logSecurityEvent('password_reset', userId, request.ip);

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully",
      // 보안상 임시 비밀번호는 응답에 포함하지 않음
    });
  } catch (error) {
    console.error("Send password reset email error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
