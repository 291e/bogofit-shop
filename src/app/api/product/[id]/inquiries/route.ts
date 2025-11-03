import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * GET /api/Product/{id}/inquiries
 * Get product inquiries (public endpoint, optional auth)
 * This endpoint is part of Product API to reduce the number of endpoints
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        
        // Get query parameters
        const page = searchParams.get('page') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const status = searchParams.get('status'); // optional: pending, answered, hidden

        // Build query string
        const queryParams = new URLSearchParams({
            page,
            pageSize
        });

        if (status) {
            queryParams.set('status', status);
        }

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

        const response = await fetch(
            `${API_URL}/api/Product/${id}/inquiries?${queryParams}`,
            {
                method: 'GET',
                headers
            }
        );

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
        console.error('❌ Error fetching product inquiries:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

