import { NextRequest, NextResponse } from 'next/server';
import { RegisterRequest } from '@/types/auth';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { userId, password, email, phone, name } = body;


    // Forward the request to the C# API
      const response = await fetch(`${API_URL}/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password, email, phone, name }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error: any) {
    console.error('Error in Next.js API route:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
