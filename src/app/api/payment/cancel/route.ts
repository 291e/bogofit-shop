import { NextRequest, NextResponse } from "next/server";

// Read from environment variables (supports both test and live keys)
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "test_sk_4yKeq5bgrpWvWbKAp27AVGX0lzW6";
const TOSS_API_URL = process.env.TOSS_API_URL || "https://api.tosspayments.com/v1";

// Log which key type is being used (without exposing the key)
const keyType = TOSS_SECRET_KEY.startsWith("live_") ? "🔴 LIVE" : "🟢 TEST";
console.log(`[PAYMENT-CANCEL] Using ${keyType} API key`);

/**
 * POST /api/payment/cancel
 * Cancel/refund payment directly with Toss Payments API
 */
export async function POST(request: NextRequest) {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔄 [PAYMENT-CANCEL] Starting payment cancellation...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const token = request.headers.get("authorization");
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authorization required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentKey, cancelReason, cancelAmount } = body;

    console.log("📋 [PAYMENT-CANCEL] Request data:", {
      paymentKey: paymentKey?.substring(0, 20) + "...",
      cancelReason,
      cancelAmount,
    });

    if (!paymentKey) {
      return NextResponse.json(
        { success: false, message: "paymentKey is required" },
        { status: 400 }
      );
    }

    // Call Toss API to cancel payment
    console.log("🔄 [PAYMENT-CANCEL] Calling Toss API to cancel...");
    
    const encryptedSecretKey = "Basic " + Buffer.from(TOSS_SECRET_KEY + ":").toString("base64");
    
    const tossResponse = await fetch(
      `${TOSS_API_URL}/payments/${paymentKey}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancelReason: cancelReason || "고객 요청",
          ...(cancelAmount && { cancelAmount }), // 부분 취소인 경우
        }),
      }
    );

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error("❌ [PAYMENT-CANCEL] Toss API error:", tossData);
      return NextResponse.json(
        {
          success: false,
          message: tossData.message || "결제 취소 실패",
          code: tossData.code,
        },
        { status: tossResponse.status }
      );
    }

    console.log("✅ [PAYMENT-CANCEL] Toss API cancelled successfully");
    console.log("📋 [PAYMENT-CANCEL] Toss response:", {
      status: tossData.status,
      cancels: tossData.cancels?.length || 0,
    });

    console.log("✅ [PAYMENT-CANCEL] Payment cancellation completed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({
      success: true,
      message: "결제가 취소되었습니다",
      data: tossData,
    });

  } catch (error) {
    console.error("❌ [PAYMENT-CANCEL] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

