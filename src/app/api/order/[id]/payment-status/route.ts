import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * PUT /api/order/[id]/payment-status
 * Update order payment status after successful payment confirmation
 * This links the payment data with the order in the database
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💾 [ORDER-UPDATE] Updating order payment status...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const { id: orderId } = await params;
    const token = request.headers.get("authorization");

    if (!token) {
      console.error("❌ [ORDER-UPDATE] No authorization token");
      return NextResponse.json(
        { success: false, message: "Authorization required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentKey, paymentStatus, paymentMethod, paymentAmount, paymentDate, tossPaymentData } = body;

    console.log("📋 [ORDER-UPDATE] Order ID:", orderId);
    console.log("📋 [ORDER-UPDATE] Payment data:", {
      paymentKey: paymentKey?.substring(0, 20) + "...",
      paymentStatus,
      paymentMethod,
      paymentAmount,
      paymentDate,
    });

    // Forward to C# Backend - Using Payment/confirm endpoint as per documentation
    console.log(`🔄 [ORDER-UPDATE] Calling backend: ${API_URL}/api/Payment/confirm`);

    const response = await fetch(`${API_URL}/api/Payment/confirm`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderNo: orderId, // C# Backend expects orderNo
        paymentKey,
        paymentMethod,
        tossData: tossPaymentData, // C# Backend expects tossData
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ [ORDER-UPDATE] Backend returned non-JSON response", {
        status: response.status,
        contentType,
        url: `${API_URL}/api/Payment/confirm`
      });
      return NextResponse.json(
        {
          success: false,
          message: `Backend returned non-JSON response (${response.status})`,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ [ORDER-UPDATE] Backend error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log("✅ [ORDER-UPDATE] Order payment status updated successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json(data);

  } catch (error) {
    console.error("❌ [ORDER-UPDATE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
