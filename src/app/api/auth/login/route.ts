import { NextRequest, NextResponse } from 'next/server';
import { LoginRequest, LoginResponse } from '@/types/auth';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 } 
    );
  }
}
