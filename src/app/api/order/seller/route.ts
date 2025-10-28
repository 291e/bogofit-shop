import { NextRequest, NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/api-utils";
import { GetOrdersResponse } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * GET /api/order/seller
 * Get all orders for seller's brand
 * Query params: status, page, pageSize
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get("authorization");

        console.log('🔍 Seller Orders API called');
        console.log('📤 Token received:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

        if (!token) {
            console.log('❌ No authorization token provided');
            return NextResponse.json(
                { success: false, message: "Authorization required" },
                { status: 401 }
            );
        }

        // Forward query params (status, page, pageSize)
        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();

        console.log('📤 Forwarding to backend:', `${API_URL}/api/Order/seller${queryString ? `?${queryString}` : ""}`);

        const response = await fetch(
            `${API_URL}/api/Order/seller${queryString ? `?${queryString}` : ""}`,
            {
                method: "GET",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log('📥 Backend response status:', response.status);

        const result = await safeJsonParse(response);

        if (!result.success) {
            return NextResponse.json(result, { status: result.status || 500 });
        }

        const data = result.data as GetOrdersResponse | undefined;
        console.log('📥 Backend response data:', data?.message);

        if (response.status === 500 && (data?.message as string)?.includes('Brand not found')) {
            console.log('❌ Brand authorization failed - User may not have approved SellApplication or Brand');
            return NextResponse.json(
                { success: false, message: 'Brand authorization failed - User may not have approved SellApplication or Brand' },
                { status: 401 }
            );
        }

        return NextResponse.json(data as GetOrdersResponse, { status: response.status });

    } catch (error) {
        console.error('Error fetching seller orders:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
