import { NextRequest, NextResponse } from "next/server";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");


    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 401 }
      );
    }

    
    try {
      const response = await fetch(`${API_URL}/SellApplication`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
    
      return NextResponse.json(data, { status: response.status });
    } catch {
      // Fallback khi backend API không khả dụng
      return NextResponse.json(
        { success: false, message: "Backend service unavailable" },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error("Application check error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      businessName, 
      bizRegNo, 
      contactName, 
      contactPhone, 
      contactEmail, 
      docs
    } = body;

    // Validation
    if (!businessName) {
      return NextResponse.json(
        { success: false, message: "Business name is required" },
        { status: 400 }
      );
    }

    // Forward request to actual API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${API_URL}/SellApplication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        businessName,
        bizRegNo: bizRegNo || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        docs: docs || []
      }),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error("Application creation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
