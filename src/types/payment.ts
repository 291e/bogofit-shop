// Payment Types

export interface CreatePaymentRequestDto {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  orderDescription?: string;
  successUrl?: string;
  failUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ConfirmPaymentRequestDto {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentResponseDto {
  success: boolean;
  message: string;
  paymentKey?: string;
  orderId?: string;
  amount?: number;
  status?: string;
  timestamp?: string;
  data?: unknown;
}

export interface TossPaymentData {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  method?: string;
  totalAmount: number;
  discountAmount?: number;
  cancelledAmount?: number;
  requestedAt: string;
  approvedAt?: string;
  useEscrow: boolean;
  useCashReceipt: boolean;
  receiptUrl?: string;
  card?: {
    amount?: number;
    issuerCode?: string;
    acquirerCode?: string;
    number?: string;
    installmentPlanMonths?: number;
    approveNo?: string;
    cardType?: string;
    ownerType?: string;
  };
  virtualAccount?: {
    accountNumber: string;
    bankCode: string;
    customerName: string;
    dueDate: string;
    refundStatus?: string;
  };
  transfer?: {
    bankCode?: string;
    settlementStatus?: string;
  };
}

/**
 * Validate if payment key is valid format
 * - tsi_* : Test payment key
 * - tgen_* : Live payment key
 * - test_* : Old test format
 */
export const isValidPaymentKey = (key: string): boolean => {
  return /^(tgen_|tsi_|test_)/.test(key);
};

/**
 * Check if payment key is a session ID
 * Session IDs (si_* WITHOUT 't' prefix) mean payment was NOT completed
 * Payment keys (tsi_* WITH 't' prefix) are valid completed payments
 */
export const isSessionId = (key: string): boolean => {
  return key.startsWith('si_') && !key.startsWith('tsi_');
};

