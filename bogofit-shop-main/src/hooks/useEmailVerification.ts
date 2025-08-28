import { useState, useCallback } from "react";

interface EmailVerificationState {
  isEmailSent: boolean;
  isEmailVerified: boolean;
  verificationCode: string;
  loading: boolean;
  error: string;
  success: string;
}

export const useEmailVerification = () => {
  const [state, setState] = useState<EmailVerificationState>({
    isEmailSent: false,
    isEmailVerified: false,
    verificationCode: "",
    loading: false,
    error: "",
    success: "",
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, success: "" }));
  }, []);

  const setSuccess = useCallback((success: string) => {
    setState((prev) => ({ ...prev, success, error: "" }));
  }, []);

  const setVerificationCode = useCallback((code: string) => {
    setState((prev) => ({ ...prev, verificationCode: code }));
  }, []);

  const clearMessages = useCallback(() => {
    setState((prev) => ({ ...prev, error: "", success: "" }));
  }, []);

  // 이메일 인증 코드 전송
  const sendVerificationEmail = useCallback(
    async (email: string, userName: string, userId: string) => {
      setLoading(true);
      clearMessages();

      // 재전송인 경우 상태 초기화
      if (state.isEmailSent) {
        setState((prev) => ({ ...prev, verificationCode: "" }));
        console.log("🔄 재전송 요청 - 상태 초기화");
      }

      try {
        const response = await fetch("/api/auth/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            userName,
            userId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setState((prev) => ({ ...prev, isEmailSent: true }));
          setSuccess("인증번호가 이메일로 전송되었습니다. 확인해주세요!");
        } else {
          setError(data.message || "이메일 전송에 실패했습니다.");
          setState((prev) => ({ ...prev, isEmailSent: false }));
        }
      } catch (error) {
        console.error("이메일 전송 에러:", error);
        setError("이메일 전송 중 오류가 발생했습니다.");
        setState((prev) => ({ ...prev, isEmailSent: false }));
      } finally {
        setLoading(false);
      }
    },
    [state.isEmailSent, setLoading, clearMessages, setSuccess, setError]
  );

  // 이메일 인증 코드 확인
  const verifyEmailCode = useCallback(
    async (email: string, code: string) => {
      setLoading(true);
      clearMessages();

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            code,
            type: "signup",
          }),
        });

        const data = await response.json();

        if (data.success) {
          setState((prev) => ({ ...prev, isEmailVerified: true }));
          setSuccess(
            "이메일 인증이 완료되었습니다! 회원가입을 진행하겠습니다."
          );
          return true;
        } else {
          setError(data.message || "인증번호가 올바르지 않습니다.");
          return false;
        }
      } catch (error) {
        console.error("인증 확인 에러:", error);
        setError("인증 확인 중 오류가 발생했습니다.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, clearMessages, setSuccess, setError]
  );

  const resetVerification = useCallback(() => {
    setState({
      isEmailSent: false,
      isEmailVerified: false,
      verificationCode: "",
      loading: false,
      error: "",
      success: "",
    });
  }, []);

  return {
    ...state,
    setVerificationCode,
    sendVerificationEmail,
    verifyEmailCode,
    resetVerification,
    clearMessages,
  };
};
