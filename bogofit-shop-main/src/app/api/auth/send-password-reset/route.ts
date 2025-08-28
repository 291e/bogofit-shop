import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { generatePasswordResetEmail } from "@/lib/email-templates";

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

    // 비밀번호 초기화는 GraphQL 뮤테이션에서 처리
    // 여기서는 단순히 이메일만 전송
    console.log(`Password reset email requested for user: ${userId}`);

    // 이메일 템플릿 데이터 준비
    const emailData = {
      userName: userId, // TODO: 실제 사용자 이름으로 교체
      appUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      temporaryPassword: "0000", // 뮤테이션 실행 후 설정될 비밀번호
      userId,
      email,
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

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Send password reset email error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
