import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * GET /api/admin/users
 * Get list of users with pagination and filters (Admin only)
 */
export async function GET(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "인증이 필요합니다." },
                { status: 401 }
            );
        }

        // Get query parameters from request
        const { searchParams } = new URL(request.url);

        // Build URL with all query parameters
        const apiUrl = new URL(`${API_URL}/api/user`);

        // Forward all query params to backend
        searchParams.forEach((value, key) => {
            apiUrl.searchParams.append(key, value);
        });

        // Call backend API
        const response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        // Parse response
        const responseText = await response.text();
        let data;

        if (responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                console.error('Response text:', responseText);
                return NextResponse.json(
                    { success: false, message: 'Invalid response from backend' },
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

        // Handle error responses
        if (!response.ok) {
            console.error('❌ Failed to fetch users:', data);
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to fetch users' },
                { status: response.status }
            );
        }

        // Return successful response
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('❌ Error fetching users:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
