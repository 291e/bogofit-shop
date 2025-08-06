/**
 * 문자인증 코드 저장소
 * 인증 코드와 관련 정보를 임시 저장하는 서비스
 */

// 인증 타입 정의
export type VerificationType =
  | "signup"
  | "password-reset"
  | "email-change"
  | "account-deletion"
  | "profile-update";

// 인증 정보 인터페이스
interface VerificationData {
  phoneNumber: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  purpose?: string;
}

// 저장소 인터페이스
interface VerificationStore {
  set(
    key: string,
    data: VerificationData,
    ttlSeconds?: number
  ): Promise<void> | void;
  get(key: string): Promise<VerificationData | null> | VerificationData | null;
  delete(key: string): Promise<void> | void;
  cleanup(): Promise<void> | void;
}

// 저장소 통계 인터페이스
interface StoreStats {
  totalEntries: number;
  entries: Array<{
    key: string;
    phoneNumber: string;
    createdAt: Date;
    expiresAt: Date;
    attempts: number;
    verified: boolean;
  }>;
}

/**
 * In-Memory 인증 코드 저장소
 * 개발/테스트용, 프로덕션에서는 Redis 사용 권장
 */
class InMemoryVerificationStore implements VerificationStore {
  private store = new Map<string, VerificationData>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 1분마다 만료된 데이터 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  set(key: string, data: VerificationData): void {
    this.store.set(key, data);
    console.log(
      `[VerificationStore] 저장: ${key} (만료: ${data.expiresAt.toISOString()})`
    );
  }

  get(key: string): VerificationData | null {
    const data = this.store.get(key);

    if (!data) {
      return null;
    }

    // 만료 확인
    if (data.expiresAt < new Date()) {
      this.store.delete(key);
      console.log(`[VerificationStore] 만료된 데이터 삭제: ${key}`);
      return null;
    }

    return data;
  }

  delete(key: string): void {
    const deleted = this.store.delete(key);
    if (deleted) {
      console.log(`[VerificationStore] 삭제: ${key}`);
    }
  }

  cleanup(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, data] of this.store.entries()) {
      if (data.expiresAt < now) {
        this.store.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(
        `[VerificationStore] 만료된 데이터 ${cleanedCount}개 정리 완료`
      );
    }
  }

  // 개발/디버깅용
  getStats(): StoreStats {
    return {
      totalEntries: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, data]) => ({
        key,
        phoneNumber: data.phoneNumber,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        attempts: data.attempts,
        verified: data.verified,
      })),
    };
  }

  // 정리
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

/**
 * 인증 결과 인터페이스
 */
interface VerificationResult {
  success: boolean;
  message: string;
  remainingAttempts?: number;
}

/**
 * 코드 생성 결과 인터페이스
 */
interface CodeGenerationResult {
  code: string;
  expiresAt: Date;
}

/**
 * 인증 코드 관리 서비스
 */
export class VerificationCodeService {
  private store: VerificationStore;
  private readonly CODE_EXPIRY_MINUTES = 5; // 인증 코드 유효 시간
  private readonly MAX_ATTEMPTS = 3; // 최대 시도 횟수
  private readonly RESEND_COOLDOWN_SECONDS = 60; // 재발송 쿨다운

  constructor(store?: VerificationStore) {
    this.store = store || new InMemoryVerificationStore();
  }

