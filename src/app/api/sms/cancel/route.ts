import { NextRequest, NextResponse } from "next/server";
import { createAligoClient, AligoClient } from "@/lib/aligo";

/**
 * @swagger
 * /api/sms/cancel:
 *   post:
 *     tags:
 *       - SMS
 *     summary: 예약 문자 취소
 *     description: ALIGO를 통해 예약된 문자 발송을 취소합니다. 발송 5분 전까지만 취소 가능합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mid:
 *                 type: number
 *                 description: 취소할 메시지 ID (발송 시 반환된 msg_id)
 *                 example: 123456789
 *             required:
 *               - mid
 *           example:
 *             mid: 123456789
 *     responses:
 *       200:
 *         description: 예약 문자 취소 성공
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
 *                     cancel_date:
 *                       type: string
 *                       description: "취소 완료 일시"
 *                       example: "2024-12-30 10:07:00"
 *                 message:
 *                   type: string
 *                   example: "예약 문자가 성공적으로 취소되었습니다."
 *       400:
 *         description: 잘못된 요청 또는 취소 불가
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "발송 5분전까지만 취소가 가능합니다."
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
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 필수 파라미터 검증
    const { mid } = body;

    if (!mid) {
      return NextResponse.json(
        { success: false, error: "메시지 ID는 필수입니다." },
        { status: 400 }
      );
    }

    // 메시지 ID 유효성 검사
    if (!Number.isInteger(mid) || mid <= 0) {
      return NextResponse.json(
        { success: false, error: "올바른 메시지 ID를 입력해주세요." },
        { status: 400 }
      );
    }

    // ALIGO 클라이언트 생성
    const aligoClient = createAligoClient();

    // 예약 문자 취소 요청
    const result = await aligoClient.cancelSms({ mid });

    // 결과 처리
    const isSuccess =
      (typeof result.result_code === "string"
        ? parseInt(result.result_code, 10)
        : result.result_code) === 1;
    if (isSuccess) {
      return NextResponse.json({
        success: true,
        data: result,
        message: "예약 문자가 성공적으로 취소되었습니다.",
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
    console.error("SMS 취소 API 오류:", error);

    // 환경변수 설정 오류
    if (error instanceof Error && error.message.includes("환경변수")) {
      return NextResponse.json(
        { success: false, error: "SMS 서비스 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "예약 문자 취소 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
