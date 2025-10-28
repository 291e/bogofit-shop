import { NextRequest, NextResponse } from "next/server";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "test_sk_4yKeq5bgrpWvWbKAp27AVGX0lzW6";
const TOSS_API_URL = process.env.TOSS_API_URL || "https://api.tosspayments.com/v1";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * POST /api/payment/cancel
 * Cancel payment with Toss API and update database
 */
export async function POST(request: NextRequest) {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("❌ [PAYMENT-CANCEL] Canceling payment with Toss...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const body = await request.json();
    const { paymentKey, cancelReason, cancelAmount } = body;

    console.log("📋 [PAYMENT-CANCEL] Request data:", {
      paymentKey,
      cancelReason,
      cancelAmount,
    });

    // Validate required fields
    if (!paymentKey || !cancelReason) {
      console.error("❌ [PAYMENT-CANCEL] Missing required fields");
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ============================================
    // STEP 1: Cancel with Toss Payments API
    // ============================================
    console.log(`🔄 [PAYMENT-CANCEL] Calling Toss API: ${TOSS_API_URL}/payments/${paymentKey}/cancel`);

    const encryptedSecretKey = "Basic " + Buffer.from(TOSS_SECRET_KEY + ":").toString("base64");

    const tossResponse = await fetch(`${TOSS_API_URL}/payments/${paymentKey}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": encryptedSecretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cancelReason,
        ...(cancelAmount && { cancelAmount }),
      }),
    });

    const tossData = await tossResponse.json();

    console.log("📥 [PAYMENT-CANCEL] Toss API response:", {
      httpStatus: tossResponse.status,
      paymentStatus: tossData.status,
      cancelStatus: tossData.cancels?.[0]?.cancelStatus,
      cancelAmount: tossData.cancels?.[0]?.cancelAmount,
    });

    if (!tossResponse.ok) {
      console.error("❌ [PAYMENT-CANCEL] Toss API error:", tossData);
      return NextResponse.json(
        {
          success: false,
          message: tossData.message || "Payment cancellation failed",
          code: tossData.code,
        },
        { status: tossResponse.status }
      );
    }

    console.log("✅ [PAYMENT-CANCEL] Payment canceled with Toss!");
    console.log("🔄 [PAYMENT-CANCEL] Now updating C# backend database...");

    // ============================================
    // STEP 2: Update C# Backend Database
    // ============================================
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/api/Payment/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentKey: paymentKey,
          cancelReason: cancelReason,
          cancelAmount: cancelAmount,
          tossData: tossData
        })
      });

      // Check if C# Backend response is JSON
      const backendContentType = backendResponse.headers.get("content-type");
      if (!backendContentType || !backendContentType.includes("application/json")) {
        console.error("❌ [PAYMENT-CANCEL] C# Backend returned non-JSON response", {
          status: backendResponse.status,
          contentType: backendContentType,
          url: `${BACKEND_URL}/api/Payment/cancel`
        });

        // If 404, endpoint doesn't exist - continue with cancellation success
        if (backendResponse.status === 404) {
          console.log("⚠️ [PAYMENT-CANCEL] C# Backend endpoint not found (404) - continuing with cancellation success");
          return NextResponse.json({
            success: true,
            message: 'Payment canceled (database update not available)',
            data: {
              toss: tossData,
              backend: null
            }
          });
        }

        return NextResponse.json({
          success: false,
          message: 'C# Backend returned non-JSON response',
          tossData: tossData // Payment canceled but DB failed
        }, { status: 500 });
      }

      if (!backendResponse.ok) {
        // If 404, endpoint doesn't exist - continue with cancellation success
        if (backendResponse.status === 404) {
          console.log("⚠️ [PAYMENT-CANCEL] C# Backend endpoint not found (404) - continuing with cancellation success");
          return NextResponse.json({
            success: true,
            message: 'Payment canceled (database update not available)',
            data: {
              toss: tossData,
              backend: null
            }
          });
        }

        const error = await backendResponse.json();
        console.error("❌ [PAYMENT-CANCEL] C# Backend error:", error);
        return NextResponse.json({
          success: false,
          message: 'Database update failed',
          tossData: tossData // Payment canceled but DB failed
        }, { status: 500 });
      }

      const backendData = await backendResponse.json();
      console.log("✅ [PAYMENT-CANCEL] Database updated successfully!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // ============================================
      // SUCCESS! Both Toss and Database updated
      // ============================================
      return NextResponse.json({
        success: true,
        message: 'Payment canceled and database updated',
        data: {
          toss: tossData,
          backend: backendData.data
        }
      });

    } catch (backendError) {
      console.error("❌ [PAYMENT-CANCEL] C# Backend connection failed:", backendError);
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        tossData: tossData // Payment canceled but DB connection failed
      }, { status: 500 });
    }

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