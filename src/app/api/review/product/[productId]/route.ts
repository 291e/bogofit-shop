import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// GET /api/review/product/[productId] - Paginated product reviews
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const { productId } = await params;

        if (!productId) {
            return NextResponse.json(
                { success: false, message: 'productId is required' },
                { status: 400 }
            );
        }

        const page = searchParams.get('page') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const rating = searchParams.get('rating');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const query = new URLSearchParams();
        query.set('page', page);
        query.set('pageSize', pageSize);
        query.set('sortBy', sortBy);
        query.set('sortOrder', sortOrder);
        if (rating) query.set('rating', rating);

        const response = await fetch(`${API_URL}/api/Review/product/${productId}?${query}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data?.message || 'Failed to fetch product reviews' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Error fetching product reviews:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}


