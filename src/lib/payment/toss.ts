// Toss Payments SDK Integration

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (method: string, params: unknown) => Promise<unknown>;
    };
  }
}

/**
 * Load Toss Payments SDK via CDN
 */
export const loadTossSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.TossPayments) {
      console.log('✅ [TOSS-SDK] SDK already loaded');
      resolve();
      return;
    }

    console.log('🔄 [TOSS-SDK] Loading Toss Payments SDK from CDN...');

    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ [TOSS-SDK] SDK loaded successfully from CDN');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('❌ [TOSS-SDK] Failed to load SDK:', error);
      reject(new Error('Failed to load Toss Payments SDK'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Get Toss Payments client key from backend
 */
export const getClientKey = async (): Promise<string> => {
  console.log('🔑 Fetching client key from backend...');
  
  const response = await fetch('/api/payment/client-key');
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Client key retrieved:', data.data.clientKey.substring(0, 15) + '...');
    return data.data.clientKey;
  }
  
  throw new Error('Failed to get client key');
};

/**
 * Request payment via Toss Payments Widget
 */
export const requestTossPayment = async (paymentData: {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  method?: string;
}) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💳 [TOSS-PAYMENT] Initializing Toss Payments...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 [TOSS-PAYMENT] Payment data:', JSON.stringify(paymentData, null, 2));

    // Validate amount is integer
    if (!Number.isInteger(paymentData.amount)) {
      console.error('❌ [TOSS-PAYMENT] Amount is not integer:', paymentData.amount);
      throw new Error('Amount must be an integer (no decimals for KRW)');
    }

    if (paymentData.amount <= 0) {
      console.error('❌ [TOSS-PAYMENT] Amount is not positive:', paymentData.amount);
      throw new Error('Amount must be positive');
    }

    console.log('✅ [TOSS-PAYMENT] Amount validation passed:', paymentData.amount);

    // 1. Load SDK
    console.log('🔄 [TOSS-PAYMENT] Step 1: Loading Toss SDK...');
    await loadTossSDK();
    console.log('✅ [TOSS-PAYMENT] Step 1: SDK loaded');

    // 2. Get client key
    console.log('🔄 [TOSS-PAYMENT] Step 2: Fetching client key...');
    const clientKey = await getClientKey();
    console.log('✅ [TOSS-PAYMENT] Step 2: Client key obtained:', clientKey.substring(0, 20) + '...');

    // 3. Initialize Toss Payments
    console.log('🔄 [TOSS-PAYMENT] Step 3: Creating TossPayments instance...');
    if (!window.TossPayments) {
      throw new Error('TossPayments SDK not loaded');
    }
    const tossPayments = window.TossPayments(clientKey);
    console.log('✅ [TOSS-PAYMENT] Step 3: TossPayments instance created');

    // 4. Prepare request params
    let method = paymentData.method || '카드';
    if (paymentData.method === '간편결제') {
      method = '토스페이';
    }
    console.log(`🔄 [TOSS-PAYMENT] Step 4: Preparing payment request with method: ${method}`);

    const requestParams: Record<string, unknown> = {
      amount: paymentData.amount,
      orderId: paymentData.orderId,
      orderName: paymentData.orderName,
      customerName: paymentData.customerName,
      customerEmail: paymentData.customerEmail,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`
    };

    // Add optional phone
    if (paymentData.customerPhone) {
      requestParams.customerMobilePhone = paymentData.customerPhone;
    }

    // Virtual account specific
    if (method === '가상계좌') {
      requestParams.validHours = 24;
      console.log('🏦 [TOSS-PAYMENT] Virtual Account - Valid for 24 hours');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 [TOSS-PAYMENT] Final request params:');
    console.log(JSON.stringify(requestParams, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 5. Request payment
    console.log('🔄 [TOSS-PAYMENT] Step 5: Calling tossPayments.requestPayment()...');
    console.log('⚠️ [TOSS-PAYMENT] Opening payment popup - if blocked, enable popups in browser');
    console.log('⚠️ [TOSS-PAYMENT] DO NOT CLOSE THE WIDGET - Wait for Toss to redirect!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏳ [TOSS-PAYMENT] Waiting for user to complete payment in widget...');
    console.log('⏳ [TOSS-PAYMENT] This may take a while - DO NOT close the widget!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      console.log('🚀 [TOSS-PAYMENT] Executing: tossPayments.requestPayment("' + method + '", params)');
      console.log('⚠️ [TOSS-PAYMENT] IMPORTANT: Do NOT close widget until you see success page!');
      console.log('⚠️ [TOSS-PAYMENT] Widget should stay open until Toss processes payment!');
      
      // ⚠️ CRITICAL: This promise will only resolve AFTER Toss redirects
      // For successful payments, Toss will redirect BEFORE this promise resolves
      // If this returns, it means user closed widget or cancelled
      await tossPayments.requestPayment(method, requestParams);
      
      // ⚠️ If we reach this line, user cancelled or something went wrong
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️ [TOSS-PAYMENT] requestPayment() returned WITHOUT redirect!');
      console.log('⚠️ [TOSS-PAYMENT] This means:');
      console.log('   1. User closed widget before completing payment, OR');
      console.log('   2. User cancelled in the widget, OR');
      console.log('   3. Payment method requires manual redirect');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Wait a moment to see if redirect happens
      console.log('⏳ [TOSS-PAYMENT] Waiting 2 seconds for potential redirect...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('❌ [TOSS-PAYMENT] No redirect occurred - payment likely cancelled');
      throw new Error('USER_CANCEL: Widget closed without completing payment');
      
    } catch (widgetError: unknown) {
      const error = widgetError as { code?: string; message?: string };
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [TOSS-PAYMENT] Widget error or cancellation');
      console.error('❌ [TOSS-PAYMENT] Error code:', error.code);
      console.error('❌ [TOSS-PAYMENT] Error message:', error.message);
      console.error('❌ [TOSS-PAYMENT] Full error:', widgetError);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Check if popup was blocked
      if (error.code === 'POPUP_CLOSED' || 
          error.message?.includes('popup') || 
          error.message?.includes('blocked')) {
        throw new Error('popup: 팝업이 차단되었습니다. 브라우저 설정에서 팝업 차단을 해제해주세요.');
      }
      
      // User cancelled
      if (error.code === 'USER_CANCEL' || error.message?.includes('USER_CANCEL')) {
        console.log('⚠️ [TOSS-PAYMENT] User cancelled payment in widget');
        throw new Error('USER_CANCEL: 사용자가 결제를 취소했습니다.');
      }
      
      // Any other error
      throw widgetError;
    }
    
 

  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; stack?: string };
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ [TOSS-PAYMENT] Payment initialization failed:', error);
    console.error('❌ [TOSS-PAYMENT] Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // User-friendly error messages
    let userMessage = err.message || '결제 요청 실패';
    
    if (err.message?.includes('INVALID_CLIENT_KEY')) {
      userMessage = '결제 시스템 설정 오류입니다. 관리자에게 문의해주세요.';
    } else if (err.message?.includes('INVALID_ORDER_ID')) {
      userMessage = '주문번호가 올바르지 않습니다.';
    } else if (err.message?.includes('INVALID_AMOUNT')) {
      userMessage = '결제 금액이 올바르지 않습니다.';
    } else if (err.code === 'USER_CANCEL' || err.message?.includes('USER_CANCEL')) {
      userMessage = '결제가 취소되었습니다.';
    }
    
    throw new Error(userMessage);
  }
};

/**
 * Confirm payment with backend
 */
export const confirmPayment = async (
  paymentKey: string,
  orderId: string,
  amount: number,
  token: string
) => {
  console.log('🔄 Confirming payment...');

  const response = await fetch('/api/payment/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ paymentKey, orderId, amount })
  });

  const data = await response.json();

  if (!data.success) {
    console.error('❌ Payment confirmation failed:', data.message);
    throw new Error(data.message);
  }

  console.log('✅ Payment confirmed successfully');
  return data.data;
};

// Keep alias for backward compatibility
export const confirmTossPayment = confirmPayment;

/**
 * Get payment status from backend
 */
export const getTossPaymentStatus = async (
  paymentKey: string,
  token: string
) => {
  console.log('🔍 Fetching payment status...');

  const response = await fetch(`/api/payment/status/${paymentKey}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!data.success) {
    console.error('❌ Failed to get payment status:', data.message);
    throw new Error(data.message);
  }

  console.log('✅ Payment status retrieved');
  return data.data;
};

/**
 * Cancel/refund payment
 */
export const cancelTossPayment = async (
  paymentKey: string,
  cancelReason: string,
  token: string,
  cancelAmount?: number
) => {
  console.log('🔄 Cancelling payment...');

  const response = await fetch('/api/payment/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      paymentKey, 
      cancelReason,
      ...(cancelAmount && { cancelAmount })
    })
  });

  const data = await response.json();

  if (!data.success) {
    console.error('❌ Payment cancellation failed:', data.message);
    throw new Error(data.message);
  }

  console.log('✅ Payment cancelled successfully');
  return data.data;
};