  /**
   * 인증 코드 생성 및 저장
   */
  async generateAndStoreCode(
    phoneNumber: string,
    purpose: string = "verification"
  ): Promise<CodeGenerationResult | null> {
    try {
      // 기존 코드가 있는지 확인
      const key = this.getKey(phoneNumber, purpose);
      const existing = await this.store.get(key);

      // 재발송 쿨다운 확인
      if (existing && !this.canResend(existing)) {
        const remainingSeconds = Math.ceil(
          (existing.createdAt.getTime() +
            this.RESEND_COOLDOWN_SECONDS * 1000 -
            Date.now()) /
            1000
        );
        throw new Error(`재발송은 ${remainingSeconds}초 후에 가능합니다.`);
      }

      // 6자리 랜덤 숫자 코드 생성
      const code = this.generateCode();
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + this.CODE_EXPIRY_MINUTES * 60 * 1000
      );

      const verificationData: VerificationData = {
        phoneNumber,
        code,
        createdAt: now,
        expiresAt,
        attempts: 0,
        verified: false,
        purpose,
      };

      await this.store.set(key, verificationData);

      console.log(`[VerificationService] 코드 생성: ${phoneNumber} -> ${code}`);

      return { code, expiresAt };
    } catch (error) {
      console.error("[VerificationService] 코드 생성 실패:", error);
      return null;
    }
  }

  /**
   * 인증 코드 확인
   */
  async verifyCode(
    phoneNumber: string,
    inputCode: string,
    purpose: string = "verification"
  ): Promise<VerificationResult> {
    try {
      const key = this.getKey(phoneNumber, purpose);
      const data = await this.store.get(key);

      if (!data) {
        return {
          success: false,
          message: "인증 코드가 만료되었거나 존재하지 않습니다.",
        };
      }

      // 이미 인증된 경우
      if (data.verified) {
        return {
          success: false,
          message: "이미 사용된 인증 코드입니다.",
        };
      }

      // 최대 시도 횟수 초과
      if (data.attempts >= this.MAX_ATTEMPTS) {
        await this.store.delete(key);
        return {
          success: false,
          message:
            "인증 시도 횟수가 초과되었습니다. 새로운 인증 코드를 요청해주세요.",
        };
      }

      // 시도 횟수 증가
      data.attempts++;
      await this.store.set(key, data);

      // 코드 검증
      if (data.code !== inputCode) {
        const remainingAttempts = this.MAX_ATTEMPTS - data.attempts;
        return {
          success: false,
          message: "잘못된 인증 코드입니다.",
          remainingAttempts,
        };
      }

      // 인증 성공
      data.verified = true;
      await this.store.set(key, data);

      console.log(`[VerificationService] 인증 성공: ${phoneNumber}`);

      return {
        success: true,
        message: "인증이 완료되었습니다.",
      };
    } catch (error) {
      console.error("[VerificationService] 코드 확인 실패:", error);
      return {
        success: false,
        message: "인증 확인 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 인증 상태 확인
   */
  async isVerified(
    phoneNumber: string,
    purpose: string = "verification"
  ): Promise<boolean> {
    try {
      const key = this.getKey(phoneNumber, purpose);
      const data = await this.store.get(key);
      return data?.verified === true;
    } catch (error) {
      console.error("[VerificationService] 인증 상태 확인 실패:", error);
      return false;
    }
  }

  /**
   * 인증 데이터 삭제
   */
  async clearVerification(
    phoneNumber: string,
    purpose: string = "verification"
  ): Promise<void> {
    const key = this.getKey(phoneNumber, purpose);
    await this.store.delete(key);
  }

  /**
   * 이메일 기반 인증 코드 저장 (계정 삭제, 이메일 변경 등)
   */
  async saveCode(
    email: string,
    code: string,
    userId?: string,
    purpose: VerificationType = "signup",
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const key = this.getKey(email, purpose);
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + this.CODE_EXPIRY_MINUTES * 60 * 1000
      );

      const verificationData: VerificationData = {
        phoneNumber: email, // 이메일을 phoneNumber 필드에 저장 (호환성)
        code,
        createdAt: now,
        expiresAt,
        attempts: 0,
        verified: false,
        purpose,
      };

      await this.store.set(key, verificationData);

      console.log(
        `[VerificationService] 이메일 인증 코드 저장: ${email} -> ${code} (userId: ${userId || "N/A"}) (metadata: ${JSON.stringify(metadata)})`
      );
    } catch (error) {
      console.error("[VerificationService] 이메일 인증 코드 저장 실패:", error);
      throw error;
    }
  }

  /**
   * 인증 코드 삭제 (이메일 기반)
   */
  async deleteCode(
    email: string,
    purpose: VerificationType = "signup"
  ): Promise<void> {
    try {
      const key = this.getKey(email, purpose);
      await this.store.delete(key);

      console.log(
        `[VerificationService] 인증 코드 삭제: ${email} (${purpose})`
      );
    } catch (error) {
      console.error("[VerificationService] 인증 코드 삭제 실패:", error);
      throw error;
    }
  }

  /**
   * 개발/디버깅용 - 저장소 상태 조회
   */
  getStoreStats(): StoreStats | { message: string } {
    if (this.store instanceof InMemoryVerificationStore) {
      return this.store.getStats();
    }
    return { message: "Redis 저장소는 통계를 지원하지 않습니다." };
  }

  /**
   * 개발/디버깅용 - 저장소 상태 출력 (콘솔용)
   */
  debugStore(): void {
    const stats = this.getStoreStats();
    console.log("🔍 [VerificationStore Debug]", JSON.stringify(stats, null, 2));
  }

  /**
   * 인증 코드 생성 (6자리 숫자)
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 저장소 키 생성
   */
  private getKey(phoneNumber: string, purpose: string): string {
    const normalized = phoneNumber.replace(/[\s\-\(\)]/g, "");
    return `verification:${purpose}:${normalized}`;
  }

  /**
   * 재발송 가능 여부 확인
   */
  private canResend(data: VerificationData): boolean {
    const cooldownMs = this.RESEND_COOLDOWN_SECONDS * 1000;
    const timeSinceCreated = Date.now() - data.createdAt.getTime();
    return timeSinceCreated >= cooldownMs;
  }
}

// 싱글톤 인스턴스
let verificationService: VerificationCodeService;

/**
 * 인증 코드 서비스 인스턴스 반환
 */
export function getVerificationService(): VerificationCodeService {
  if (!verificationService) {
    verificationService = new VerificationCodeService();
  }
  return verificationService;
}

/**
 * 테스트 모드 확인
 */
export const isVerificationTestMode = (): boolean => {
  return process.env.VERIFICATION_TEST_MODE === "true";
};

/**
 * 싱글톤 인스턴스 (named export)
 */
export const verificationStore = getVerificationService();

export default VerificationCodeService;
