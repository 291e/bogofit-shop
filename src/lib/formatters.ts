/**
 * 연락처 자동 포맷팅 함수
 * @param value 입력된 연락처 문자열
 * @returns 포맷된 연락처 (010-1234-5678 형식)
 */
export const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, "");

  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
};

/**
 * 이메일 유효성 검사
 * @param email 이메일 주소
 * @returns 유효성 여부
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 휴대폰 번호 유효성 검사
 * @param phone 휴대폰 번호
 * @returns 유효성 여부
 */
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // 선택사항이므로 빈 값은 허용
  return /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(phone.replace(/-/g, ""));
};
