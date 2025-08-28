// 정산 관련 데이터 타입
export interface SettlementRecord {
  id: string;
  period: string; // YYYY-MM
  startDate: string;
  endDate: string;
  totalSales: number;
  commission: number;
  commissionRate: number;
  adjustments: number;
  finalAmount: number;
  status: "pending" | "processing" | "completed" | "failed";
  requestDate: string;
  processedDate?: string;
  bankAccount: string;
  notes?: string;
}

export interface SettlementSummary {
  currentPeriod: string;
  totalSales: number;
  totalCommission: number;
  totalAdjustments: number;
  pendingAmount: number;
  completedAmount: number;
  expectedSettlement: number;
  nextSettlementDate: string;
}

export interface CommissionBreakdown {
  category: string;
  sales: number;
  commissionRate: number;
  commission: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isDefault: boolean;
  status: "active" | "inactive";
}

// 정산 모의 데이터
export const mockSettlementRecords: SettlementRecord[] = [
  {
    id: "SET-2024-01",
    period: "2024-01",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    totalSales: 45680000,
    commission: 2284000,
    commissionRate: 5.0,
    adjustments: -50000,
    finalAmount: 43346000,
    status: "completed",
    requestDate: "2024-02-01",
    processedDate: "2024-02-05",
    bankAccount: "국민은행 ***-**-****-789",
    notes: "1월 정산 완료",
  },
  {
    id: "SET-2024-02",
    period: "2024-02",
    startDate: "2024-02-01",
    endDate: "2024-02-29",
    totalSales: 52340000,
    commission: 2617000,
    commissionRate: 5.0,
    adjustments: 0,
    finalAmount: 49723000,
    status: "completed",
    requestDate: "2024-03-01",
    processedDate: "2024-03-05",
    bankAccount: "국민은행 ***-**-****-789",
  },
  {
    id: "SET-2024-03",
    period: "2024-03",
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    totalSales: 48920000,
    commission: 2446000,
    commissionRate: 5.0,
    adjustments: -25000,
    finalAmount: 46449000,
    status: "completed",
    requestDate: "2024-04-01",
    processedDate: "2024-04-05",
    bankAccount: "국민은행 ***-**-****-789",
  },
  {
    id: "SET-2024-04",
    period: "2024-04",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    totalSales: 56780000,
    commission: 2839000,
    commissionRate: 5.0,
    adjustments: 0,
    finalAmount: 53941000,
    status: "processing",
    requestDate: "2024-05-01",
    bankAccount: "국민은행 ***-**-****-789",
  },
  {
    id: "SET-2024-05",
    period: "2024-05",
    startDate: "2024-05-01",
    endDate: "2024-05-31",
    totalSales: 61250000,
    commission: 3062500,
    commissionRate: 5.0,
    adjustments: 0,
    finalAmount: 58187500,
    status: "pending",
    requestDate: "2024-06-01",
    bankAccount: "국민은행 ***-**-****-789",
  },
];

export const mockSettlementSummary: SettlementSummary = {
  currentPeriod: "2024-05",
  totalSales: 61250000,
  totalCommission: 3062500,
  totalAdjustments: 0,
  pendingAmount: 58187500,
  completedAmount: 193459000,
  expectedSettlement: 58187500,
  nextSettlementDate: "2024-06-05",
};

export const mockCommissionBreakdown: CommissionBreakdown[] = [
  {
    category: "의류",
    sales: 28700000,
    commissionRate: 5.0,
    commission: 1435000,
  },
  {
    category: "신발",
    sales: 15900000,
    commissionRate: 5.5,
    commission: 874500,
  },
  {
    category: "전자제품",
    sales: 29900000,
    commissionRate: 3.0,
    commission: 897000,
  },
  {
    category: "액세서리",
    sales: 8900000,
    commissionRate: 6.0,
    commission: 534000,
  },
];

export const mockBankAccounts: BankAccount[] = [
  {
    id: "BANK-001",
    bankName: "국민은행",
    accountNumber: "123-45-6789-789",
    accountHolder: "보고핏 주식회사",
    isDefault: true,
    status: "active",
  },
  {
    id: "BANK-002",
    bankName: "신한은행",
    accountNumber: "987-65-4321-123",
    accountHolder: "보고핏 주식회사",
    isDefault: false,
    status: "active",
  },
];

// 정산 상태 옵션
export const settlementStatusOptions = [
  { value: "all", label: "전체" },
  { value: "pending", label: "정산 대기" },
  { value: "processing", label: "정산 처리중" },
  { value: "completed", label: "정산 완료" },
  { value: "failed", label: "정산 실패" },
];

// 유틸리티 함수들
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "정산 대기", className: "bg-yellow-100 text-yellow-800" };
    case "processing":
      return { label: "정산 처리중", className: "bg-blue-100 text-blue-800" };
    case "completed":
      return { label: "정산 완료", className: "bg-green-100 text-green-800" };
    case "failed":
      return { label: "정산 실패", className: "bg-red-100 text-red-800" };
    default:
      return { label: "알 수 없음", className: "bg-gray-100 text-gray-800" };
  }
};

export const formatCurrency = (amount: number) => {
  return `₩${amount.toLocaleString()}`;
};

export const formatPercent = (percent: number) => {
  return `${percent.toFixed(1)}%`;
};

export const calculateCommission = (sales: number, rate: number) => {
  return Math.round(sales * (rate / 100));
};
