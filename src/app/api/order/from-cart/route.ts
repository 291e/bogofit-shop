import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * POST /api/order/from-cart
 * Create order(s) from cart
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔵 [API/ORDER] Received order creation request");
    
    const token = request.headers.get("authorization");
    
    if (!token) {
      console.error("❌ [API/ORDER] No authorization token provided");
      return NextResponse.json(
        { success: false, message: "Authorization required" },
        { status: 401 }
      );
    }
    console.log("✅ [API/ORDER] Authorization token present");

    const body = await request.json();
    console.log("📦 [API/ORDER] Request body:", {
      hasShippingAddress: !!body.shippingAddress,
      recipientName: body.shippingAddress?.recipientName,
      discountTotal: body.discountTotal,
      shippingTotal: body.shippingTotal
    });

    console.log("🔄 [API/ORDER] Forwarding to backend:", `${API_URL}/api/Order/from-cart`);
    const response = await fetch(`${API_URL}/api/Order/from-cart`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("📡 [API/ORDER] Backend response status:", response.status);
    const data = await response.json();
    
    if (data.success) {
      console.log("✅ [API/ORDER] Order created successfully");
      console.log("📝 [API/ORDER] Response data:", {
        orderId: data.data?.id,
        orderNo: data.data?.orderNo,
        groupId: data.data?.groupId,
        status: data.data?.status
      });
    } else {
      console.error("❌ [API/ORDER] Order creation failed:", data.message);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ [API/ORDER] Order creation error:", error);
    console.error("❌ [API/ORDER] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

