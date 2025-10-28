import { NextRequest, NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * PUT /api/order/[id]/status
 * Update order status (seller only)
 * id can be either UUID or OrderNo (BOGOFIT-xxx)
 */
export async function PUT(
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

        const body = await request.json();

        const response = await fetch(
            `${API_URL}/api/Order/${id}/status`,
            {
                method: "PUT",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        const result = await safeJsonParse(response);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    const data = result.data;

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Update Order Status API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
