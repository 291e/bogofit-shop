import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * PUT /api/ProductInquiry/{id}/hide
 * Hide inquiry (Brand Owner/Admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { success: false, message: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        const response = await fetch(`${API_URL}/api/ProductInquiry/${id}/hide`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await safeJsonParse(response);

        if (!result.success) {
            return NextResponse.json(result, { status: result.status || 500 });
        }

        return NextResponse.json(result.data, {
            status: response.status,
            headers: {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Referrer-Policy': 'strict-origin-when-cross-origin'
            }
        });
    } catch (error) {
        console.error('❌ Error hiding inquiry:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

