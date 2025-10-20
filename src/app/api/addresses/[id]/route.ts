import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT - Update address
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    try {
      const response = await fetch(`${API_URL}/api/Address/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete address
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;

    try {
      const response = await fetch(`${API_URL}/api/Address/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

