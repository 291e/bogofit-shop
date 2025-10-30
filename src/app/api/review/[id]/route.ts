import { NextRequest, NextResponse } from 'next/server';
import { UpdateReviewDto } from '@/types/review';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// GET /api/review/[id] - Get single review
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        const response = await fetch(`${API_URL}/api/Review/${id}`, {
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
            console.error('❌ Failed to fetch review:', data);
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to fetch review' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Error fetching review:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/review/[id] - Update review
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: UpdateReviewDto = await request.json();
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: 'Authorization header required' },
                { status: 401 }
            );
        }

        // Validate rating if provided
        if (body.rating && (body.rating < 1 || body.rating > 5)) {
            return NextResponse.json(
                { success: false, message: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_URL}/api/Review/${id}`, {
            method: 'PUT',
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
            console.error('❌ Review update failed:', data);
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to update review' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Error updating review:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/review/[id] - Delete review
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: 'Authorization header required' },
                { status: 401 }
            );
        }

        const response = await fetch(`${API_URL}/api/Review/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
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
            console.error('❌ Review deletion failed:', data);
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to delete review' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Error deleting review:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
