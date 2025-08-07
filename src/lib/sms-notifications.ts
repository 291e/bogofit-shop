import { createAligoClient } from "@/lib/aligo";

// SMS 알림 템플릿
export const SMS_TEMPLATES = {
  // 주문 완료
  ORDER_COMPLETED: (data: {
    customerName: string;
    orderId: string;
    amount: number;
    productName: string;
    orderDate: string;
    recipientName: string;
    address: string;
  }) =>
    `[BogoFit] ${data.customerName}님, 주문이 완료되었습니다!\n` +
    `주문번호: ${data.orderId}\n` +
    `상품명: ${data.productName}\n` +
    `주문일시: ${data.orderDate}\n` +
    `결제금액: ${data.amount.toLocaleString()}원\n` +
    `주문자: ${data.recipientName}\n` +
    `배송지: ${data.address}\n` +
    `감사합니다!`,

  // 결제 실패
  PAYMENT_FAILED: (data: { customerName: string; orderId: string }) =>
    `[BogoFit] ${data.customerName}님, 결제가 실패되었습니다.\n` +
    `주문번호: ${data.orderId}\n` +
    `다시 시도해주세요. 문의: 042-385-1008`,

  // 상품 발송
  SHIPPING_STARTED: (data: {
    customerName: string;
    orderId: string;
    productName?: string;
    trackingNumber?: string;
    courierCompany?: string;
  }) =>
    `[BogoFit] ${data.customerName}님, 주문하신 상품이 발송되었습니다!\n` +
    `주문번호: ${data.orderId}\n` +
    `${data.productName ? `상품명: ${data.productName}\n` : ""}` +
    `${data.trackingNumber ? `운송장번호: ${data.trackingNumber}\n` : ""}` +
    `${data.courierCompany ? `택배사: ${data.courierCompany}\n` : ""}` +
    `1-2일 내 도착 예정입니다.`,

  // 배송 완료
  DELIVERY_COMPLETED: (data: {
    customerName: string;
    orderId: string;
    productName?: string;
  }) =>
    `[BogoFit] ${data.customerName}님, 배송이 완료되었습니다!\n` +
    `주문번호: ${data.orderId}\n` +
    `${data.productName ? `상품명: ${data.productName}\n` : ""}` +
    `상품 리뷰 작성 시 적립금 500원을 드립니다.\n` +
    `리뷰 작성하기: ${process.env.NEXT_PUBLIC_BASE_URL}/myPage`,

  // 비즈니스 - 새 주문 알림
  BUSINESS_NEW_ORDER: (data: {
    orderId: string;
    productName: string;
    amount: number;
    customerName: string;
  }) =>
    `[BogoFit] 새 주문이 접수되었습니다.\n` +
    `주문번호: ${data.orderId}\n` +
    `상품: ${data.productName}\n` +
    `금액: ${data.amount.toLocaleString()}원\n` +
    `주문자: ${data.customerName}\n` +
    `확인해주세요.`,

  // 비즈니스 - 브랜드 입점 문의 알림
  BRAND_INQUIRY_NOTIFICATION: (data: {
    brandName: string;
    companyName: string;
    contactName: string;
    contactPhone: string;
    inquiryTime: string;
  }) =>
    `[BogoFit] 브랜드 입점 문의가 접수되었습니다.\n` +
    `브랜드: ${data.brandName}\n` +
    `회사: ${data.companyName}\n` +
    `담당자: ${data.contactName}\n` +
    `연락처: ${data.contactPhone}\n` +
    `접수시간: ${data.inquiryTime}\n` +
    `이메일을 확인해주세요.`,

  // 회원가입 환영
  WELCOME_USER: (data: { customerName: string }) =>
    `[BogoFit] ${data.customerName}님, 회원가입을 환영합니다!\n` +
    `첫 구매 10% 할인쿠폰이 지급되었습니다.\n` +
    `지금 바로 쇼핑해보세요!`,

  // 비밀번호 재설정
  PASSWORD_RESET: (data: { customerName: string; code: string }) =>
    `[BogoFit] ${data.customerName}님\n` +
    `비밀번호 재설정 코드: ${data.code}\n` +
    `(5분간 유효)`,

  // 주문 취소
  ORDER_CANCELED: (data: {
    customerName: string;
    orderId: string;
    productName: string;
    amount: number;
    cancelDate: string;
  }) =>
    `[BogoFit] ${data.customerName}님, 주문이 취소되었습니다.\n` +
    `주문번호: ${data.orderId}\n` +
    `상품명: ${data.productName}\n` +
    `취소금액: ${data.amount.toLocaleString()}원\n` +
    `취소일시: ${data.cancelDate}\n` +
    `환불은 영업일 기준 3-5일 내 처리됩니다.`,

  // 환불 신청
  REFUND_REQUESTED: (data: {
    customerName: string;
    orderId: string;
    productName: string;
    amount: number;
    refundDate: string;
    reason?: string;
  }) =>
    `[BogoFit] ${data.customerName}님, 환불 신청이 접수되었습니다.\n` +
    `주문번호: ${data.orderId}\n` +
    `상품명: ${data.productName}\n` +
    `환불금액: ${data.amount.toLocaleString()}원\n` +
    `신청일시: ${data.refundDate}\n` +
    `${data.reason ? `사유: ${data.reason}\n` : ""}` +
    `검토 후 영업일 기준 3-5일 내 처리됩니다.`,
} as const;

