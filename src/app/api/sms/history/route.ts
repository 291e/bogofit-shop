import { NextRequest, NextResponse } from "next/server";
import { createAligoClient, AligoClient } from "@/lib/aligo";
import { SmsListRequest } from "@/types/sms";

/**
 * @swagger
 * /api/sms/history:
 *   get:
 *     tags:
 *       - SMS
 *     summary: 문자 발송 내역 조회
 *     description: ALIGO를 통해 발송한 문자 내역을 페이지네이션으로 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: 페이지 번호
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 500
 *         description: 페이지당 건수
 *         example: 50
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           pattern: '^\d{8}$'
 *         description: 검색 시작일 (YYYYMMDD)
 *         example: "20241201"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           pattern: '^\d{8}$'
 *         description: 검색 종료일 (YYYYMMDD)
 *         example: "20241231"
 *     responses:
 *       200:
 *         description: 발송 내역 조회 성공
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
 *                       description: 결과 코드 (1: 성공)
 *                       example: 1
 *                     message:
 *                       type: string
 *                       description: 결과 메시지
 *                       example: ""
 *                     current_page:
 *                       type: number
 *                       description: 현재 페이지
 *                       example: 1
 *                     total_count:
 *                       type: number
 *                       description: 전체 건수
 *                       example: 150
 *                     list:
 *                       type: array
 *                       description: 발송 내역 목록
 *                       items:
 *                         type: object
 *                         properties:
 *                           mid:
 *                             type: number
 *                             description: 메시지 ID
 *                             example: 123456789
 *                           user_id:
 *                             type: string
 *                             description: 사용자 ID
 *                             example: "testuser"
 *                           sender:
 *                             type: string
 *                             description: 발신번호
 *                             example: "025114560"
 *                           receiver:
 *                             type: string
 *                             description: 수신번호
 *                             example: "01012345678"
 *                           msg:
 *                             type: string
 *                             description: 메시지 내용
 *                             example: "안녕하세요! 테스트 메시지입니다."
 *                           msg_type:
 *                             type: string
 *                             description: 메시지 타입
 *                             example: "SMS"
 *                           reserve_date:
 *                             type: string
 *                             description: 예약일시
 *                             example: "2024-12-30 14:30:00"
 *                           reg_date:
 *                             type: string
 *                             description: 등록일시
 *                             example: "2024-12-30 14:25:00"
 *                           send_date:
 *                             type: string
 *                             description: 발송일시
 *                             example: "2024-12-30 14:30:00"
 *                           result_code:
 *                             type: number
 *                             description: 발송결과 코드
 *                             example: 0
 *                           result_message:
 *                             type: string
 *                             description: 발송결과 메시지
 *                             example: "성공"
 *       400:
 *         description: 잘못된 요청 파라미터
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
 *                   example: "페이지 번호는 1 이상이어야 합니다."
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
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const startDate = searchParams.get("start_date") || undefined;
    const endDate = searchParams.get("end_date") || undefined;

    // 파라미터 유효성 검사
    if (page < 1) {
      return NextResponse.json(
        { success: false, error: "페이지 번호는 1 이상이어야 합니다." },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 500) {
      return NextResponse.json(
        { success: false, error: "페이지당 건수는 1~500 사이여야 합니다." },
        { status: 400 }
      );
    }

    // 날짜 형식 검증 (YYYYMMDD)
    const datePattern = /^\d{8}$/;
    if (startDate && !datePattern.test(startDate)) {
      return NextResponse.json(
        { success: false, error: "시작일은 YYYYMMDD 형식이어야 합니다." },
        { status: 400 }
      );
    }

    if (endDate && !datePattern.test(endDate)) {
      return NextResponse.json(
        { success: false, error: "종료일은 YYYYMMDD 형식이어야 합니다." },
        { status: 400 }
      );
    }

    // ALIGO 클라이언트 생성
    const aligoClient = createAligoClient();

    // 발송 내역 조회 요청 구성
    const request: SmsListRequest = {
      page,
      limit,
      start_date: startDate,
      end_date: endDate,
    };

    // 발송 내역 조회
    const result = await aligoClient.getSmsHistory(request);

    // 결과 처리
    const isSuccess =
      (typeof result.result_code === "string"
        ? parseInt(result.result_code, 10)
        : result.result_code) === 1;
    if (isSuccess) {
      return NextResponse.json({
        success: true,
        data: result,
        message: "발송 내역 조회가 완료되었습니다.",
        pagination: {
          current_page: result.current_page || page,
          total_count: result.total_count || 0,
          per_page: limit,
          total_pages: Math.ceil((result.total_count || 0) / limit),
        },
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
    console.error("SMS 발송 내역 조회 API 오류:", error);

    // 환경변수 설정 오류
    if (error instanceof Error && error.message.includes("환경변수")) {
      return NextResponse.json(
        { success: false, error: "SMS 서비스 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "발송 내역 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
