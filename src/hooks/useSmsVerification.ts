"use client";

import { useState, useCallback } from "react";

// 국가 코드 타입
export interface CountryCode {
  code: string;
  name: string;
  flag: string;
  pattern: RegExp;
  example: string;
}

// 지원하는 국가 목록
export const SUPPORTED_COUNTRIES: CountryCode[] = [
  {
    code: "+82",
    name: "한국",
    flag: "🇰🇷",
    pattern: /^(1[0-9])\d{8}$/,
    example: "010-1234-5678",
  },
  {
    code: "+1",
    name: "미국/캐나다",
    flag: "🇺🇸",
    pattern: /^(\d{3})\d{7}$/,
    example: "555-123-4567",
  },
  {
    code: "+44",
    name: "영국",
    flag: "🇬🇧",
    pattern: /^(7\d{9}|1\d{10}|2\d{9}|3\d{9}|5\d{9}|8\d{9})$/,
    example: "7123-456-789",
  },
  {
    code: "+61",
    name: "호주",
    flag: "🇦🇺",
    pattern: /^(4\d{8})$/,
    example: "412-345-678",
  },
  {
    code: "+81",
    name: "일본",
    flag: "🇯🇵",
    pattern: /^(70|80|90)\d{8}$/,
    example: "90-1234-5678",
  },
  {
    code: "+86",
    name: "중국",
    flag: "🇨🇳",
    pattern: /^(1[3-9])\d{9}$/,
    example: "138-1234-5678",
  },
  {
    code: "+52",
    name: "멕시코",
    flag: "🇲🇽",
    pattern: /^(1|2|3|4|5|6|7|8|9)\d{9}$/,
    example: "55-1234-5678",
  },
  {
    code: "+62",
    name: "인도네시아",
    flag: "🇮🇩",
    pattern: /^(8[1-9])\d{8}$/,
    example: "812-3456-789",
  },
  {
    code: "+971",
    name: "아랍에미리트",
    flag: "🇦🇪",
    pattern: /^(5[0-9])\d{7}$/,
    example: "50-123-4567",
  },
  {
    code: "+84",
    name: "베트남",
    flag: "🇻🇳",
    pattern: /^(3[0-9]|5[0-9]|7[0-9]|8[0-9]|9[0-9])\d{8}$/,
    example: "90-123-4567",
  },
  {
    code: "+855",
    name: "캄보디아",
    flag: "🇰🇭",
    pattern: /^(1[0-9]|3[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{7}$/,
    example: "12-345-678",
  },
];

// 인증 상태 타입
export interface VerificationState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  isCodeSent: boolean;
  isVerified: boolean;
  countdown: number;
  remainingAttempts: number | null;
}

// API 응답 타입
interface ApiResponse {
  success: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  error?: string;
}

// 훅 옵션
interface UseSmsVerificationOptions {
  onVerified?: (phoneNumber: string) => void;
  onError?: (error: string) => void;
  onCodeSent?: (phoneNumber: string) => void;
  purpose?: string;
  defaultCountry?: string;
}

// 훅 반환 타입
export interface UseSmsVerificationReturn {
  state: VerificationState;
  sendCode: (phoneNumber: string, channel?: "sms" | "call") => Promise<boolean>;
  verifyCode: (phoneNumber: string, code: string) => Promise<boolean>;
  checkVerificationStatus: (phoneNumber: string) => Promise<boolean>;
  clearError: () => void;
  clearSuccess: () => void;
  reset: () => void;
  startCountdown: (seconds?: number) => void;
  getCountryByCode: (code: string) => CountryCode | undefined;
  validatePhoneNumber: (phoneNumber: string, countryCode?: string) => boolean;
  normalizePhoneNumber: (phoneNumber: string, countryCode?: string) => string;
  formatPhoneNumber: (phoneNumber: string, countryCode?: string) => string;
}

/**
 * SMS 인증 커스텀 훅
 *
 * @param options - 훅 옵션
 * @returns 인증 상태와 함수들
 */
export function useSmsVerification(
  options: UseSmsVerificationOptions = {}
): UseSmsVerificationReturn {
  const {
    onVerified,
    onError,
    onCodeSent,
    purpose = "verification",
    defaultCountry = "+82",
  } = options;

  // 상태 관리
  const [state, setState] = useState<VerificationState>({
    isLoading: false,
    error: null,
    success: null,
    isCodeSent: false,
    isVerified: false,
    countdown: 0,
    remainingAttempts: null,
  });

  /**
   * 상태 업데이트 헬퍼
   */
  const updateState = useCallback((updates: Partial<VerificationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * 에러 설정
   */
  const setError = useCallback(
    (error: string) => {
      updateState({ error, success: null });
      onError?.(error);
    },
    [updateState, onError]
  );

  /**
   * 성공 설정
   */
  const setSuccess = useCallback(
    (success: string) => {
      updateState({ success, error: null });
    },
    [updateState]
  );

  /**
   * 카운트다운 시작
   */
  const startCountdown = useCallback(
    (seconds: number = 60) => {
      updateState({ countdown: seconds });

      const interval = setInterval(() => {
        setState((prev) => {
          const newCountdown = prev.countdown - 1;
          if (newCountdown <= 0) {
            clearInterval(interval);
            return { ...prev, countdown: 0 };
          }
          return { ...prev, countdown: newCountdown };
        });
      }, 1000);

      return () => clearInterval(interval);
    },
    [updateState]
  );

  /**
   * 국가 코드로 국가 정보 조회
   */
  const getCountryByCode = useCallback(
    (code: string): CountryCode | undefined => {
      return SUPPORTED_COUNTRIES.find((country) => country.code === code);
    },
    []
  );

  /**
   * 전화번호 자동 포맷팅
   */
  const formatPhoneNumber = useCallback(
    (phoneNumber: string, countryCode: string = defaultCountry): string => {
      const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");
      const country = getCountryByCode(countryCode);

      if (!country) {
        // 기본값으로 한국 포맷팅
        if (cleaned.length <= 3) {
          return cleaned;
        } else if (cleaned.length <= 7) {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        } else {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
        }
      }

      // 국가별 포맷팅
      switch (country.code) {
        case "+82": // 한국
          if (cleaned.length <= 3) {
            return cleaned;
          } else if (cleaned.length <= 7) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
          } else {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
          }
        case "+1": // 미국/캐나다
          if (cleaned.length <= 3) {
            return cleaned;
          } else if (cleaned.length <= 6) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
          } else {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
          }
        case "+44": // 영국
          if (cleaned.length <= 4) {
            return cleaned;
          } else if (cleaned.length <= 7) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
          } else {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
          }
        default:
          // 기본 포맷팅 (3-4-4)
          if (cleaned.length <= 3) {
            return cleaned;
          } else if (cleaned.length <= 7) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
          } else {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
          }
      }
    },
    [defaultCountry, getCountryByCode]
  );

  /**
   * 전화번호 정규화
   */
  const normalizePhoneNumber = useCallback(
    (phoneNumber: string, countryCode: string = defaultCountry): string => {
      const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");
      const country = getCountryByCode(countryCode);

      if (!country) {
        // 기본값으로 한국 처리
        if (cleaned.startsWith("+82")) {
          return cleaned;
        }
        if (cleaned.startsWith("82")) {
          return "+" + cleaned;
        }
        if (cleaned.startsWith("0")) {
          return "+82" + cleaned.substring(1);
        }
        return "+82" + cleaned;
      }

      // 이미 국가 코드가 포함된 경우
      if (cleaned.startsWith(country.code)) {
        return cleaned;
      }

      // 국가 코드만 있는 경우 (예: +82)
      if (cleaned.startsWith(country.code.substring(1))) {
        return country.code + cleaned;
      }

      // 한국의 경우 0으로 시작하면 제거
      if (country.code === "+82" && cleaned.startsWith("0")) {
        return country.code + cleaned.substring(1);
      }

      // 다른 국가들은 그대로 추가
      return country.code + cleaned;
    },
    [defaultCountry, getCountryByCode]
  );

  /**
   * 전화번호 유효성 검사
   */
  const validatePhoneNumber = useCallback(
    (phoneNumber: string, countryCode: string = defaultCountry): boolean => {
      console.log("🔍 validatePhoneNumber 시작");
      console.log("📱 입력 전화번호:", phoneNumber);
      console.log("🌍 국가 코드:", countryCode);

      const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");
      console.log("🧹 정리된 번호:", cleaned);

      const country = getCountryByCode(countryCode);
      console.log("🏳️ 국가 정보:", country);

      if (!country) {
        console.log("❌ 국가 정보 없음, 기본 한국 패턴 사용");
        // 기본값으로 한국 패턴 검사
        const koreanPattern = /^(01[0-9])\d{8}$/;
        const internationalPattern = /^\+82(1[0-9])\d{8}$/;
        const result =
          koreanPattern.test(cleaned) || internationalPattern.test(cleaned);
        console.log("✅ 기본 패턴 검사 결과:", result);
        return result;
      }

      // 국가별 전화번호 패턴 검사
      let numberToTest = cleaned;
      console.log("🔢 테스트할 번호 (초기):", numberToTest);

      // 국가 코드가 포함된 경우 제거
      if (cleaned.startsWith(country.code)) {
        numberToTest = cleaned.substring(country.code.length);
        console.log("🔢 국가 코드 제거 후:", numberToTest);
      }

      // 한국의 경우 0으로 시작하면 제거
      if (country.code === "+82" && numberToTest.startsWith("0")) {
        numberToTest = numberToTest.substring(1);
        console.log("🔢 0 제거 후:", numberToTest);
      }

      const result = country.pattern.test(numberToTest);
      console.log("✅ 패턴 검사 결과:", result);
      console.log("📋 패턴:", country.pattern);
      console.log("🔢 최종 테스트 번호:", numberToTest);

      return result;
    },
    [defaultCountry, getCountryByCode]
  );

  /**
   * 인증 코드 발송
   */
  const sendCode = useCallback(
    async (
      phoneNumber: string,
      channel: "sms" | "call" = "sms"
    ): Promise<boolean> => {
      console.log("🔍 sendCode 훅 시작");
      console.log("📱 입력 전화번호:", phoneNumber);
      console.log("🌍 기본 국가:", defaultCountry);

      // 숫자만 추출하여 유효성 검사
      const numbers = phoneNumber.replace(/-/g, "");
      console.log("🔢 숫자만 추출:", numbers);

      // 유효성 검사
      if (!validatePhoneNumber(numbers)) {
        console.log("❌ 훅에서 전화번호 유효성 검사 실패");
        const country = getCountryByCode(defaultCountry);
        setError(
          `올바른 전화번호를 입력해주세요. (예: ${country?.example || "010-1234-5678"})`
        );
        return false;
      }

      console.log("✅ 훅에서 전화번호 유효성 검사 통과");
      updateState({ isLoading: true, error: null, success: null });

      try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        console.log("📞 정규화된 전화번호:", normalizedPhone);

        console.log("🌐 API 요청 시작");
        const response = await fetch("/api/verification/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: normalizedPhone,
            purpose,
            channel,
          }),
        });

        console.log("📡 API 응답 상태:", response.status);
        const result: ApiResponse = await response.json();
        console.log("📄 API 응답:", result);

        if (result.success) {
          console.log("✅ API 성공 응답");
          setSuccess(result.message);
          updateState({
            isCodeSent: true,
            remainingAttempts: null,
          });
          startCountdown(60);
          onCodeSent?.(normalizedPhone);

          // 테스트 모드에서 코드 로깅
          if (result.data?.testCode) {
            console.log(`[테스트 모드] 인증 코드: ${result.data.testCode}`);
          }

          return true;
        } else {
          console.log("❌ API 실패 응답:", result.error);
          setError(result.error || "인증 코드 발송에 실패했습니다.");
          return false;
        }
      } catch (error) {
        console.error("❌ 인증 코드 발송 오류:", error);
        setError("네트워크 오류가 발생했습니다.");
        return false;
      } finally {
        updateState({ isLoading: false });
      }
    },
    [
      validatePhoneNumber,
      normalizePhoneNumber,
      purpose,
      updateState,
      setError,
      setSuccess,
      startCountdown,
      onCodeSent,
      defaultCountry,
      getCountryByCode,
    ]
  );

  /**
   * 인증 코드 확인
   */
  const verifyCode = useCallback(
    async (phoneNumber: string, code: string): Promise<boolean> => {
      // 유효성 검사
      if (code.length !== 6 || !/^\d{6}$/.test(code)) {
        setError("6자리 숫자 인증 코드를 입력해주세요.");
        return false;
      }

      updateState({ isLoading: true, error: null, success: null });

      try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        const response = await fetch("/api/verification/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: normalizedPhone,
            code,
            purpose,
          }),
        });

        const result: ApiResponse = await response.json();

        if (result.success && result.data?.verified) {
          setSuccess("인증이 완료되었습니다!");
          updateState({
            isVerified: true,
            remainingAttempts: null,
          });
          onVerified?.(normalizedPhone);
          return true;
        } else {
          setError(result.message || "인증 코드가 올바르지 않습니다.");
          updateState({
            remainingAttempts: result.data?.remainingAttempts || null,
          });
          return false;
        }
      } catch (error) {
        console.error("인증 코드 확인 오류:", error);
        setError("네트워크 오류가 발생했습니다.");
        return false;
      } finally {
        updateState({ isLoading: false });
      }
    },
    [
      normalizePhoneNumber,
      purpose,
      updateState,
      setError,
      setSuccess,
      onVerified,
    ]
  );

  /**
   * 인증 상태 확인
   */
  const checkVerificationStatus = useCallback(
    async (phoneNumber: string): Promise<boolean> => {
      try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        const response = await fetch(
          `/api/verification/verify?phoneNumber=${encodeURIComponent(normalizedPhone)}&purpose=${purpose}`,
          {
            method: "GET",
          }
        );

        const result: ApiResponse = await response.json();

        if (result.success && result.data?.verified) {
          updateState({ isVerified: true });
          return true;
        }

        return false;
      } catch (error) {
        console.error("인증 상태 확인 오류:", error);
        return false;
      }
    },
    [normalizePhoneNumber, purpose, updateState]
  );

  /**
   * 에러 클리어
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * 성공 메시지 클리어
   */
  const clearSuccess = useCallback(() => {
    updateState({ success: null });
  }, [updateState]);

  /**
   * 상태 리셋
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      success: null,
      isCodeSent: false,
      isVerified: false,
      countdown: 0,
      remainingAttempts: null,
    });
  }, []);

  return {
    state,
    sendCode,
    verifyCode,
    checkVerificationStatus,
    clearError,
    clearSuccess,
    reset,
    startCountdown,
    getCountryByCode,
    validatePhoneNumber,
    normalizePhoneNumber,
    formatPhoneNumber,
  };
}

export default useSmsVerification;
