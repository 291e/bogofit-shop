import { NextRequest, NextResponse } from "next/server";

// Read from environment variables (supports both test and live keys)
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "test_sk_4yKeq5bgrpWvWbKAp27AVGX0lzW6";
const TOSS_API_URL = process.env.TOSS_API_URL || "https://api.tosspayments.com/v1";

// Log which key type is being used (without exposing the key)
const keyType = TOSS_SECRET_KEY.startsWith("live_") ? "🔴 LIVE" : "🟢 TEST";
console.log(`[PAYMENT-CONFIRM] Using ${keyType} API key`);

/**
 * POST /api/payment/confirm
 * Confirm payment directly with Toss Payments API
 */
export async function POST(request: NextRequest) {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💰 [PAYMENT-CONFIRM] Confirming payment with Toss...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    console.log("📋 [PAYMENT-CONFIRM] Request data:", {
      paymentKey,
      orderId,
      amount,
    });

    // Validate required fields
    if (!paymentKey || !orderId || !amount) {
      console.error("❌ [PAYMENT-CONFIRM] Missing required fields");
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if this is a session ID - REJECT IMMEDIATELY
    // Session ID: si_xxxxxxxxx (without 't' prefix)
    // Payment Key: tsi_xxxxxxxxx (test) or tgen_xxxxxxxxx (live)
    const isSessionId = paymentKey.startsWith("si_") && !paymentKey.startsWith("tsi_");
    
    if (isSessionId) {
      console.error("❌ [PAYMENT-CONFIRM] Session ID detected - payment NOT completed!", paymentKey);
      console.error("❌ [PAYMENT-CONFIRM] User closed widget before completing payment");
      return NextResponse.json(
        {
          success: false,
          message: "결제가 완료되지 않았습니다. 결제 창에서 '결제하기' 버튼을 눌러주세요.",
        },
        { status: 400 }
      );
    }
    
    // Validate real payment key format (tsi_ for test, tgen_ for live, test_ for old format)
    if (!/^(tgen_|tsi_|test_)/.test(paymentKey)) {
      console.error("❌ [PAYMENT-CONFIRM] Invalid payment key format:", paymentKey);
      return NextResponse.json(
        {
          success: false,
          message: "유효하지 않은 결제 키 형식입니다",
        },
        { status: 400 }
      );
    }

    // Confirm with Toss Payments API directly
    console.log(`🔄 [PAYMENT-CONFIRM] Calling Toss API: ${TOSS_API_URL}/payments/confirm`);
    
    const encryptedSecretKey = "Basic " + Buffer.from(TOSS_SECRET_KEY + ":").toString("base64");
    
    const response = await fetch(`${TOSS_API_URL}/payments/confirm`, {
      method: "POST",
      headers: {
        "Authorization": encryptedSecretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const data = await response.json();
    
    console.log("📥 [PAYMENT-CONFIRM] Toss API response:", {
      httpStatus: response.status,
      paymentMethod: data.method,
      paymentStatus: data.status,
    });

    if (!response.ok) {
      console.error("❌ [PAYMENT-CONFIRM] Toss API error:", data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || "결제 확인 실패",
          code: data.code,
        },
        { status: response.status }
      );
    }

    console.log("✅ [PAYMENT-CONFIRM] Payment confirmed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Return success with payment data
    return NextResponse.json({
      success: true,
      message: "Payment confirmed",
      data: data,
    });

  } catch (error) {
    console.error("❌ [PAYMENT-CONFIRM] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

