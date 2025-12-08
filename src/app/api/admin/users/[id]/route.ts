import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * GET /api/admin/users/[id]
 * Get user details by ID (Admin only)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "인증이 필요합니다." },
                { status: 401 }
            );
        }

        const response = await fetch(`${API_URL}/api/user/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
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

        if (!response.ok) {
            console.error('❌ Failed to fetch user:', data);
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to fetch user' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('❌ Error fetching user:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/users/[id]
 * Update user (Admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "인증이 필요합니다." },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(`${API_URL}/api/user/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(body),
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

        if (!response.ok) {
            console.error('❌ Failed to update user:', data);

            // Handle validation errors
            if (data.errors) {
                return NextResponse.json(
                    { success: false, message: data.message || 'Validation failed', errors: data.errors },
                    { status: response.status }
                );
            }

            return NextResponse.json(
                { success: false, message: data.message || 'Failed to update user' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('❌ Error updating user:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/users/[id]
 * Deactivate user (Admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: "인증이 필요합니다." },
                { status: 401 }
            );
        }

        const response = await fetch(`${API_URL}/api/user/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
        });

        const responseText = await response.text();
        let data;

        if (responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ JSON parse error in DELETE:', parseError);
                return NextResponse.json(
                    { success: false, message: 'Invalid response from server' },
                    { status: 500 }
                );
            }
        } else {
            // Empty response is OK for DELETE
            data = { success: true, message: 'User deactivated successfully' };
        }

        if (!response.ok) {
            console.error('❌ Failed to deactivate user:', data);
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to deactivate user' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('❌ Error deactivating user:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
