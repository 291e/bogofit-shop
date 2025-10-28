import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";
import { RegisterDto } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterDto = await request.json();
    const { userId, password, email, phone, name } = body;


    // Forward the request to the C# API
      const response = await fetch(`${API_URL}/api/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password, email, phone, name }),
    });

    const result = await safeJsonParse(response);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    const data = result.data;
    
    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error: Error | unknown) {
    console.error('Error in Next.js API route:', error);
    return NextResponse.json({ success: false, message: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
