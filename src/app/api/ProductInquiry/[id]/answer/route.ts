import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";
import { AnswerProductInquiryDto } from '@/types/productInquiry';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * PUT /api/ProductInquiry/{id}/answer
 * Answer inquiry (Brand Owner/Admin only)
 * Using PUT because we're updating the inquiry resource with an answer
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: AnswerProductInquiryDto = await request.json();
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { success: false, message: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!body.answer) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: answer' },
                { status: 400 }
            );
        }

        // Validate answer length
        if (body.answer.length < 10 || body.answer.length > 2000) {
            return NextResponse.json(
                { success: false, message: 'Answer must be between 10 and 2000 characters' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_URL}/api/ProductInquiry/${id}/answer`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
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
        console.error('❌ Error answering inquiry:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

