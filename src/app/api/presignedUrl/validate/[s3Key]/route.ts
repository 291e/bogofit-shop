import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// GET /api/presignedUrl/validate/[s3Key] - Validate S3 upload
export async function GET(
  request: Request,
  { params }: { params: Promise<{ s3Key: string }> }
) {
  try {
    const { s3Key } = await params;

    // Get token from incoming request headers
    const authHeader = request.headers.get('authorization');

    // Decode the s3Key (it might be URL encoded)
    const decodedS3Key = decodeURIComponent(s3Key);

    const response = await fetch(`${API_URL}/api/PresignedUrl/validate/${encodeURIComponent(decodedS3Key)}`, {
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
        { success: false, message: 'Backend API không trả về dữ liệu', exists: false },
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
        { success: false, message: 'Backend API trả về dữ liệu không hợp lệ', exists: false },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to validate upload', exists: false },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: data.success !== undefined ? data.success : true,
      message: data.message || 'Validation successful',
      exists: data.exists || false
    });
  } catch (error) {
    console.error('Error validating S3 upload:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', exists: false },
      { status: 500 }
    );
  }
}
