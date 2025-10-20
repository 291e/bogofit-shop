import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// POST /api/presignedUrl/generate - Generate presigned URL for S3 upload
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get token from incoming request headers
    const authHeader = request.headers.get('authorization');

    // Convert camelCase to PascalCase for backend
    const requestDto = {
      FileName: body.fileName,
      FileType: body.fileType,
      FileSize: body.fileSize,
      Folder: body.folder || 'products'
    };

    const response = await fetch(`${API_URL}/api/PresignedUrl/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify(requestDto)
    });

    // Check if response has content before parsing JSON
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Backend API không trả về dữ liệu. Kiểm tra xem API đã chạy chưa.' },
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
        { success: false, message: 'Backend API trả về dữ liệu không hợp lệ. Kiểm tra endpoint /api/PresignedUrl/generate' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to generate presigned URL' },
        { status: response.status }
      );
    }

    // Convert PascalCase to camelCase for frontend
    const responseData = {
      uploadUrl: data.data?.uploadUrl || data.uploadUrl,
      s3Key: data.data?.s3Key || data.s3Key,
      s3Url: data.data?.s3Url || data.s3Url,
      expiresAt: data.data?.expiresAt || data.expiresAt
    };

    return NextResponse.json({
      success: true,
      message: data.message || 'Presigned URL generated successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

