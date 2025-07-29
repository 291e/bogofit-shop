import {
  AligoConfig,
  SmsSendRequest,
  SmsSendResponse,
  SmsMassSendRequest,
  SmsRemainResponse,
  SmsListRequest,
  SmsListResponse,
  SmsDetailRequest,
  SmsDetailResponse,
  SmsCancelRequest,
  SmsCancelResponse,
  ALIGO_ERROR_CODES,
} from "@/types/sms";

export class AligoClient {
  private config: AligoConfig;
  private baseUrl: string;

  constructor(config: AligoConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://apis.aligo.in";
  }

  /**
   * 문자 발송 API
   * 동일한 내용의 문자를 컴마(,)로 분기하여 동시 1천명에게 전송
   */
  async sendSms(request: SmsSendRequest): Promise<SmsSendResponse> {
    const formData = new FormData();

    // 필수 파라미터
    formData.append("key", this.config.apiKey);
    formData.append("user_id", this.config.userId);
    formData.append("sender", request.sender);
    formData.append("receiver", request.receiver);
    formData.append("msg", request.msg);

    // 선택 파라미터
    if (request.msgType) {
      formData.append("msg_type", request.msgType);
    }
    if (request.title) {
      formData.append("title", request.title);
    }
    if (request.destination) {
      formData.append("destination", request.destination);
    }
    if (request.rdate) {
      formData.append("rdate", request.rdate);
    }
    if (request.rtime) {
      formData.append("rtime", request.rtime);
    }
    if (request.testmodeYn) {
      formData.append("testmode_yn", request.testmodeYn);
    }

    // 이미지 첨부 (MMS)
    if (request.image1) {
      if (request.image1 instanceof File) {
        formData.append("image1", request.image1);
      } else {
        // Base64 또는 URL인 경우 처리 로직 추가 필요
        console.warn("Image1은 File 객체만 지원됩니다.");
      }
    }
    if (request.image2) {
      if (request.image2 instanceof File) {
        formData.append("image2", request.image2);
      }
    }
    if (request.image3) {
      if (request.image3 instanceof File) {
        formData.append("image3", request.image3);
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/send/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: SmsSendResponse = await response.json();
      return result;
    } catch (error) {
      console.error("ALIGO SMS 발송 실패:", error);
      throw error;
    }
  }

  /**
   * 대량 문자 발송 API
   * 각각 다른 내용의 문자를 500명에게 동시 전송
   */
  async sendMassSms(request: SmsMassSendRequest): Promise<SmsSendResponse> {
    const formData = new FormData();

    // 필수 파라미터
    formData.append("key", this.config.apiKey);
    formData.append("user_id", this.config.userId);
    formData.append("sender", request.sender);
    formData.append("send_type", request.msgType); // SMS 또는 LMS

    // 선택 파라미터
    if (request.title) {
      formData.append("title", request.title);
    }
    if (request.rdate) {
      formData.append("rdate", request.rdate);
    }
    if (request.rtime) {
      formData.append("rtime", request.rtime);
    }
    if (request.testmodeYn) {
      formData.append("testmode_yn", request.testmodeYn);
    }

    // 수신자별 데이터 추가 (최대 500명)
    request.receivers.forEach((receiver, index) => {
      const idx = index + 1;
      formData.append(`rec_${idx}`, receiver.receiver);
      formData.append(`msg_${idx}`, receiver.msg);
      if (receiver.destination) {
        formData.append(`destination_${idx}`, receiver.destination);
      }
    });

    try {
      const response = await fetch(`${this.baseUrl}/send_mass/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: SmsSendResponse = await response.json();
      return result;
    } catch (error) {
      console.error("ALIGO 대량 SMS 발송 실패:", error);
      throw error;
    }
  }

  /**
   * 발송 가능 건수 조회 API
   */
  async getRemainCount(): Promise<SmsRemainResponse> {
    const formData = new FormData();
    formData.append("key", this.config.apiKey);
    formData.append("user_id", this.config.userId);

    try {
      const response = await fetch(`${this.baseUrl}/remain/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: SmsRemainResponse = await response.json();
      return result;
    } catch (error) {
      console.error("ALIGO 잔여 건수 조회 실패:", error);
      throw error;
    }
  }

  /**
   * 문자 발송 내역 조회 API
   */
  async getSmsHistory(request: SmsListRequest = {}): Promise<SmsListResponse> {
    const formData = new FormData();
    formData.append("key", this.config.apiKey);
    formData.append("user_id", this.config.userId);

    // 선택 파라미터
    if (request.page) {
      formData.append("page", request.page.toString());
    }
    if (request.limit) {
      formData.append("limit", request.limit.toString());
    }
    if (request.start_date) {
      formData.append("start_date", request.start_date);
    }
    if (request.end_date) {
      formData.append("end_date", request.end_date);
    }

    try {
      const response = await fetch(`${this.baseUrl}/list/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: SmsListResponse = await response.json();
      return result;
    } catch (error) {
      console.error("ALIGO SMS 내역 조회 실패:", error);
      throw error;
    }
  }

  /**
   * 문자 전송 결과 상세 조회 API
   */
  async getSmsDetail(request: SmsDetailRequest): Promise<SmsDetailResponse> {
    const formData = new FormData();
    formData.append("key", this.config.apiKey);
    formData.append("user_id", this.config.userId);
    formData.append("mid", request.mid.toString());

    if (request.page) {
      formData.append("page", request.page.toString());
    }
    if (request.limit) {
      formData.append("limit", request.limit.toString());
    }

    try {
      const response = await fetch(`${this.baseUrl}/sms_list/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: SmsDetailResponse = await response.json();
      return result;
    } catch (error) {
      console.error("ALIGO SMS 상세 조회 실패:", error);
      throw error;
    }
  }

  /**
   * 예약 문자 취소 API
   */
  async cancelSms(request: SmsCancelRequest): Promise<SmsCancelResponse> {
    const formData = new FormData();
    formData.append("key", this.config.apiKey);
    formData.append("user_id", this.config.userId);
    formData.append("mid", request.mid.toString());

    try {
      const response = await fetch(`${this.baseUrl}/cancel/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: SmsCancelResponse = await response.json();
      return result;
    } catch (error) {
      console.error("ALIGO SMS 취소 실패:", error);
      throw error;
    }
  }

  /**
   * 메시지 타입 자동 결정
   * 90byte 이하: SMS, 초과: LMS
   */
  static getMessageType(
    message: string,
    hasImage: boolean = false
  ): "SMS" | "LMS" | "MMS" {
    if (hasImage) {
      return "MMS";
    }

    // EUC-KR 인코딩 기준 바이트 계산 (대략적)
    const byteLength = this.getByteLength(message);
    return byteLength <= 90 ? "SMS" : "LMS";
  }

  /**
   * EUC-KR 기준 바이트 길이 계산 (대략적)
   */
  static getByteLength(str: string): number {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charAt(i);
      // 한글, 한자, 특수문자는 2바이트, 영문/숫자는 1바이트
      if (char.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/) || char.charCodeAt(0) > 127) {
        byteLength += 2;
      } else {
        byteLength += 1;
      }
    }
    return byteLength;
  }

  /**
   * 에러 메시지 해석
   */
  static getErrorMessage(resultCode: number | string): string {
    const code =
      typeof resultCode === "string" ? parseInt(resultCode, 10) : resultCode;
    switch (code) {
      case ALIGO_ERROR_CODES.SUCCESS:
        return "성공";
      case ALIGO_ERROR_CODES.AUTH_ERROR:
        return "인증 오류입니다. API Key와 사용자 ID를 확인해주세요.";
      case ALIGO_ERROR_CODES.INVALID_PARAM:
        return "잘못된 파라미터입니다.";
      case ALIGO_ERROR_CODES.INSUFFICIENT_POINT:
        return "발송 가능한 포인트가 부족합니다.";
      case ALIGO_ERROR_CODES.INVALID_PHONE:
        return "잘못된 전화번호입니다.";
      case ALIGO_ERROR_CODES.INVALID_SENDER:
        return "발신번호가 등록되지 않았거나 잘못되었습니다.";
      case ALIGO_ERROR_CODES.DUPLICATE_REQUEST:
        return "중복된 요청입니다.";
      case ALIGO_ERROR_CODES.SERVER_ERROR:
        return "서버 오류가 발생했습니다.";
      case ALIGO_ERROR_CODES.CANCEL_TIME_OVER:
        return "발송 5분전까지만 취소가 가능합니다.";
      default:
        return `알 수 없는 오류입니다. (코드: ${code})`;
    }
  }

  /**
   * 전화번호 유효성 검사
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // 한국 전화번호 형식 검사 (010, 011, 016, 017, 018, 019 등)
    const phoneRegex = /^(01[016789]|02|0[3-9][0-9])\d{3,4}\d{4}$/;
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    return phoneRegex.test(cleanNumber);
  }

  /**
   * 전화번호 정규화 (하이픈 제거)
   */
  static normalizePhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[^0-9]/g, "");
  }
}

// 기본 ALIGO 클라이언트 인스턴스 생성 함수
export function createAligoClient(): AligoClient {
  const config: AligoConfig = {
    apiKey: process.env.ALIGO_API_KEY || "",
    userId: process.env.ALIGO_USER_ID || "",
  };

  if (!config.apiKey || !config.userId) {
    throw new Error("ALIGO API Key와 User ID가 환경변수에 설정되어야 합니다.");
  }

  return new AligoClient(config);
}
