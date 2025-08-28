// Twilio Verify Service - Based on official documentation
import twilio from "twilio";

// Twilio 설정 인터페이스
interface TwilioConfig {
  accountSid: string;
  authToken: string;
  serviceSid: string; // Verify Service SID
  fromPhoneNumber?: string; // 일반 SMS용 발신번호
}

// 인증 코드 전송 결과
interface VerificationResult {
  success: boolean;
  status: string;
  to: string;
  channel: string;
  sid?: string;
  dateCreated?: Date;
  errorMessage?: string;
}

// 인증 코드 확인 결과
interface VerificationCheckResult {
  success: boolean;
  status: string;
  to: string;
  valid: boolean;
  sid?: string;
  dateCreated?: Date;
  errorMessage?: string;
}

export class TwilioVerificationService {
  private client: twilio.Twilio;
  private config: TwilioConfig;

  constructor(config: TwilioConfig) {
    this.config = config;
    this.client = twilio(config.accountSid, config.authToken);
  }

  /**
   * 문자 인증 코드 발송 (Twilio Verify Service 사용)
   * @param phoneNumber - 수신자 전화번호 (국제 형식: +82101234567)
   * @param channel - 전송 채널 ('sms' | 'call')
   * @returns 발송 결과
   */
  async sendVerificationCode(
    phoneNumber: string,
    channel: "sms" | "call" = "sms"
  ): Promise<VerificationResult> {
    try {
      // 전화번호 형식 정규화
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

      console.log(`[Twilio] 인증 코드 발송 시도: ${normalizedPhone}`);

      // Twilio Verify Service를 사용한 인증 코드 발송
      const verification = await this.client.verify.v2
        .services(this.config.serviceSid)
        .verifications.create({
          to: normalizedPhone,
          channel: channel,
        });

      console.log(`[Twilio] 인증 코드 발송 성공: ${verification.sid}`);

      return {
        success: true,
        status: verification.status,
        to: verification.to,
        channel: verification.channel,
        sid: verification.sid,
        dateCreated: verification.dateCreated,
      };
    } catch (error) {
      console.error("[Twilio] 인증 코드 발송 실패:", error);

      let errorMessage = "알 수 없는 오류가 발생했습니다.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String(error.message);
      }

      return {
        success: false,
        status: "failed",
        to: phoneNumber,
        channel: channel,
        errorMessage,
      };
    }
  }

  /**
   * 문자 인증 코드 확인 (Twilio Verify Service 사용)
   * @param phoneNumber - 수신자 전화번호
   * @param code - 인증 코드
   * @returns 확인 결과
   */
  async verifyCode(
    phoneNumber: string,
    code: string
  ): Promise<VerificationCheckResult> {
    try {
      // 전화번호 형식 정규화
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

      console.log(`[Twilio] 인증 코드 확인 시도: ${normalizedPhone}`);

      // Twilio Verify Service를 사용한 인증 코드 확인
      const verificationCheck = await this.client.verify.v2
        .services(this.config.serviceSid)
        .verificationChecks.create({
          to: normalizedPhone,
          code: code,
        });

      console.log(`[Twilio] 인증 코드 확인 결과: ${verificationCheck.status}`);

      const isValid = verificationCheck.status === "approved";

      return {
        success: true,
        status: verificationCheck.status,
        to: verificationCheck.to,
        valid: isValid,
        sid: verificationCheck.sid,
        dateCreated: verificationCheck.dateCreated,
      };
    } catch (error) {
      console.error("[Twilio] 인증 코드 확인 실패:", error);

      let errorMessage = "알 수 없는 오류가 발생했습니다.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String(error.message);
      }

      return {
        success: false,
        status: "failed",
        to: phoneNumber,
        valid: false,
        errorMessage,
      };
    }
  }

  /**
   * 전화번호를 국제 형식으로 정규화
   * @param phoneNumber - 입력 전화번호
   * @returns 정규화된 전화번호 (+82 형식)
   */
  private normalizePhoneNumber(phoneNumber: string): string {
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

    // 그 외의 경우 +82 추가
    return "+82" + cleaned;
  }

  /**
   * 일반 SMS 발송 (인증용이 아닌, Verify Service 미사용)
   * @param phoneNumber - 수신자 전화번호
   * @param message - 메시지 내용
   * @returns 발송 결과
   */
  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!this.config.fromPhoneNumber) {
        console.error("[Twilio] SMS 발송용 전화번호가 설정되지 않았습니다.");
        return false;
      }

      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

      const messageInstance = await this.client.messages.create({
        body: message,
        from: this.config.fromPhoneNumber,
        to: normalizedPhone,
      });

      console.log(`[Twilio] SMS 발송 성공: ${messageInstance.sid}`);
      return true;
    } catch (error) {
      console.error("[Twilio] SMS 발송 실패:", error);
      return false;
    }
  }

  /**
   * Twilio Verify 서비스 정보 조회
   */
  async getServiceInfo() {
    try {
      const service = await this.client.verify.v2
        .services(this.config.serviceSid)
        .fetch();
      return {
        friendlyName: service.friendlyName,
        codeLength: service.codeLength,
        dtmfInputRequired: service.dtmfInputRequired,
        skipSmsToLandlines: service.skipSmsToLandlines,
        lookupEnabled: service.lookupEnabled,
      };
    } catch (error) {
      console.error("[Twilio] 서비스 정보 조회 실패:", error);
      return null;
    }
  }
}

// Twilio 클라이언트 팩토리 함수
export function createTwilioClient(): TwilioVerificationService {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !serviceSid) {
    throw new Error(
      "Twilio 환경변수가 설정되지 않았습니다. TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID를 확인해주세요."
    );
  }

  return new TwilioVerificationService({
    accountSid,
    authToken,
    serviceSid,
    fromPhoneNumber,
  });
}

// 테스트 모드 확인
export const isTwilioTestMode = (): boolean => {
  return process.env.TWILIO_TEST_MODE === "true";
};

// Twilio 에러 코드 매핑 (Verify Service 기준)
export const TWILIO_ERROR_MESSAGES = {
  20003: "Authentication Error - Invalid Account SID or Auth Token",
  20404: "The requested resource was not found",
  60200: "Invalid phone number",
  60202: "Max send attempts reached",
  60203: "Max check attempts reached",
  60212: "Invalid Verification Code",
  60223: "Invalid or expired Verification Code",
  60201: "Phone number is required",
} as const;

export default TwilioVerificationService;
