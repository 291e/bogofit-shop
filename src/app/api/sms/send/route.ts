import { NextRequest, NextResponse } from "next/server";
import { createAligoClient, AligoClient } from "@/lib/aligo";
import { SmsSendRequest } from "@/types/sms";

/**
 * @swagger
 * /api/sms/send:
 *   post:
 *     tags:
 *       - SMS
 *     summary: 문자 발송
 *     description: ALIGO를 통해 SMS/LMS/MMS 문자를 발송합니다. 동일한 내용을 최대 1천명에게 동시 전송 가능합니다.
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
 *                 description: 발신자 전화번호 (최대 16bytes, 사전 등록 필요)
 *                 example: "025114560"
 *               receiver:
 *                 type: string
 *                 description: 수신자 전화번호 (컴마로 구분하여 최대 1천명)
 *                 example: "01012345678,01087654321"
 *               msg:
 *                 type: string
 *                 description: 메시지 내용 (1~2,000Byte)
 *                 example: "안녕하세요! 테스트 메시지입니다."
 *               msgType:
 *                 type: string
 *                 enum: [SMS, LMS, MMS]
 *                 description: 메시지 타입 (생략시 자동 판단)
 *                 example: "SMS"
 *               title:
 *                 type: string
 *                 description: 문자 제목 (LMS, MMS만 허용, 1~44Byte)
 *                 example: "공지사항"
 *               destination:
 *                 type: string
 *                 description: "%고객명%" 치환용 데이터
 *                 example: "01012345678|홍길동,01087654321|김영희"
 *               rdate:
 *                 type: string
 *                 description: 예약일 (YYYYMMDD, 현재일 이상)
 *                 example: "20241230"
 *               rtime:
 *                 type: string
 *                 description: 예약시간 (HHII, 현재시간 기준 10분 이후)
 *                 example: "1430"
 *               testmodeYn:
 *                 type: string
 *                 enum: [Y, N]
 *                 description: 테스트 모드 (Y시 실제 발송 안함)
 *                 example: "N"
 *             required:
 *               - sender
 *               - receiver
 *               - msg
 *           example:
 *             sender: "025114560"
 *             receiver: "01012345678,01087654321"
 *             msg: "%고객명%님 안녕하세요! 주문이 완료되었습니다."
 *             title: "주문 완료 안내"
 *             destination: "01012345678|홍길동,01087654321|김영희"
 *             testmodeYn: "Y"
 *     responses:
 *       200:
 *         description: 문자 발송 성공
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
 *                     msg_id:
 *                       type: number
 *                       description: 메시지 고유 ID
 *                       example: 123456789
 *                     success_cnt:
 *                       type: number
 *                       description: 요청 성공 건수
 *                       example: 2
 *                     error_cnt:
 *                       type: number
 *                       description: 요청 실패 건수
 *                       example: 0
 *                     msg_type:
 *                       type: string
 *                       description: 실제 전송된 메시지 타입
 *                       example: "SMS"
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
 *                   example: "발신자 전화번호는 필수입니다."
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
    const { sender, receiver, msg } = body;

    if (!sender) {
      return NextResponse.json(
        { success: false, error: "발신자 전화번호는 필수입니다." },
        { status: 400 }
      );
    }

    if (!receiver) {
      return NextResponse.json(
        { success: false, error: "수신자 전화번호는 필수입니다." },
        { status: 400 }
      );
    }

    if (!msg) {
      return NextResponse.json(
        { success: false, error: "메시지 내용은 필수입니다." },
        { status: 400 }
      );
    }

    // 전화번호 유효성 검사
    const senderClean = AligoClient.normalizePhoneNumber(sender);
    if (!AligoClient.validatePhoneNumber(senderClean)) {
      return NextResponse.json(
        { success: false, error: "발신자 전화번호 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 수신자 전화번호들 검증
    const receivers = receiver.split(",").map((phone: string) => phone.trim());
    for (const phone of receivers) {
      const phoneClean = AligoClient.normalizePhoneNumber(phone);
      if (!AligoClient.validatePhoneNumber(phoneClean)) {
        return NextResponse.json(
          {
            success: false,
            error: `수신자 전화번호 형식이 올바르지 않습니다: ${phone}`,
          },
          { status: 400 }
        );
      }
    }

    // 수신자 수 제한 체크 (최대 1000명)
    if (receivers.length > 1000) {
      return NextResponse.json(
        { success: false, error: "수신자는 최대 1000명까지 가능합니다." },
        { status: 400 }
      );
    }

    // 메시지 길이 체크
    if (msg.length > 2000) {
      return NextResponse.json(
        { success: false, error: "메시지는 최대 2000자까지 가능합니다." },
        { status: 400 }
      );
    }

    // ALIGO 클라이언트 생성
    const aligoClient = createAligoClient();

    // 메시지 타입 자동 결정 (지정되지 않은 경우)
    let { msgType } = body;
    if (!msgType) {
      const hasImage = body.image1 || body.image2 || body.image3;
      msgType = AligoClient.getMessageType(msg, hasImage);
    }

    // SMS 발송 요청 구성
    const smsRequest: SmsSendRequest = {
      sender: senderClean,
      receiver: receivers
        .map((phone: string) => AligoClient.normalizePhoneNumber(phone))
        .join(","),
      msg,
      msgType,
      title: body.title,
      destination: body.destination,
      rdate: body.rdate,
      rtime: body.rtime,
      testmodeYn: body.testmodeYn || "N",
    };

    // 이미지 파일 처리 (추후 구현)
    if (body.image1) {
      console.warn("이미지 첨부 기능은 아직 구현되지 않았습니다.");
    }

    // ALIGO API 호출
    const result = await aligoClient.sendSms(smsRequest);

    // 결과 처리
    const isSuccess =
      (typeof result.result_code === "string"
        ? parseInt(result.result_code, 10)
        : result.result_code) === 1;
    if (isSuccess) {
      return NextResponse.json({
        success: true,
        data: result,
        message: "문자 발송이 성공적으로 요청되었습니다.",
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
    console.error("SMS 발송 API 오류:", error);

    // 환경변수 설정 오류
    if (error instanceof Error && error.message.includes("환경변수")) {
      return NextResponse.json(
        { success: false, error: "SMS 서비스 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "문자 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
