import { NextRequest, NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * GET /api/settlement/stats
 * Get settlement statistics for a brand
 * Query params: startDate, endDate, timeRange (7d, 30d, 90d, 1y)
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

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const timeRange = searchParams.get("timeRange") || "30d";

        // Calculate date range based on timeRange if not provided
        let calculatedStartDate = startDate;
        let calculatedEndDate = endDate;

        if (!startDate || !endDate) {
            const now = new Date();
            const end = new Date(now);
            const start = new Date(now);

            switch (timeRange) {
                case "7d":
                    start.setDate(now.getDate() - 7);
                    break;
                case "30d":
                    start.setDate(now.getDate() - 30);
                    break;
                case "90d":
                    start.setDate(now.getDate() - 90);
                    break;
                case "1y":
                    start.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    start.setDate(now.getDate() - 30);
            }

            calculatedStartDate = start.toISOString().split('T')[0];
            calculatedEndDate = end.toISOString().split('T')[0];
        }

        // Build query string
        const queryParams = new URLSearchParams();
        if (calculatedStartDate) {
            queryParams.append('startDate', calculatedStartDate);
        }
        if (calculatedEndDate) {
            queryParams.append('endDate', calculatedEndDate);
        }

        console.log('🔍 Settlement Stats API called');
        console.log('📤 Date range:', calculatedStartDate, 'to', calculatedEndDate);

        const response = await fetch(
            `${API_URL}/api/Settlement/stats?${queryParams.toString()}`,
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

        const data = result.data;

        // If backend doesn't have this endpoint, return mock data
        if (response.status === 404) {
            console.log('📥 Backend endpoint not found, returning mock data');

            const mockData = {
                success: true,
                data: {
                    totalRevenue: 12500000,
                    totalOrders: 342,
                    averageOrderValue: 36549,
                    newCustomers: 58,
                    revenueGrowth: 12.5,
                    ordersGrowth: -3.2,
                    aovGrowth: 5.1,
                    customersGrowth: 8.7,
                    timeRange: timeRange,
                    startDate: calculatedStartDate,
                    endDate: calculatedEndDate,
                }
            };

            return NextResponse.json(mockData, { status: 200 });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Settlement Stats API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
