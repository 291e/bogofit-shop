import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { generateWelcomeEmail } from "@/lib/email-templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userName } = body;

    // 필수 필드 검증
    if (!email || !userName) {
      return NextResponse.json(
        { success: false, message: "Email and user name are required" },
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

    // TODO: 사용자가 실제로 존재하고 인증된 상태인지 확인
    // 예시:
    // const user = await getUserByEmail(email);
    // if (!user || !user.isVerified) {
    //   return NextResponse.json(
    //     { success: false, message: "User not found or not verified" },
    //     { status: 404 }
    //   );
    // }

    // 이메일 템플릿 데이터 준비
    const emailData = {
      userName,
      appUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      supportEmail: "bogofit@naver.com",
    };

    // 이메일 전송
    const emailResult = await sendEmail({
      to: email,
      subject: "🎉 BogoFit Shop에 오신 것을 환영합니다!",
      html: await generateWelcomeEmail(emailData),
    });

    if (!emailResult.success) {
      console.error("Failed to send welcome email:", emailResult.error);
      return NextResponse.json(
        { success: false, message: "Failed to send welcome email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully",
    });
  } catch (error) {
    console.error("Send welcome email error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
