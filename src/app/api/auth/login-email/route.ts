import { NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/Auth/login-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Email: body.email,
        Password: body.password
      })
    });

    const result = await safeJsonParse(response);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    const data = result.data;
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Login by email error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
