import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * POST /api/payment/webhook
 * Handle Toss Payments webhook notifications
 * 
 * Events:
 * - payment.approved: Payment completed successfully
 * - payment.canceled: Payment canceled/refunded
 * - payment.failed: Payment failed
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📨 Webhook received from Toss Payments");
    
    // Get webhook body and signature
    const body = await request.text();
    const signature = request.headers.get("toss-signature");
    
    console.log("Webhook signature:", signature ? "Present" : "Missing");
    
    // Forward to backend for processing
    const response = await fetch(`${API_URL}/api/Payment/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(signature && { "Toss-Signature": signature }),
      },
      body: body,
    });

    const data = await response.json();
    
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

