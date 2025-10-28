import { NextRequest, NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * GET /api/order/[id]
 * Smart Order Detail - Backend handles detection:
 * - If id is UUID → Returns OrderGroup (for buyers)
 * - If id is OrderNo (BOGOFIT-xxx) → Returns Order (for sellers)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authorization required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/api/Order/${id}`, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    const result = await safeJsonParse(response);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    const data = result.data;

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Get Order Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

