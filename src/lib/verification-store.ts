// 임시 인증번호 저장소 (메모리 기반)
// 실제 프로덕션에서는 Redis나 데이터베이스 사용 권장

// 이메일 인증 타입 정의
export type VerificationType =
  | "signup" // 회원가입 이메일 인증
  | "password-reset" // 비밀번호 초기화 인증
  | "email-change" // 이메일 주소 변경 인증
  | "account-deletion" // 계정 삭제 확인 인증
  | "profile-update"; // 중요한 프로필 정보 수정 인증

interface VerificationEntry {
  code: string;
  userId: string;
  email: string;
  type: VerificationType;
  expiresAt: number; // timestamp
  attempts: number;
  metadata?: Record<string, unknown>; // 각 인증 타입별 메타데이터
}

class VerificationStore {
  private store = new Map<string, VerificationEntry>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly EXPIRY_MINUTES = 30; // 개발환경 테스트를 위해 30분으로 연장
  private initialized = false;

  constructor() {
    if (!this.initialized) {
      console.log(
        `🏗️ [VERIFICATION STORE] New VerificationStore instance created`
      );
      console.log(
        `⏰ [VERIFICATION STORE] Code expiry time: ${this.EXPIRY_MINUTES} minutes`
      );
      console.log(`🔢 [VERIFICATION STORE] Max attempts: ${this.MAX_ATTEMPTS}`);
      this.initialized = true;
    }
  }

  // 인증번호 저장
  saveCode(
    email: string,
    code: string,
    userId: string,
    type: VerificationType = "password-reset",
    metadata?: Record<string, unknown>
  ): void {
    const key = this.getKey(email, type);
    const expiresAt = Date.now() + this.EXPIRY_MINUTES * 60 * 1000;

    console.log(`💾 Saving verification code for: ${email} (${type})`);
    console.log(`🔑 Generated key: ${key}`);
    console.log(`🎫 Code: ${code} -> ${code.toUpperCase()}`);

    this.store.set(key, {
      code: code.toUpperCase(),
      userId,
      email,
      type,
      expiresAt,
      attempts: 0,
      metadata,
    });

    console.log(`✅ Verification code saved for ${email} (${type}): ${code}`);
    console.log(`⏰ Expires at: ${new Date(expiresAt).toLocaleString()}`);
    console.log(`📦 Current store size: ${this.store.size}`);
    console.log(`📦 All keys: [${Array.from(this.store.keys()).join(", ")}]`);
    if (metadata) {
      console.log(`📋 Metadata:`, metadata);
    }
  }

  // 인증번호 검증
  verifyCode(
    email: string,
    inputCode: string,
    type: VerificationType = "password-reset"
  ): {
    success: boolean;
    message: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  } {
    const key = this.getKey(email, type);
    console.log(
      `🔍 Verifying email: ${email} with code: ${inputCode} for type: ${type}`
    );
    console.log(`🔑 Looking for key: ${key}`);
    console.log(
      `📦 Current store keys: [${Array.from(this.store.keys()).join(", ")}]`
    );

    const entry = this.store.get(key);

    if (!entry) {
      console.log(`❌ No entry found for key: ${key}`);
      console.log(`🔍 Possible causes:`);
      console.log(`   1. Server restarted (development hot reload)`);
      console.log(`   2. Code expired (30 minutes)`);
      console.log(`   3. Wrong email or verification type`);
      console.log(`   4. Code was already used successfully`);

      return {
        success: false,
        message:
          "인증번호를 찾을 수 없습니다. 개발환경에서는 서버 재시작으로 인해 인증번호가 초기화될 수 있습니다. 새로운 인증번호를 요청해주세요.",
      };
    }

    // 만료 확인
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return {
        success: false,
        message: "인증번호가 만료되었습니다. 다시 요청해주세요.",
      };
    }

    // 시도 횟수 확인
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      this.store.delete(key);
      return {
        success: false,
        message: "인증 시도 횟수를 초과했습니다. 다시 요청해주세요.",
      };
    }

    // 시도 횟수 증가
    entry.attempts++;

    // 인증번호 확인
    if (entry.code !== inputCode.toUpperCase()) {
      return {
        success: false,
        message: `인증번호가 올바르지 않습니다. (${this.MAX_ATTEMPTS - entry.attempts}회 남음)`,
      };
    }

    // 성공 시 삭제
    this.store.delete(key);
    console.log(`✅ Verification successful for ${email} (${type})`);

    return {
      success: true,
      message: "인증이 완료되었습니다.",
      userId: entry.userId,
      metadata: entry.metadata,
    };
  }

  // 인증번호 삭제
  deleteCode(email: string, type: VerificationType = "password-reset"): void {
    const key = this.getKey(email, type);
    this.store.delete(key);
  }

  // 만료된 코드 정리 (메모리 관리)
  cleanup(): void {
    const now = Date.now();
    let cleanupCount = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        cleanupCount++;
      }
    }

    if (cleanupCount > 0) {
      console.log(`🧹 Cleaned up ${cleanupCount} expired verification codes`);
    }
  }

  private getKey(email: string, type: string): string {
    return `${type}:${email.toLowerCase()}`;
  }

  // Store 상태 디버깅 메서드
  public debugStore(): void {
    console.log(`🔍 [DEBUG] ===== STORE STATE DEBUG =====`);
    console.log(`📦 Store size: ${this.store.size}`);
    console.log(`🗝️ All keys: [${Array.from(this.store.keys()).join(", ")}]`);
    console.log(`⏰ Current time: ${new Date().toLocaleString()}`);

    if (this.store.size === 0) {
      console.log(`❌ STORE IS EMPTY! This might be the problem.`);
    }

    this.store.forEach((entry, key) => {
      const isExpired = Date.now() > entry.expiresAt;
      console.log(`🔑 Key: ${key}`);
      console.log(`   📝 Code: ${entry.code}`);
      console.log(`   👤 UserId: ${entry.userId}`);
      console.log(`   📧 Email: ${entry.email}`);
      console.log(`   🏷️ Type: ${entry.type}`);
      console.log(
        `   ⏰ Expires: ${new Date(entry.expiresAt).toLocaleString()}`
      );
      console.log(`   ❌ Expired: ${isExpired}`);
      console.log(`   🔢 Attempts: ${entry.attempts}/${this.MAX_ATTEMPTS}`);
      if (entry.metadata) {
        console.log(`   📋 Metadata:`, entry.metadata);
      }
    });
    console.log(`🔍 [DEBUG] ===== END STORE DEBUG =====`);
  }

  // 디버그용 - 저장된 코드 확인
  getStoredCodes(): Array<{
    email: string;
    code: string;
    type: string;
    expiresAt: string;
    attempts: number;
  }> {
    const codes = [];
    for (const [key, entry] of this.store.entries()) {
      console.log(key, entry);
      codes.push({
        email: entry.email,
        code: entry.code,
        type: entry.type,
        expiresAt: new Date(entry.expiresAt).toLocaleString(),
        attempts: entry.attempts,
      });
    }
    return codes;
  }
}

// 싱글톤 인스턴스
export const verificationStore = new VerificationStore();

// 정기적 정리 (5분마다)
if (typeof window === "undefined") {
  // 서버에서만 실행
  setInterval(
    () => {
      verificationStore.cleanup();
    },
    5 * 60 * 1000
  );
}
