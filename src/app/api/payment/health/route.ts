import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * GET /api/payment/health
 * Health check for payment service
 */
export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/Payment/health`);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Payment Health Check Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Payment service health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

