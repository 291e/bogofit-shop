import { NextRequest, NextResponse } from "next/server";
import { createTwilioClient, isTwilioTestMode } from "@/lib/twilio";
import {
  getVerificationService,
  isVerificationTestMode,
} from "@/lib/verification-store";
import { z } from "zod";

// 요청 바디 검증 스키마
const VerifyCodeSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "유효한 전화번호를 입력해주세요.")
    .max(15, "전화번호가 너무 깁니다.")
    .regex(/^[\d\+\-\s\(\)]+$/, "유효한 전화번호 형식이 아닙니다."),
  code: z
    .string()
    .length(6, "인증 코드는 6자리여야 합니다.")
    .regex(/^\d{6}$/, "인증 코드는 숫자만 입력해주세요."),
  purpose: z.string().optional().default("verification"),
});

/**
 * 문자 인증 코드 확인 API
 * POST /api/verification/verify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = VerifyCodeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { phoneNumber, code, purpose } = validationResult.data;

    console.log(
      `[VerificationAPI] 인증 코드 확인 요청: ${phoneNumber} -> ${code} (${purpose})`
    );

    // 전화번호 정규화
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "유효하지 않은 전화번호 형식입니다.",
        },
        { status: 400 }
      );
    }

    // 테스트 모드 확인
    const isTestMode = isTwilioTestMode() || isVerificationTestMode();

    if (isTestMode) {
      console.log("[VerificationAPI] 테스트 모드: 로컬 저장소에서 인증 확인");

      // 테스트 모드에서는 로컬 저장소에서만 확인
      const verificationService = getVerificationService();
      const result = await verificationService.verifyCode(
        normalizedPhone,
        code,
        purpose
      );

      return NextResponse.json({
        success: result.success,
        message: result.message,
        data: {
          phoneNumber: normalizedPhone,
          verified: result.success,
          testMode: true,
          remainingAttempts: result.remainingAttempts,
        },
      });
    }

    // 프로덕션 모드: Twilio Verify Service 사용
    try {
      const twilioClient = createTwilioClient();

      const twilioResult = await twilioClient.verifyCode(normalizedPhone, code);

      if (!twilioResult.success) {
        console.error(
          "[VerificationAPI] Twilio 인증 실패:",
          twilioResult.errorMessage
        );

        // Twilio 실패 시 로컬 저장소로 폴백
        console.log("[VerificationAPI] Twilio 실패로 로컬 저장소 폴백 실행");

        const verificationService = getVerificationService();
        const fallbackResult = await verificationService.verifyCode(
          normalizedPhone,
          code,
          purpose
        );

        return NextResponse.json({
          success: fallbackResult.success,
          message: fallbackResult.message,
          data: {
            phoneNumber: normalizedPhone,
            verified: fallbackResult.success,
            fallback: true,
            remainingAttempts: fallbackResult.remainingAttempts,
          },
        });
      }

      console.log(`[VerificationAPI] Twilio 인증 성공: ${twilioResult.to}`);

      // Twilio 인증 성공 시 로컬 저장소에도 인증 상태 저장 (선택사항)
      if (twilioResult.valid) {
        const verificationService = getVerificationService();
        await verificationService.clearVerification(normalizedPhone, purpose);
      }

      return NextResponse.json({
        success: twilioResult.valid,
        message: twilioResult.valid
          ? "인증이 완료되었습니다."
          : "인증 코드가 올바르지 않습니다.",
        data: {
          phoneNumber: twilioResult.to,
          verified: twilioResult.valid,
          status: twilioResult.status,
          testMode: false,
        },
      });
    } catch (twilioError) {
      console.error("[VerificationAPI] Twilio 클라이언트 오류:", twilioError);

      // Twilio 실패 시 로컬 저장소로 폴백
      console.log("[VerificationAPI] Twilio 실패로 로컬 저장소 폴백 실행");

      const verificationService = getVerificationService();
      const result = await verificationService.verifyCode(
        normalizedPhone,
        code,
        purpose
      );

      return NextResponse.json({
        success: result.success,
        message: result.message,
        data: {
          phoneNumber: normalizedPhone,
          verified: result.success,
          fallback: true,
          remainingAttempts: result.remainingAttempts,
        },
      });
    }
  } catch (error) {
    console.error("[VerificationAPI] 서버 오류:", error);

    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * 인증 상태 확인 API
 * GET /api/verification/verify?phoneNumber=+821234567890&purpose=verification
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");
    const purpose = searchParams.get("purpose") || "verification";

    if (!phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "phoneNumber parameter is required",
        },
        { status: 400 }
      );
    }

    // 전화번호 정규화
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "유효하지 않은 전화번호 형식입니다.",
        },
        { status: 400 }
      );
    }

    // 로컬 저장소에서 인증 상태 확인
    const verificationService = getVerificationService();
    const isVerified = await verificationService.isVerified(
      normalizedPhone,
      purpose
    );

    return NextResponse.json({
      success: true,
      data: {
        phoneNumber: normalizedPhone,
        verified: isVerified,
        purpose,
      },
    });
  } catch (error) {
    console.error("[VerificationAPI] 인증 상태 확인 오류:", error);

    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * 전화번호 정규화 함수
 */
function normalizePhoneNumber(phoneNumber: string): string | null {
  try {
    // 모든 공백, 하이픈, 괄호 제거
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

    // 이미 +82로 시작하면 그대로 반환
    if (cleaned.startsWith("+82")) {
      return cleaned;
    }

    // 82로 시작하면 + 추가
    if (cleaned.startsWith("82")) {
      return "+" + cleaned;
    }

    // 0으로 시작하는 한국 번호면 +82로 변환
    if (cleaned.startsWith("0")) {
      return "+82" + cleaned.substring(1);
    }

    // 그 외의 경우 +82 추가 (한국 번호로 가정)
    return "+82" + cleaned;
  } catch (error) {
    console.error("전화번호 정규화 실패:", error);
    return null;
  }
}