// SMS 발송 유틸리티 함수
export class SmsNotificationService {
  private static aligoClient = createAligoClient();

  /**
   * SMS 발송 (비동기 처리, 실패해도 메인 로직에 영향 없음)
   */
  static async sendSms(
    phoneNumber: string,
    message: string,
    options: {
      sender?: string;
      testMode?: boolean;
      title?: string;
    } = {}
  ): Promise<boolean> {
    try {
      // 전화번호 유효성 검사
      if (!phoneNumber || phoneNumber.length < 10) {
        console.warn(`[SMS] 유효하지 않은 전화번호: ${phoneNumber}`);
        return false;
      }

      const result = await this.aligoClient.sendSms({
        sender: options.sender || process.env.SMS_DEFAULT_SENDER || "025114560",
        receiver: phoneNumber,
        msg: message,
        title: options.title,
        testmodeYn: options.testMode ? "Y" : "N",
      });

      const isSuccess =
        (typeof result.result_code === "string"
          ? parseInt(result.result_code, 10)
          : result.result_code) === 1;

      if (isSuccess) {
        console.log(`[SMS] 발송 성공: ${phoneNumber} (ID: ${result.msg_id})`);
        return true;
      } else {
        console.error(`[SMS] 발송 실패: ${phoneNumber}`, result);
        return false;
      }
    } catch (error) {
      console.error(`[SMS] 발송 오류: ${phoneNumber}`, error);
      return false;
    }
  }

  /**
   * 주문 완료 SMS 발송
   */
  static async sendOrderCompletedSms(data: {
    customerPhone: string;
    customerName: string;
    orderId: string;
    amount: number;
    productName: string;
    orderDate: string;
    recipientName: string;
    address: string;
    testMode?: boolean;
  }): Promise<boolean> {
    const message = SMS_TEMPLATES.ORDER_COMPLETED({
      customerName: data.customerName,
      orderId: data.orderId,
      amount: data.amount,
      productName: data.productName,
      orderDate: data.orderDate,
      recipientName: data.recipientName,
      address: data.address,
    });

    return this.sendSms(data.customerPhone, message, {
      testMode: data.testMode,
      title: "주문 완료 안내",
    });
  }

  /**
   * 결제 실패 SMS 발송
   */
  static async sendPaymentFailedSms(data: {
    customerPhone: string;
    customerName: string;
    orderId: string;
    testMode?: boolean;
  }): Promise<boolean> {
    const message = SMS_TEMPLATES.PAYMENT_FAILED({
      customerName: data.customerName,
      orderId: data.orderId,
    });

    return this.sendSms(data.customerPhone, message, {
      testMode: data.testMode,
      title: "결제 실패 안내",
    });
  }

