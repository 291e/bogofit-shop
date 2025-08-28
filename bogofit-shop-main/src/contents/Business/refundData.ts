export interface RefundRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  originalPrice: number;
  refundAmount: number;
  type: "return" | "exchange" | "refund";
  reason:
    | "defective"
    | "size_issue"
    | "color_issue"
    | "not_as_described"
    | "change_of_mind"
    | "damaged_shipping"
    | "other";
  reasonDetail: string;
  status:
    | "pending"
    | "reviewing"
    | "approved"
    | "rejected"
    | "processing"
    | "completed";
  requestDate: string;
  processedDate?: string;
  refundMethod?: "card" | "bank_transfer" | "point";
  bankAccount?: string;
  attachedImages?: string[];
  adminNotes?: string;
}

export interface RefundStats {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  processing: number;
  completed: number;
  totalAmount: number;
}

export const mockRefundRequests: RefundRequest[] = [
  {
    id: "REF-001",
    orderNumber: "ORD-2024-001",
    customerName: "김민수",
    customerPhone: "010-1234-5678",
    productName: "프리미엄 셔츠",
    quantity: 1,
    originalPrice: 79000,
    refundAmount: 79000,
    type: "return",
    reason: "size_issue",
    reasonDetail: "생각보다 사이즈가 작아서 반품 요청드립니다.",
    status: "approved",
    requestDate: "2024-01-25",
    processedDate: "2024-01-26",
    refundMethod: "card",
    adminNotes: "사이즈 교환 가능 안내함",
  },
  {
    id: "REF-002",
    orderNumber: "ORD-2024-002",
    customerName: "이영희",
    customerPhone: "010-9876-5432",
    productName: "니트 가디건",
    quantity: 1,
    originalPrice: 89000,
    refundAmount: 89000,
    type: "refund",
    reason: "defective",
    reasonDetail: "상품에 구멍이 있어 환불 요청합니다.",
    status: "reviewing",
    requestDate: "2024-01-26",
    refundMethod: "card",
    attachedImages: ["defect1.jpg", "defect2.jpg"],
  },
  {
    id: "REF-003",
    orderNumber: "ORD-2024-003",
    customerName: "박철수",
    customerPhone: "010-5555-1234",
    productName: "가죽 지갑",
    quantity: 1,
    originalPrice: 89000,
    refundAmount: 89000,
    type: "exchange",
    reason: "color_issue",
    reasonDetail: "색상이 사진과 달라 교환 요청합니다.",
    status: "pending",
    requestDate: "2024-01-27",
  },
  {
    id: "REF-004",
    orderNumber: "ORD-2024-004",
    customerName: "정수연",
    customerPhone: "010-1111-2222",
    productName: "스마트워치",
    quantity: 1,
    originalPrice: 299000,
    refundAmount: 299000,
    type: "refund",
    reason: "not_as_described",
    reasonDetail: "기능이 설명과 다름",
    status: "rejected",
    requestDate: "2024-01-28",
    processedDate: "2024-01-29",
    adminNotes: "정상 기능 확인됨. 사용법 안내 제공",
  },
  {
    id: "REF-005",
    orderNumber: "ORD-2024-005",
    customerName: "홍길동",
    customerPhone: "010-3333-4444",
    productName: "프리미엄 셔츠",
    quantity: 2,
    originalPrice: 158000,
    refundAmount: 158000,
    type: "return",
    reason: "change_of_mind",
    reasonDetail: "단순 변심",
    status: "completed",
    requestDate: "2024-01-24",
    processedDate: "2024-01-25",
    refundMethod: "bank_transfer",
    bankAccount: "국민은행 123-456-789012",
  },
];

export const refundTypeOptions = [
  { value: "all", label: "전체" },
  { value: "return", label: "반품" },
  { value: "exchange", label: "교환" },
  { value: "refund", label: "환불" },
];

export const refundStatusOptions = [
  { value: "all", label: "전체" },
  { value: "pending", label: "접수대기" },
  { value: "reviewing", label: "검토중" },
  { value: "approved", label: "승인" },
  { value: "rejected", label: "거부" },
  { value: "processing", label: "처리중" },
  { value: "completed", label: "완료" },
];

export const refundReasonOptions = [
  { value: "defective", label: "상품 불량" },
  { value: "size_issue", label: "사이즈 문제" },
  { value: "color_issue", label: "색상 문제" },
  { value: "not_as_described", label: "설명과 다름" },
  { value: "change_of_mind", label: "단순 변심" },
  { value: "damaged_shipping", label: "배송 중 파손" },
  { value: "other", label: "기타" },
];

export const refundMethodOptions = [
  { value: "card", label: "신용카드" },
  { value: "bank_transfer", label: "계좌이체" },
  { value: "point", label: "적립금" },
];

export const getRefundStats = (requests: RefundRequest[]): RefundStats => {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    reviewing: requests.filter((r) => r.status === "reviewing").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    processing: requests.filter((r) => r.status === "processing").length,
    completed: requests.filter((r) => r.status === "completed").length,
    totalAmount: requests
      .filter((r) => r.status === "completed" || r.status === "approved")
      .reduce((sum, r) => sum + r.refundAmount, 0),
  };
};
