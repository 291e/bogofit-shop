import { NextRequest, NextResponse } from "next/server";
import { UpdatePromotionRequest } from "@/types/promotion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * GET /api/promotion/{id}
 * Get promotion by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get authorization header from the incoming request
        const authHeader = request.headers.get('authorization');

        const { id } = await params;

        // Call backend C# API
        const response = await fetch(`${API_BASE_URL}/api/promotion/${id}`, {
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
                { message: data?.message || "Promotion not found" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Promotion fetch error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/promotion/{id}?brandId={brandId}
 * Update promotion
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get authorization header from the incoming request
        const authHeader = request.headers.get('authorization');

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');

        if (!brandId) {
            return NextResponse.json(
                { message: "Brand ID is required" },
                { status: 400 }
            );
        }

        const body: UpdatePromotionRequest = await request.json();

        // Validation
        if (body.startDate && body.endDate && new Date(body.endDate) <= new Date(body.startDate)) {
            return NextResponse.json(
                { message: "End date must be after start date" },
                { status: 400 }
            );
        }

        // Call backend C# API to update promotion
        const response = await fetch(`${API_BASE_URL}/api/promotion/${id}?brandId=${brandId}`, {
            method: 'PUT',
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
                { message: data?.message || "Failed to update promotion" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Promotion update error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/promotion/{id}?brandId={brandId}
 * Delete promotion
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get('authorization');

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');

        if (!brandId) {
            return NextResponse.json(
                { message: "Brand ID is required" },
                { status: 400 }
            );
        }

        // Call backend C# API to delete promotion
        const response = await fetch(`${API_BASE_URL}/api/promotion/${id}?brandId=${brandId}`, {
            method: 'DELETE',
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
                { message: data?.message || "Failed to delete promotion" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Promotion deletion error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
