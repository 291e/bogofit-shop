import { NextResponse } from "next/server";
import { createAligoClient, AligoClient } from "@/lib/aligo";

/**
 * @swagger
 * /api/sms/remain:
 *   get:
 *     tags:
 *       - SMS
 *     summary: 문자 발송 가능 건수 조회
 *     description: ALIGO 계정의 SMS/LMS/MMS 발송 가능한 잔여 건수를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 잔여 건수 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     result_code:
 *                       type: number
 *                       description: "결과 코드 (1: 성공)"
 *                       example: 1
 *                     message:
 *                       type: string
 *                       description: "결과 메시지"
 *                       example: ""
 *                     SMS_CNT:
 *                       type: number
 *                       description: 단문(SMS) 발송 가능 건수
 *                       example: 5555
 *                     LMS_CNT:
 *                       type: number
 *                       description: 장문(LMS) 발송 가능 건수
 *                       example: 1930
 *                     MMS_CNT:
 *                       type: number
 *                       description: 그림문자(MMS) 발송 가능 건수
 *                       example: 833
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  try {
    // ALIGO 클라이언트 생성
    const aligoClient = createAligoClient();

    // 잔여 건수 조회
    const result = await aligoClient.getRemainCount();

    // 결과 처리
    const isSuccess =
      (typeof result.result_code === "string"
        ? parseInt(result.result_code, 10)
        : result.result_code) === 1;
    if (isSuccess) {
      return NextResponse.json({
        success: true,
        data: result,
        message: "잔여 건수 조회가 완료되었습니다.",
      });
    } else {
      const errorMessage = AligoClient.getErrorMessage(result.result_code);
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          aligoError: result,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("SMS 잔여 건수 조회 API 오류:", error);

    // 환경변수 설정 오류
    if (error instanceof Error && error.message.includes("환경변수")) {
      return NextResponse.json(
        { success: false, error: "SMS 서비스 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "잔여 건수 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
