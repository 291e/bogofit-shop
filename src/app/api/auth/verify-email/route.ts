import { NextRequest, NextResponse } from "next/server";
import { verificationStore, VerificationType } from "@/lib/verification-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, type = "password-reset" } = body;

    // 필수 필드 검증
    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // 인증 타입 검증
    const validTypes: VerificationType[] = [
      "signup",
      "password-reset",
      "email-change",
      "account-deletion",
      "profile-update",
    ];
    if (!validTypes.includes(type as VerificationType)) {
      return NextResponse.json(
        { success: false, message: "Invalid verification type" },
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

    console.log(
      `🔍 Verifying email: ${email} with code: ${code} for type: ${type}`
    );

    // 🔍 Store 상태 디버깅
    console.log(`🔍 [BEFORE VERIFICATION] Store debug:`);
    verificationStore.debugStore();

    // 인증번호 검증
    const verificationResult = await verificationStore.verifyCode(
      email,
      code,
      type as VerificationType
    );

    if (!verificationResult.success) {
      console.log(
        `❌ Verification failed for ${email}: ${verificationResult.message}`
      );
      return NextResponse.json(
        { success: false, message: verificationResult.message },
        { status: 400 }
      );
    }

    console.log(`✅ Verification successful for ${email} (${type})`);

    // TODO: 필요시 사용자 계정 상태 업데이트
    // 예: await updateUserVerificationStatus(email, true);

    return NextResponse.json({
      success: true,
      message: verificationResult.message,
      verificationType: type,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET 요청으로 URL 파라미터를 통한 인증도 지원
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const code = searchParams.get("code");

    if (!email || !code) {
      // 인증 페이지로 리다이렉트 (쿼리 파라미터 유지)
      const redirectUrl = new URL("/verify-email", request.url);
      if (email) redirectUrl.searchParams.set("email", email);
      if (code) redirectUrl.searchParams.set("code", code);

      return NextResponse.redirect(redirectUrl);
    }

    // POST와 동일한 검증 로직 실행
    const verificationResult = await POST(
      new NextRequest(request.url, {
        method: "POST",
        body: JSON.stringify({ email: decodeURIComponent(email), code }),
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await verificationResult.json();

    if (result.success) {
      // 성공 시 로그인 페이지로 리다이렉트
      const successUrl = new URL("/login", request.url);
      successUrl.searchParams.set("verified", "true");
      return NextResponse.redirect(successUrl);
    } else {
      // 실패 시 인증 페이지로 리다이렉트 (에러 메시지 포함)
      const errorUrl = new URL("/verify-email", request.url);
      errorUrl.searchParams.set("error", result.message);
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error("GET email verification error:", error);
    const errorUrl = new URL("/verify-email", request.url);
    errorUrl.searchParams.set("error", "Internal server error");
    return NextResponse.redirect(errorUrl);
  }
}
