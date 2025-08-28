// 비즈니스 정보 관련 데이터
export interface BusinessInfo {
  companyName: string;
  businessNumber: string;
  representativeName: string;
  businessType: string;
  industry: string;
  establishedDate: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  phone: string;
  fax?: string;
  email: string;
  website?: string;
  description?: string;
  logoUrl?: string;
}

// 알림 설정 관련 데이터
export interface NotificationSettings {
  id: string;
  category: string;
  name: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  isRequired: boolean;
}

// API 키 관리 관련 데이터
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: "active" | "inactive" | "expired";
  permissions: string[];
  createdDate: string;
  lastUsed?: string;
  expiryDate?: string;
  usageCount: number;
  description?: string;
}

// 웹훅 설정 관련 데이터
export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  secret: string;
  retryCount: number;
  timeout: number;
  createdDate: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

// 비즈니스 정보 모의 데이터
export const mockBusinessInfo: BusinessInfo = {
  companyName: "보고핏 주식회사",
  businessNumber: "123-45-67890",
  representativeName: "김대표",
  businessType: "주식회사",
  industry: "전자상거래업",
  establishedDate: "2022-03-15",
  address: "서울특별시 강남구 테헤란로 123",
  detailAddress: "7층 701호",
  zipCode: "06234",
  phone: "02-1234-5678",
  fax: "02-1234-5679",
  email: "contact@bogofit.com",
  website: "https://www.bogofit.com",
  description: "개인 맞춤형 피트니스 의류 전문 브랜드",
  logoUrl: "/logo.png",
};

// 알림 설정 모의 데이터
export const mockNotificationSettings: NotificationSettings[] = [
  {
    id: "NOTIF-001",
    category: "주문 관리",
    name: "신규 주문 알림",
    description: "새로운 주문이 접수되었을 때 알림을 받습니다.",
    email: true,
    sms: true,
    push: true,
    isRequired: true,
  },
  {
    id: "NOTIF-002",
    category: "주문 관리",
    name: "주문 취소 알림",
    description: "주문이 취소되었을 때 알림을 받습니다.",
    email: true,
    sms: false,
    push: true,
    isRequired: true,
  },
  {
    id: "NOTIF-003",
    category: "주문 관리",
    name: "배송 완료 알림",
    description: "배송이 완료되었을 때 알림을 받습니다.",
    email: true,
    sms: false,
    push: false,
    isRequired: false,
  },
  {
    id: "NOTIF-004",
    category: "고객 관리",
    name: "고객 문의 알림",
    description: "새로운 고객 문의가 접수되었을 때 알림을 받습니다.",
    email: true,
    sms: false,
    push: true,
    isRequired: false,
  },
  {
    id: "NOTIF-005",
    category: "고객 관리",
    name: "리뷰 등록 알림",
    description: "새로운 상품 리뷰가 등록되었을 때 알림을 받습니다.",
    email: true,
    sms: false,
    push: false,
    isRequired: false,
  },
  {
    id: "NOTIF-006",
    category: "정산",
    name: "정산 완료 알림",
    description: "정산이 완료되었을 때 알림을 받습니다.",
    email: true,
    sms: true,
    push: true,
    isRequired: true,
  },
  {
    id: "NOTIF-007",
    category: "정산",
    name: "정산 실패 알림",
    description: "정산이 실패했을 때 알림을 받습니다.",
    email: true,
    sms: true,
    push: true,
    isRequired: true,
  },
  {
    id: "NOTIF-008",
    category: "시스템",
    name: "서비스 점검 알림",
    description: "서비스 점검 시 사전 알림을 받습니다.",
    email: true,
    sms: false,
    push: true,
    isRequired: false,
  },
  {
    id: "NOTIF-009",
    category: "시스템",
    name: "보안 알림",
    description: "비정상적인 접근이나 보안 이슈 발생 시 알림을 받습니다.",
    email: true,
    sms: true,
    push: true,
    isRequired: true,
  },
];

