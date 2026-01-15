import { NextRequest, NextResponse } from 'next/server';

// ✅ Tăng timeout lên 5 phút cho background processing
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

const EC2_URL = 'http://ec2-15-164-186-97.ap-northeast-2.compute.amazonaws.com:5001';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Virtual Fitting API called');

    // Get FormData from request
    const formData = await request.formData();

    // Log FormData contents for debugging
    console.log('📦 FormData contents:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    // Check if background is included
    const hasBackground = formData.has('background_file');
    if (hasBackground) {
      console.log('⚠️ Background file detected - using extended timeout');
    }

    // Forward request to EC2 server
    console.log(`📡 Forwarding to ${EC2_URL}/run_workflow`);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, hasBackground ? 180000 : 60000); // 3 min with background, 1 min without

    const response = await fetch(`${EC2_URL}/run_workflow`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    console.log(`📡 EC2 response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ EC2 error response:', errorText);
      return NextResponse.json(
        { error: `EC2 server error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Parse and return response
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log('✅ Success - returning JSON response');
      return NextResponse.json(data);
    } else {
      const text = await response.text();
      console.log('✅ Success - returning text response');
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': contentType || 'text/plain',
        },
      });
    }

  } catch (error: any) {
    console.error('❌ Virtual Fitting API error:', error);

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - EC2 server took too long to respond' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
