import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * PUT /api/product/{id}/promotion
 * Assign promotion to product
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: productId } = await params;
        const authHeader = request.headers.get('authorization');
        const body = await request.json();

        const { promotionId } = body;

        if (!promotionId) {
            return NextResponse.json(
                { success: false, message: 'Promotion ID is required' },
                { status: 400 }
            );
        }

        // Call backend C# API
        const response = await fetch(`${API_URL}/api/Product/${productId}/promotion`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { Authorization: authHeader })
            },
            body: JSON.stringify({ promotionId })
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
                { status: 500 }
            );
        }

        if (!response.ok) {
            console.error('❌ Failed to assign promotion:', data);
            return NextResponse.json(
                { success: false, message: data?.message || 'Failed to assign promotion' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Error assigning promotion:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/product/{id}/promotion
 * Remove promotion from product
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: productId } = await params;
        const authHeader = request.headers.get('authorization');

        // Call backend C# API
        const response = await fetch(`${API_URL}/api/Product/${productId}/promotion`, {
            method: 'DELETE',
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
                { status: 500 }
            );
        }

        if (!response.ok) {
            console.error('❌ Failed to remove promotion:', data);
            return NextResponse.json(
                { success: false, message: data?.message || 'Failed to remove promotion' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Error removing promotion:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

