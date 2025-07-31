import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

// 개발용 이메일 테스트 API
export async function POST(request: NextRequest) {
  // 프로덕션에서는 비활성화
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Test endpoint not available in production" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, message: "Recipient email is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing email send to: ${to}`);

    // 개발 환경에서는 인증된 이메일로만 전송 가능
    const testEmail = "metabank3d@gmail.com";
    console.log(`⚠️ 개발 모드: ${to} → ${testEmail}로 전송`);

    const emailResult = await sendEmail({
      to: testEmail, // 개발용으로 고정
      subject: `🧪 Resend 테스트 이메일 (원래 수신자: ${to})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">🧪 Resend 테스트</h1>
          <p>안녕하세요!</p>
          <p>이 이메일은 Resend API 설정이 올바르게 작동하는지 확인하는 테스트 이메일입니다.</p>
          <p>이 이메일을 받으셨다면 Resend 설정이 정상적으로 완료되었습니다! 🎉</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            발송 시간: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
          </p>
        </div>
      `,
    });

    console.log(`🧪 Test email result:`, JSON.stringify(emailResult, null, 2));

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Test email failed to send",
          error: emailResult.error,
          resendError: emailResult.resendError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      emailId: emailResult.emailId,
      to,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test email API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
