import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// GET /api/review/product/[productId]/stats - Review statistics for a product
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;
        if (!productId) {
            return NextResponse.json(
                { success: false, message: 'productId is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_URL}/api/Review/product/${productId}/stats`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data?.message || 'Failed to fetch review stats' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Error fetching review stats:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}