// API 키 모의 데이터
export const mockApiKeys: ApiKey[] = [
  {
    id: "API-001",
    name: "메인 API 키",
    key: "bogo_live_sk_***************abc123",
    status: "active",
    permissions: [
      "read:orders",
      "write:orders",
      "read:products",
      "write:products",
    ],
    createdDate: "2024-01-15",
    lastUsed: "2024-01-28",
    usageCount: 1250,
    description: "메인 서비스용 API 키",
  },
  {
    id: "API-002",
    name: "분석용 API 키",
    key: "bogo_live_sk_***************def456",
    status: "active",
    permissions: ["read:analytics", "read:orders"],
    createdDate: "2024-02-01",
    lastUsed: "2024-01-27",
    usageCount: 890,
    description: "데이터 분석 및 리포팅용",
  },
  {
    id: "API-003",
    name: "테스트 API 키",
    key: "bogo_test_sk_***************ghi789",
    status: "inactive",
    permissions: ["read:orders", "read:products"],
    createdDate: "2023-12-10",
    lastUsed: "2024-01-20",
    usageCount: 156,
    description: "개발 및 테스트용",
  },
];

// 웹훅 설정 모의 데이터
export const mockWebhookConfigs: WebhookConfig[] = [
  {
    id: "WEBHOOK-001",
    name: "주문 처리 웹훅",
    url: "https://api.bogofit.com/webhooks/orders",
    events: ["order.created", "order.updated", "order.cancelled"],
    status: "active",
    secret: "wh_sec_***************xyz123",
    retryCount: 3,
    timeout: 30,
    createdDate: "2024-01-10",
    lastTriggered: "2024-01-28",
    successCount: 145,
    failureCount: 2,
  },
  {
    id: "WEBHOOK-002",
    name: "결제 알림 웹훅",
    url: "https://api.bogofit.com/webhooks/payments",
    events: ["payment.succeeded", "payment.failed"],
    status: "active",
    secret: "wh_sec_***************abc456",
    retryCount: 5,
    timeout: 45,
    createdDate: "2024-01-15",
    lastTriggered: "2024-01-28",
    successCount: 89,
    failureCount: 0,
  },
  {
    id: "WEBHOOK-003",
    name: "재고 알림 웹훅",
    url: "https://api.bogofit.com/webhooks/inventory",
    events: ["inventory.low", "inventory.out"],
    status: "inactive",
    secret: "wh_sec_***************def789",
    retryCount: 3,
    timeout: 30,
    createdDate: "2023-12-20",
    lastTriggered: "2024-01-25",
    successCount: 23,
    failureCount: 1,
  },
];

// 업종 옵션
export const industryOptions = [
  { value: "전자상거래업", label: "전자상거래업" },
  { value: "소매업", label: "소매업" },
  { value: "도매업", label: "도매업" },
  { value: "제조업", label: "제조업" },
  { value: "서비스업", label: "서비스업" },
  { value: "기타", label: "기타" },
];

// 사업자 형태 옵션
export const businessTypeOptions = [
  { value: "개인사업자", label: "개인사업자" },
  { value: "주식회사", label: "주식회사" },
  { value: "유한회사", label: "유한회사" },
  { value: "합명회사", label: "합명회사" },
  { value: "합자회사", label: "합자회사" },
];

// API 권한 옵션
export const apiPermissionOptions = [
  { value: "read:orders", label: "주문 조회" },
  { value: "write:orders", label: "주문 생성/수정" },
  { value: "read:products", label: "상품 조회" },
  { value: "write:products", label: "상품 생성/수정" },
  { value: "read:analytics", label: "분석 데이터 조회" },
  { value: "read:settlements", label: "정산 데이터 조회" },
];

// 웹훅 이벤트 옵션
export const webhookEventOptions = [
  { value: "order.created", label: "주문 생성" },
  { value: "order.updated", label: "주문 수정" },
  { value: "order.cancelled", label: "주문 취소" },
  { value: "payment.succeeded", label: "결제 성공" },
  { value: "payment.failed", label: "결제 실패" },
  { value: "product.created", label: "상품 생성" },
  { value: "product.updated", label: "상품 수정" },
  { value: "inventory.low", label: "재고 부족" },
  { value: "inventory.out", label: "재고 소진" },
];

// 유틸리티 함수들
export const getApiStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return { label: "활성", className: "bg-green-100 text-green-800" };
    case "inactive":
      return { label: "비활성", className: "bg-gray-100 text-gray-800" };
    case "expired":
      return { label: "만료", className: "bg-red-100 text-red-800" };
    default:
      return { label: "알 수 없음", className: "bg-gray-100 text-gray-800" };
  }
};

export const maskApiKey = (key: string) => {
  if (key.length <= 10) return key;
  return (
    key.substring(0, 20) + "***************" + key.substring(key.length - 6)
  );
};

export const generateApiKey = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "bogo_live_sk_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateWebhookSecret = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "wh_sec_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
