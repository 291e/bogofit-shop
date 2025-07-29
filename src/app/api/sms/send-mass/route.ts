import { NextRequest, NextResponse } from "next/server";
import { createAligoClient, AligoClient } from "@/lib/aligo";
import { SmsMassSendRequest } from "@/types/sms";

/**
 * @swagger
 * /api/sms/send-mass:
 *   post:
 *     tags:
 *       - SMS
 *     summary: 대량 문자 발송
 *     description: ALIGO를 통해 각각 다른 내용의 문자를 최대 500명에게 동시 전송합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender:
 *                 type: string
 *                 description: 발신자 전화번호 (사전 등록 필요)
 *                 example: "025114560"
 *               msgType:
 *                 type: string
 *                 enum: [SMS, LMS]
 *                 description: 메시지 타입 (직접 선택 필수, 혼용 불가)
 *                 example: "SMS"
 *               title:
 *                 type: string
 *                 description: 문자 제목 (LMS만 허용)
 *                 example: "개별 안내사항"
 *               rdate:
 *                 type: string
 *                 description: 예약일 (YYYYMMDD)
 *                 example: "20241230"
 *               rtime:
 *                 type: string
 *                 description: 예약시간 (HHII)
 *                 example: "1430"
 *               testmodeYn:
 *                 type: string
 *                 enum: [Y, N]
 *                 description: 테스트 모드
 *                 example: "Y"
 *               receivers:
 *                 type: array
 *                 description: 수신자별 개별 데이터 (최대 500명)
 *                 minItems: 1
 *                 maxItems: 500
 *                 items:
 *                   type: object
 *                   properties:
 *                     receiver:
 *                       type: string
 *                       description: 수신자 전화번호
 *                       example: "01012345678"
 *                     destination:
 *                       type: string
 *                       description: 고객명
 *                       example: "홍길동"
 *                     msg:
 *                       type: string
 *                       description: 개별 메시지 내용
 *                       example: "홍길동님, 개별 맞춤 메시지입니다."
 *                   required:
 *                     - receiver
 *                     - msg
 *             required:
 *               - sender
 *               - msgType
 *               - receivers
 *           example:
 *             sender: "025114560"
 *             msgType: "SMS"
 *             title: "개별 주문 안내"
 *             receivers:
 *               - receiver: "01012345678"
 *                 destination: "홍길동"
 *                 msg: "홍길동님, 주문하신 상품이 발송되었습니다."
 *               - receiver: "01087654321"
 *                 destination: "김영희"
 *                 msg: "김영희님, 배송이 완료되었습니다."
 *             testmodeYn: "Y"
 *     responses:
 *       200:
 *         description: 대량 문자 발송 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SmsResponse'
 *       400:
 *         description: 잘못된 요청 데이터
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
 *                   example: "수신자는 최대 500명까지 가능합니다."
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
    const { sender, msgType, receivers } = body;

    if (!sender) {
      return NextResponse.json(
        { success: false, error: "발신자 전화번호는 필수입니다." },
        { status: 400 }
      );
    }

    if (!msgType) {
      return NextResponse.json(
        { success: false, error: "메시지 타입은 필수입니다." },
        { status: 400 }
      );
    }

    if (!["SMS", "LMS"].includes(msgType)) {
      return NextResponse.json(
        { success: false, error: "메시지 타입은 SMS 또는 LMS만 가능합니다." },
        { status: 400 }
      );
    }

    if (!receivers || !Array.isArray(receivers)) {
      return NextResponse.json(
        { success: false, error: "수신자 목록은 필수입니다." },
        { status: 400 }
      );
    }

    // 수신자 수 제한 체크 (최대 500명)
    if (receivers.length === 0) {
      return NextResponse.json(
        { success: false, error: "최소 1명의 수신자가 필요합니다." },
        { status: 400 }
      );
    }

    if (receivers.length > 500) {
      return NextResponse.json(
        { success: false, error: "수신자는 최대 500명까지 가능합니다." },
        { status: 400 }
      );
    }

    // 발신자 전화번호 유효성 검사
    const senderClean = AligoClient.normalizePhoneNumber(sender);
    if (!AligoClient.validatePhoneNumber(senderClean)) {
      return NextResponse.json(
        { success: false, error: "발신자 전화번호 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 수신자별 데이터 검증
    const validatedReceivers = [];
    for (let i = 0; i < receivers.length; i++) {
      const receiver = receivers[i];

      if (!receiver.receiver) {
        return NextResponse.json(
          {
            success: false,
            error: `${i + 1}번째 수신자의 전화번호가 누락되었습니다.`,
          },
          { status: 400 }
        );
      }

      if (!receiver.msg) {
        return NextResponse.json(
          {
            success: false,
            error: `${i + 1}번째 수신자의 메시지가 누락되었습니다.`,
          },
          { status: 400 }
        );
      }

      // 전화번호 유효성 검사
      const phoneClean = AligoClient.normalizePhoneNumber(receiver.receiver);
      if (!AligoClient.validatePhoneNumber(phoneClean)) {
        return NextResponse.json(
          {
            success: false,
            error: `${i + 1}번째 수신자의 전화번호 형식이 올바르지 않습니다: ${
              receiver.receiver
            }`,
          },
          { status: 400 }
        );
      }

      // 메시지 길이 체크
      if (receiver.msg.length > 2000) {
        return NextResponse.json(
          {
            success: false,
            error: `${i + 1}번째 수신자의 메시지가 너무 깁니다. (최대 2000자)`,
          },
          { status: 400 }
        );
      }

      // SMS 타입인 경우 바이트 수 체크
      if (msgType === "SMS") {
        const byteLength = AligoClient.getByteLength(receiver.msg);
        if (byteLength > 90) {
          return NextResponse.json(
            {
              success: false,
              error: `${
                i + 1
              }번째 수신자의 SMS 메시지가 90바이트를 초과합니다. LMS를 사용하거나 메시지를 줄여주세요.`,
            },
            { status: 400 }
          );
        }
      }

      validatedReceivers.push({
        receiver: phoneClean,
        destination: receiver.destination,
        msg: receiver.msg,
      });
    }

    // ALIGO 클라이언트 생성
    const aligoClient = createAligoClient();

    // 대량 SMS 발송 요청 구성
    const massRequest: SmsMassSendRequest = {
      sender: senderClean,
      msgType,
      title: body.title,
      rdate: body.rdate,
      rtime: body.rtime,
      testmodeYn: body.testmodeYn || "N",
      receivers: validatedReceivers,
    };

    // ALIGO API 호출
    const result = await aligoClient.sendMassSms(massRequest);

    // 결과 처리
    const isSuccess =
      (typeof result.result_code === "string"
        ? parseInt(result.result_code, 10)
        : result.result_code) === 1;
    if (isSuccess) {
      return NextResponse.json({
        success: true,
        data: result,
        message: `${receivers.length}명에게 대량 문자 발송이 성공적으로 요청되었습니다.`,
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
    console.error("대량 SMS 발송 API 오류:", error);

    // 환경변수 설정 오류
    if (error instanceof Error && error.message.includes("환경변수")) {
      return NextResponse.json(
        { success: false, error: "SMS 서비스 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "대량 문자 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
