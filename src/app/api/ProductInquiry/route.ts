import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";
import { CreateProductInquiryDto } from '@/types/productInquiry';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * POST /api/ProductInquiry
 * Create a new product inquiry
 */
export async function POST(request: NextRequest) {
    try {
        const body: CreateProductInquiryDto = await request.json();
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { success: false, message: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!body.productId || !body.question) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: productId, question' },
                { status: 400 }
            );
        }

        // Validate question length
        if (body.question.length < 10 || body.question.length > 2000) {
            return NextResponse.json(
                { success: false, message: 'Question must be between 10 and 2000 characters' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_URL}/api/ProductInquiry`, {
            method: 'POST',
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
        console.error('❌ Error creating product inquiry:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

