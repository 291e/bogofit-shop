import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// DELETE /api/presignedUrl/delete/[s3Key] - Delete file from S3
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ s3Key: string }> }
) {
  try {
    const { s3Key } = await params;

    // Get token from incoming request headers
    const authHeader = request.headers.get('authorization');

    // Decode the s3Key (it might be URL encoded)
    const decodedS3Key = decodeURIComponent(s3Key);

    const response = await fetch(`${API_URL}/api/PresignedUrl/delete/${encodeURIComponent(decodedS3Key)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      }
    });

    // Check if response has content before parsing JSON
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Backend API không trả về dữ liệu', deleted: false },
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
        { success: false, message: 'Backend API trả về dữ liệu không hợp lệ', deleted: false },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete file', deleted: false },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: data.success !== undefined ? data.success : true,
      message: data.message || 'File deleted successfully',
      deleted: data.deleted !== undefined ? data.deleted : true
    });
  } catch (error) {
    console.error('Error deleting S3 file:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', deleted: false },
      { status: 500 }
    );
  }
}
