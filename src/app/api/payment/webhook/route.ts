import { NextRequest, NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * POST /api/payment/webhook
 * Handle Toss Payments webhook notifications
 * 
 * Events:
 * - payment.approved: Payment completed successfully
 * - payment.canceled: Payment canceled/refunded
 * - payment.failed: Payment failed
 * - DEPOSIT_CALLBACK: Virtual account deposit completed
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📨 Webhook received from Toss Payments");

    // Get webhook body and signature
    const body = await request.text();
    const signature = request.headers.get("toss-signature");

    console.log("Webhook signature:", signature ? "Present" : "Missing");

    // Parse webhook body to check event type
    let webhookData;
    try {
      webhookData = JSON.parse(body);
      console.log("📋 Webhook event type:", webhookData.eventType || "Unknown");

      // Handle DEPOSIT_CALLBACK for virtual accounts
      if (webhookData.eventType === "DEPOSIT_CALLBACK") {
        console.log("🏦 Virtual Account deposit detected!");
        console.log("💰 Deposit details:", {
          paymentKey: webhookData.data?.paymentKey,
          orderId: webhookData.data?.orderId,
          amount: webhookData.data?.amount,
          status: webhookData.data?.status
        });
      }
    } catch (parseError) {
      console.warn("⚠️ Could not parse webhook body as JSON:", parseError);
    }

    // Forward to backend for processing
    const response = await fetch(`${API_URL}/api/Payment/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(signature && { "Toss-Signature": signature }),
      },
      body: body,
    });

    const result = await safeJsonParse(response);

    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    const data = result.data as Record<string, unknown>;

    if (data.success) {
      console.log("✅ Webhook processed successfully");
    } else {
      console.error("⚠️ Webhook processing failed:", data.message);
    }

    // IMPORTANT: Always return 200 to Toss (even if internal processing failed)
    // This prevents Toss from retrying webhook delivery
    return NextResponse.json(
      {
        success: true,
        message: "Webhook received",
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Webhook processing error:", error);

    // Still return 200 to prevent Toss from retrying
    // Log error for manual review
    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed",
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  }
}

