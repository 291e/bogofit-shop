import { NextRequest, NextResponse } from "next/server";
import { createTwilioClient, isTwilioTestMode } from "@/lib/twilio";
import {
  getVerificationService,
  isVerificationTestMode,
} from "@/lib/verification-store";
import { z } from "zod";

// 요청 바디 검증 스키마
const SendVerificationSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "유효한 전화번호를 입력해주세요.")
    .max(15, "전화번호가 너무 깁니다.")
    .regex(/^[\d\+\-\s\(\)]+$/, "유효한 전화번호 형식이 아닙니다."),
  purpose: z.string().optional().default("verification"),
  channel: z.enum(["sms", "call"]).optional().default("sms"),
});

/**
 * 문자 인증 코드 발송 API
 * POST /api/verification/send
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = SendVerificationSchema.safeParse(body);
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

    const { phoneNumber, purpose, channel } = validationResult.data;

    console.log(
      `[VerificationAPI] 인증 코드 발송 요청: ${phoneNumber} (${purpose})`
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
      console.log(
        "[VerificationAPI] 테스트 모드: 실제 SMS 발송 없이 가상 처리"
      );

      // 테스트 모드에서는 로컬 저장소에만 코드 저장
      const verificationService = getVerificationService();
      const result = await verificationService.generateAndStoreCode(
        normalizedPhone,
        purpose
      );

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "인증 코드 생성에 실패했습니다.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "인증 코드가 발송되었습니다.",
        data: {
          to: normalizedPhone,
          channel,
          testMode: true,
          testCode: result.code, // 테스트 모드에서만 코드 노출
          expiresAt: result.expiresAt,
        },
      });
    }

    // 프로덕션 모드: 실제 Twilio를 통한 SMS 발송
    try {
      const twilioClient = createTwilioClient();

      // Twilio Verify Service 사용
      const twilioResult = await twilioClient.sendVerificationCode(
        normalizedPhone,
        channel
      );

      if (!twilioResult.success) {
        console.error(
          "[VerificationAPI] Twilio 발송 실패:",
          twilioResult.errorMessage
        );
        return NextResponse.json(
          {
            success: false,
            error:
              twilioResult.errorMessage || "인증 코드 발송에 실패했습니다.",
          },
          { status: 400 }
        );
      }

      console.log(`[VerificationAPI] Twilio 발송 성공: ${twilioResult.to}`);

      return NextResponse.json({
        success: true,
        message: "인증 코드가 발송되었습니다.",
        data: {
          to: twilioResult.to,
          channel: twilioResult.channel,
          status: twilioResult.status,
          testMode: false,
        },
      });
    } catch (twilioError) {
      console.error("[VerificationAPI] Twilio 클라이언트 오류:", twilioError);

      // Twilio 실패 시 로컬 저장소로 폴백
      console.log("[VerificationAPI] Twilio 실패로 로컬 저장소 폴백 실행");

      const verificationService = getVerificationService();
      const result = await verificationService.generateAndStoreCode(
        normalizedPhone,
        purpose
      );

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "인증 코드 발송에 실패했습니다.",
          },
          { status: 500 }
        );
      }

      // TODO: 여기서 ALIGO SMS API로 폴백 발송할 수도 있음
      console.log(`[VerificationAPI] 폴백 코드 생성: ${result.code}`);

      return NextResponse.json({
        success: true,
        message: "인증 코드가 발송되었습니다.",
        data: {
          to: normalizedPhone,
          channel,
          fallback: true,
          expiresAt: result.expiresAt,
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
 * 전화번호 정규화 함수 (다국가 지원)
 */
function normalizePhoneNumber(phoneNumber: string): string | null {
  try {
    // 모든 공백, 하이픈, 괄호 제거
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

    // 이미 국가 코드가 포함된 경우 그대로 반환
    if (cleaned.startsWith("+")) {
      return cleaned;
    }

    // 지원하는 국가 코드들
    const supportedCountries = [
      { code: "+82", prefix: "82" }, // 한국
      { code: "+1", prefix: "1" }, // 미국/캐나다
      { code: "+44", prefix: "44" }, // 영국
      { code: "+61", prefix: "61" }, // 호주
      { code: "+81", prefix: "81" }, // 일본
      { code: "+86", prefix: "86" }, // 중국
      { code: "+52", prefix: "52" }, // 멕시코
      { code: "+62", prefix: "62" }, // 인도네시아
      { code: "+971", prefix: "971" }, // 아랍에미리트
      { code: "+84", prefix: "84" }, // 베트남
      { code: "+855", prefix: "855" }, // 캄보디아
    ];

    // 국가 코드로 시작하는지 확인
    for (const country of supportedCountries) {
      if (cleaned.startsWith(country.prefix)) {
        return country.code + cleaned.substring(country.prefix.length);
      }
    }

    // 한국의 경우 0으로 시작하면 제거하고 +82 추가
    if (cleaned.startsWith("0")) {
      return "+82" + cleaned.substring(1);
    }

    // 기본값으로 한국 번호로 처리
    return "+82" + cleaned;
  } catch (error) {
    console.error("전화번호 정규화 실패:", error);
    return null;
  }
}

/**
 * 지원되는 HTTP 메서드
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed. Use POST to send verification code.",
    },
    { status: 405 }
  );
}
