"use client";

import { useState, useCallback } from "react";

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
  const { onVerified, onError, onCodeSent, purpose = "verification" } = options;

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
   * 전화번호 정규화
   */
  const normalizePhoneNumber = useCallback((phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

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
  }, []);

  /**
   * 전화번호 유효성 검사
   */
  const validatePhoneNumber = useCallback((phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");
    const koreanPattern = /^(01[0-9])\d{8}$/;
    const internationalPattern = /^\+82(1[0-9])\d{8}$/;

    return koreanPattern.test(cleaned) || internationalPattern.test(cleaned);
  }, []);

  /**
   * 인증 코드 발송
   */
  const sendCode = useCallback(
    async (
      phoneNumber: string,
      channel: "sms" | "call" = "sms"
    ): Promise<boolean> => {
      // 유효성 검사
      if (!validatePhoneNumber(phoneNumber)) {
        setError("올바른 전화번호를 입력해주세요. (예: 010-1234-5678)");
        return false;
      }

      updateState({ isLoading: true, error: null, success: null });

      try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

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

        const result: ApiResponse = await response.json();

        if (result.success) {
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
          setError(result.error || "인증 코드 발송에 실패했습니다.");
          return false;
        }
      } catch (error) {
        console.error("인증 코드 발송 오류:", error);
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
  };
}

export default useSmsVerification;
