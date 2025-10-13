/**
 * 숫자 포맷 유틸리티
 * Hydration mismatch 방지를 위해 locale을 명시적으로 지정
 */

/**
 * 한국 통화 형식으로 숫자 포맷 (천 단위 콤마)
 * @param value - 포맷할 숫자
 * @returns 포맷된 문자열 (예: "1,234,567")
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  
  // ko-KR locale을 명시적으로 지정하여 server/client 간 일관성 보장
  return num.toLocaleString("ko-KR");
}

/**
 * 가격 포맷 (원 단위 포함)
 * @param value - 포맷할 가격
 * @param includeCurrency - 통화 기호 포함 여부 (기본: false)
 * @returns 포맷된 가격 문자열 (예: "1,234,567원" 또는 "1,234,567")
 */
export function formatPrice(
  value: number | string,
  includeCurrency: boolean = false
): string {
  const formatted = formatNumber(value);
  return includeCurrency ? `${formatted}원` : formatted;
}

/**
 * 통화 기호와 함께 가격 포맷
 * @param value - 포맷할 가격
 * @returns 포맷된 가격 문자열 (예: "₩1,234,567")
 */
export function formatCurrency(value: number | string): string {
  return `₩${formatNumber(value)}`;
}

/**
 * 날짜 포맷 (한국 시간)
 * @param date - 포맷할 날짜
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  });
}

/**
 * 날짜만 포맷 (시간 제외)
 * @param date - 포맷할 날짜
 * @returns 포맷된 날짜 문자열
 */
export function formatDateOnly(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  });
}

/**
 * 전화번호 포맷 (하이픈 추가)
 * @param phoneNumber - 포맷할 전화번호
 * @returns 포맷된 전화번호 (예: "010-1234-5678")
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // 숫자만 추출
  const cleaned = phoneNumber.replace(/\D/g, "");
  
  // 전화번호 형식에 맞게 포맷
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phoneNumber;
}

/**
 * 이메일 유효성 검사
 * @param email - 검증할 이메일
 * @returns 유효하면 true, 아니면 false
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 전화번호 유효성 검사
 * @param phoneNumber - 검증할 전화번호
 * @returns 유효하면 true, 아니면 false
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // 숫자만 추출
  const cleaned = phoneNumber.replace(/\D/g, "");
  
  // 한국 전화번호 형식 (10자리 또는 11자리)
  return cleaned.length === 10 || cleaned.length === 11;
}