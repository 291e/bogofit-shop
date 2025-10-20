import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// GET /api/presignedUrl/specs - Get upload specifications
export async function GET(request: Request) {
  try {
    // Get token from incoming request headers
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${API_URL}/api/PresignedUrl/specs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      }
    });

    // Check if response has content before parsing JSON
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Backend API không trả về dữ liệu' },
        { status: 503 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      return NextResponse.json(
        { success: false, message: 'Backend API trả về dữ liệu không hợp lệ' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to get upload specs' },
        { status: response.status }
      );
    }

    // Convert PascalCase to camelCase for frontend
    const specsData = {
      allowedFileTypes: data.data?.allowedFileTypes || [],
      maxFileSize: data.data?.maxFileSize || 5242880,
      maxFileSizeMB: data.data?.maxFileSizeMB || 5,
      defaultFolders: data.data?.defaultFolders || ['products', 'avatars', 'brands', 'categories'],
      presignedUrlExpiry: data.data?.presignedUrlExpiry || '5 minutes'
    };

    return NextResponse.json({
      success: true,
      message: data.message || 'Upload specs retrieved successfully',
      data: specsData
    });
  } catch (error) {
    console.error('Error getting upload specs:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
