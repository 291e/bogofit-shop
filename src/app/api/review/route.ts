import { NextRequest, NextResponse } from 'next/server';
import { CreateReviewDto } from '@/types/review';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// POST /api/review - Create new review
export async function POST(request: NextRequest) {
    try {
        const body: CreateReviewDto = await request.json();
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: 'Authorization header required' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!body.productId || !body.rating) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: productId, rating' },
                { status: 400 }
            );
        }

        // Validate rating
        if (body.rating < 1 || body.rating > 5) {
            return NextResponse.json(
                { success: false, message: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_URL}/api/Review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(body)
        });

        const responseText = await response.text();
        let data;

        if (responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                return NextResponse.json(
                    { success: false, message: 'Invalid response from server' },
                    { status: 500 }
                );
            }
        }

        if (!response.ok) {
            console.error('❌ Review creation failed:', data);
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to create review' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Error creating review:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/review - Get reviews with query parameters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const authHeader = request.headers.get('authorization');

        // Build query parameters
        const queryParams = new URLSearchParams();

        const page = searchParams.get('page') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const rating = searchParams.get('rating');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        queryParams.set('page', page);
        queryParams.set('pageSize', pageSize);
        queryParams.set('sortBy', sortBy);
        queryParams.set('sortOrder', sortOrder);

        if (rating) {
            queryParams.set('rating', rating);
        }

        const response = await fetch(`${API_URL}/api/Review/my-reviews?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { Authorization: authHeader })
            }
        });

        const responseText = await response.text();
        let data;

        if (responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                return NextResponse.json(
                    { success: false, message: 'Invalid response from server' },
                    { status: 500 }
                );
            }
        }

        if (!response.ok) {
            console.error('❌ Failed to fetch reviews:', data);
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to fetch reviews' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Error fetching reviews:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
