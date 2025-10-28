import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/ai/video-proxy?url=<google_video_url>
 * Proxy video from Google GenAI API to bypass CORS and authentication issues
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const videoUrl = searchParams.get('url');

        if (!videoUrl) {
            return NextResponse.json(
                { error: 'Video URL is required' },
                { status: 400 }
            );
        }

        console.log('🎬 Proxying video from:', videoUrl);

        // Check if we need API key for Google API
        const isGoogleApi = videoUrl.includes('generativelanguage.googleapis.com');
        const apiKey = process.env.GEMINI_API_KEY;

        if (isGoogleApi && !apiKey) {
            console.error('❌ GEMINI_API_KEY not configured for Google API video');
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        // Build headers with authentication if needed
        const headers: HeadersInit = {
            'Accept': 'video/*',
        };

        // Add API key to URL for Google API (they use query parameter authentication)
        let fetchUrl = videoUrl;
        if (isGoogleApi && apiKey) {
            const url = new URL(videoUrl);
            url.searchParams.set('key', apiKey);
            fetchUrl = url.toString();
            console.log('🔑 Added API key to request');
        }

        // Fetch video from Google's API
        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Failed to fetch video from Google:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            return NextResponse.json(
                {
                    error: 'Failed to fetch video from source',
                    status: response.status,
                    details: errorText
                },
                { status: response.status }
            );
        }

        // Get video content
        const videoBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'video/mp4';

        console.log('✅ Video proxied successfully, size:', videoBuffer.byteLength);

        // Return video with proper headers
        return new NextResponse(videoBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': videoBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Accept-Ranges': 'bytes',
            },
        });

    } catch (error) {
        console.error('❌ Video proxy error:', error);
        return NextResponse.json(
            {
                error: 'Failed to proxy video',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

