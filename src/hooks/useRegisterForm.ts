import { useState, useCallback } from "react";
import {
  formatPhoneNumber,
  validateEmail,
  validatePhoneNumber,
} from "@/lib/formatters";

export interface RegisterFormData {
  // 기본 정보
  userId: string;
  email: string;
  password: string;
  confirmPassword: string;

  // 추가 정보 (DB 스키마에 맞춤)
  name: string;
  phoneNumber: string;
  gender: string;
  birthDate?: Date;
  profile: string;

  // 주소 정보
  zipCode: string;
  address: string;
  addressDetail: string;
}

interface RegisterFormValidation {
  isValid: boolean;
  errors: string[];
}

export const useRegisterForm = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    userId: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phoneNumber: "",
    gender: "",
    birthDate: undefined,
    profile: "",
    zipCode: "",
    address: "",
    addressDetail: "",
  });

  const updateField = useCallback(
    (field: keyof RegisterFormData, value: string | Date | undefined) => {
      setFormData((prev) => {
        // 연락처 필드인 경우 자동 포맷팅 적용
        if (field === "phoneNumber" && typeof value === "string") {
          value = formatPhoneNumber(value);
        }

        return {
          ...prev,
          [field]: value,
        };
      });
    },
    []
  );

  const validateForm = useCallback((): RegisterFormValidation => {
    const errors: string[] = [];

    // 필수 필드 검증
    if (!formData.userId.trim()) {
      errors.push("아이디를 입력해주세요.");
    } else if (formData.userId.length < 4) {
      errors.push("아이디는 4자 이상이어야 합니다.");
    }

    if (!formData.name.trim()) {
      errors.push("이름을 입력해주세요.");
    }

    if (!formData.email.trim()) {
      errors.push("이메일을 입력해주세요.");
    } else if (!validateEmail(formData.email)) {
      errors.push("올바른 이메일 형식을 입력해주세요.");
    }

    if (!formData.password.trim()) {
      errors.push("비밀번호를 입력해주세요.");
    } else if (formData.password.length < 6) {
      errors.push("비밀번호는 6자 이상이어야 합니다.");
    }

    if (!formData.confirmPassword.trim()) {
      errors.push("비밀번호 확인을 입력해주세요.");
    } else if (formData.password !== formData.confirmPassword) {
      errors.push("비밀번호가 일치하지 않습니다.");
    }

    // 휴대폰 번호 유효성 검사 (선택사항)
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      errors.push(
        "올바른 휴대폰 번호 형식을 입력해주세요. (예: 010-1234-5678)"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      userId: "",
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phoneNumber: "",
      gender: "",
      birthDate: undefined,
      profile: "",
      zipCode: "",
      address: "",
      addressDetail: "",
    });
  }, []);

  return {
    formData,
    updateField,
    validateForm,
    resetForm,
  };
};
