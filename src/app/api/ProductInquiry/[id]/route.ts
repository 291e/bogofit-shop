import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";
import { UpdateProductInquiryDto } from '@/types/productInquiry';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * GET /api/ProductInquiry/{id}
 * Get inquiry by ID (public endpoint, optional auth)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Get token (optional for public access)
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace("Bearer ", "");

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Add auth header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/ProductInquiry/${id}`, {
            method: 'GET',
            headers
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
        console.error('❌ Error fetching inquiry:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/ProductInquiry/{id}
 * Update inquiry (Customer only - before answered)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: UpdateProductInquiryDto = await request.json();
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { success: false, message: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // Validate question length if provided
        if (body.question !== undefined) {
            if (body.question.length < 10 || body.question.length > 2000) {
                return NextResponse.json(
                    { success: false, message: 'Question must be between 10 and 2000 characters' },
                    { status: 400 }
                );
            }
        }

        const response = await fetch(`${API_URL}/api/ProductInquiry/${id}`, {
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
        console.error('❌ Error updating inquiry:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/ProductInquiry/{id}
 * Delete inquiry (Customer only - before answered)
 */
export async function DELETE(
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

        const response = await fetch(`${API_URL}/api/ProductInquiry/${id}`, {
            method: 'DELETE',
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
        console.error('❌ Error deleting inquiry:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