  /**
   * 비즈니스 새 주문 알림 SMS 발송
   */
  static async sendBusinessOrderNotification(data: {
    businessPhone: string;
    orderId: string;
    productName: string;
    amount: number;
    customerName: string;
    testMode?: boolean;
  }): Promise<boolean> {
    const message = SMS_TEMPLATES.BUSINESS_NEW_ORDER({
      orderId: data.orderId,
      productName: data.productName,
      amount: data.amount,
      customerName: data.customerName,
    });

    return this.sendSms(data.businessPhone, message, {
      testMode: data.testMode,
      title: "신규 주문 알림",
    });
  }

  /**
   * 배송 시작 SMS 발송
   */
  static async sendShippingStartedSms(data: {
    customerPhone: string;
    customerName: string;
    orderId: string;
    productName?: string;
    trackingNumber?: string;
    courierCompany?: string;
    testMode?: boolean;
  }): Promise<boolean> {
    const message = SMS_TEMPLATES.SHIPPING_STARTED({
      customerName: data.customerName,
      orderId: data.orderId,
      productName: data.productName,
      trackingNumber: data.trackingNumber,
      courierCompany: data.courierCompany,
    });

    return this.sendSms(data.customerPhone, message, {
      testMode: data.testMode,
      title: "상품 발송 안내",
    });
  }

  /**
   * 배송 완료 SMS 발송
   */
  static async sendDeliveryCompletedSms(data: {
    customerPhone: string;
    customerName: string;
    orderId: string;
    productName?: string;
    testMode?: boolean;
  }): Promise<boolean> {
    const message = SMS_TEMPLATES.DELIVERY_COMPLETED({
      customerName: data.customerName,
      orderId: data.orderId,
      productName: data.productName,
    });

    return this.sendSms(data.customerPhone, message, {
      testMode: data.testMode,
      title: "배송 완료 안내",
    });
  }

  /**
   * 브랜드 입점 문의 알림 SMS 발송
   */
  static async sendBrandInquiryNotification(data: {
    businessPhone: string;
    brandName: string;
    companyName: string;
    contactName: string;
    contactPhone: string;
    inquiryTime: string;
    testMode?: boolean;
  }): Promise<boolean> {
    const message = SMS_TEMPLATES.BRAND_INQUIRY_NOTIFICATION({
      brandName: data.brandName,
      companyName: data.companyName,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      inquiryTime: data.inquiryTime,
    });

    return this.sendSms(data.businessPhone, message, {
      testMode: data.testMode,
      title: "브랜드 입점 문의",
    });
  }

  /**
   * 회원가입 환영 SMS 발송
   */
  static async sendWelcomeSms(data: {
    customerPhone: string;
    customerName: string;
    testMode?: boolean;
  }): Promise<boolean> {
    const message = SMS_TEMPLATES.WELCOME_USER({
      customerName: data.customerName,
    });

    return this.sendSms(data.customerPhone, message, {
      testMode: data.testMode,
      title: "회원가입 환영",
    });
  }

  /**
   * 주문 취소 SMS 발송
   */
  static async sendOrderCanceledSms(data: {
    customerPhone: string;
    customerName: string;
    orderId: string;
    productName: string;
    amount: number;
    cancelDate: string;
    testMode?: boolean;
  }): Promise<boolean> {
    const message = SMS_TEMPLATES.ORDER_CANCELED({
      customerName: data.customerName,
      orderId: data.orderId,
      productName: data.productName,
      amount: data.amount,
      cancelDate: data.cancelDate,
    });

    return this.sendSms(data.customerPhone, message, {
      testMode: data.testMode,
      title: "주문 취소",
    });
  }

  /**
   * 환불 신청 SMS 발송
   */
  static async sendRefundRequestedSms(data: {
    customerPhone: string;
    customerName: string;
    orderId: string;
    productName: string;
    amount: number;
    refundDate: string;
    reason?: string;
    testMode?: boolean;
  }): Promise<boolean> {
    const message = SMS_TEMPLATES.REFUND_REQUESTED({
      customerName: data.customerName,
      orderId: data.orderId,
      productName: data.productName,
      amount: data.amount,
      refundDate: data.refundDate,
      reason: data.reason,
    });

    return this.sendSms(data.customerPhone, message, {
      testMode: data.testMode,
      title: "환불 신청",
    });
  }
}

// 환경변수에서 테스트 모드 확인
export const isTestMode =
  process.env.NODE_ENV === "development" ||
  process.env.SMS_TEST_MODE === "true";
