import { NextResponse } from "next/server";

/**
 * GET /api/payment/client-key
 * Return Toss Payments client key from environment
 */
export async function GET() {
  try {
    // Get client key from environment variable (supports both test and live)
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_DpexMgkW36w6zPw6vYZBVGbR5ozO";
    
    if (!clientKey) {
      console.error("❌ [CLIENT-KEY] TOSS_CLIENT_KEY not set in environment");
      return NextResponse.json(
        {
          success: false,
          message: "Toss client key not configured",
        },
        { status: 500 }
      );
    }
    
    // Log which key type is being used (without exposing the full key)
    const keyType = clientKey.startsWith("live_") ? "🔴 LIVE" : "🟢 TEST";
    console.log(`✅ [CLIENT-KEY] Returning ${keyType} client key:`, clientKey.substring(0, 15) + "...");
    
    return NextResponse.json({
      success: true,
      message: "Client key retrieved successfully",
      data: {
        clientKey: clientKey,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("❌ [CLIENT-KEY] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

