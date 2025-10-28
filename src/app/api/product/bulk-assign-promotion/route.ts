import { NextRequest, NextResponse } from 'next/server';
import { BulkAssignPromotionRequest } from '@/types/promotion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
    try {
        const body: BulkAssignPromotionRequest = await request.json();
        const authHeader = request.headers.get('authorization');

        // Validation
        if (!body.productIds || !Array.isArray(body.productIds) || body.productIds.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Product IDs are required and must be a non-empty array' },
                { status: 400 }
            );
        }

        if (body.promotionId === undefined) {
            return NextResponse.json(
                { success: false, message: 'Promotion ID is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_URL}/api/Product/bulk-assign-promotion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { Authorization: authHeader })
            },
            body: JSON.stringify({
                productIds: body.productIds,
                promotionId: body.promotionId
            })
        });

        const responseText = await response.text();
        let data;

        if (responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                console.error('Response text:', responseText);
                return NextResponse.json(
                    { success: false, message: 'Invalid response from server' },
                    { status: 500 }
                );
            }
        } else {
            console.error('❌ Empty response from backend');
            return NextResponse.json(
                { success: false, message: 'Empty response from backend' },
                { status: 503 }
            );
        }

        if (!response.ok) {
            console.error('❌ POST /api/product/bulk-assign-promotion - Backend Error:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });

            return NextResponse.json(
                { success: false, message: data.message || 'Failed to assign promotion to products' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Error bulk assigning promotion:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

