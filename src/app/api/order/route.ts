import { NextRequest, NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/api-utils";
// import { Order, OrderGroup, OrderResponse } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * GET /api/order
 * Get all user's orders (grouped view)
 * - Returns both order groups (MoR) and single orders (SoR)
 * - Query params: page, pageSize
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authorization required" },
        { status: 401 }
      );
    }

    // Forward query params (page, pageSize)
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const response = await fetch(
      `${API_URL}/api/Order${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await safeJsonParse(response);

    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    const data = result.data;

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

