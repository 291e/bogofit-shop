import { NextRequest, NextResponse } from "next/server";
import { CreatePromotionRequest } from "@/types/promotion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * GET /api/promotion?brandId={brandId}&page=1&pageSize=10&status=pending
 * Get promotions by brand with filtering and pagination
 */
export async function GET(request: NextRequest) {
    try {
        // Get authorization header from the incoming request
        const authHeader = request.headers.get('authorization');

        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const status = searchParams.get('status') as string | null;
        const type = searchParams.get('type') as string | null;
        const onlyActive = searchParams.get('onlyActive') === 'true';

        if (!brandId) {
            return NextResponse.json(
                { message: "Brand ID is required" },
                { status: 400 }
            );
        }

        // Build query parameters for backend
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
            onlyActive: onlyActive.toString(),
        });

        if (status) params.append('status', status);
        if (type) params.append('type', type);

        // Call backend C# API
        const response = await fetch(`${API_BASE_URL}/api/promotion/brand/${brandId}?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { Authorization: authHeader }),
            },
        });

        const responseText = await response.text();
        let data;

        if (responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                return NextResponse.json(
                    { message: "Invalid response format" },
                    { status: 500 }
                );
            }
        }

        if (!response.ok) {
            return NextResponse.json(
                { message: data?.message || "Failed to fetch promotions" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Promotion API error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/promotion?brandId={brandId}
 * Create new promotion
 */
export async function POST(request: NextRequest) {
    try {
        // Get authorization header from the incoming request
        const authHeader = request.headers.get('authorization');

        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');

        if (!brandId) {
            return NextResponse.json(
                { message: "Brand ID is required" },
                { status: 400 }
            );
        }

        const body: CreatePromotionRequest = await request.json();

        // Validation
        if (!body.name || !body.type || !body.startDate || !body.endDate) {
            return NextResponse.json(
                { message: "Name, type, startDate, and endDate are required" },
                { status: 400 }
            );
        }

        if (body.type === 'percentage' && (body.value === undefined || body.value < 0 || body.value > 100)) {
            return NextResponse.json(
                { message: "Percentage value must be between 0 and 100" },
                { status: 400 }
            );
        }

        if (body.type === 'fixed_amount' && (body.value === undefined || body.value <= 0)) {
            return NextResponse.json(
                { message: "Fixed amount value must be greater than 0" },
                { status: 400 }
            );
        }

        if (new Date(body.endDate) <= new Date(body.startDate)) {
            return NextResponse.json(
                { message: "End date must be after start date" },
                { status: 400 }
            );
        }

        // Call backend C# API to create promotion
        const response = await fetch(`${API_BASE_URL}/api/promotion?brandId=${brandId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { Authorization: authHeader }),
            },
            body: JSON.stringify(body),
        });

        const responseText = await response.text();
        let data;

        if (responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                return NextResponse.json(
                    { message: "Invalid response format" },
                    { status: 500 }
                );
            }
        }

        if (!response.ok) {
            return NextResponse.json(
                { message: data?.message || "Failed to create promotion" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Promotion creation error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
