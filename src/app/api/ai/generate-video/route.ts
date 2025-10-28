import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI with proper error handling
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

/**
 * POST /api/ai/generate-video
 * Generate video from virtual fitting result using Google GenAI
 */
export async function POST(request: NextRequest) {
    try {
        console.log('🎬 AI Generate Video API called');

        const { imageUrl, prompt, productTitle } = await request.json();

        console.log('📝 Request data:', {
            hasImageUrl: !!imageUrl,
            prompt: prompt?.substring(0, 50) + '...',
            productTitle
        });

        if (!imageUrl) {
            console.log('❌ No image URL provided');
            return NextResponse.json(
                { success: false, message: "Image URL is required" },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            console.log('⚠️ GEMINI_API_KEY not configured, returning mock response');
            return NextResponse.json({
                success: true,
                data: {
                    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    prompt: prompt || `A fashion model wearing ${productTitle || 'fashionable clothing'} rotating left then right to show outfit`,
                    operationName: "mock-operation",
                    duration: "6초",
                    generationTime: "15-20초",
                    aspectRatio: "9:16",
                    resolution: "720p"
                }
            });
        }

        console.log('✅ API key found, proceeding with video generation...');

        // Step 1: Handle image - either data URL or regular URL
        let imageBase64: string;
        let mimeType: string;

        if (imageUrl.startsWith('data:')) {
            // Data URL (base64) from Gemini AI
            console.log('📥 Processing data URL from Gemini AI...');
            const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (!matches) {
                throw new Error('Invalid data URL format');
            }
            mimeType = matches[1];
            imageBase64 = matches[2];
            console.log('📥 Data URL processed successfully');
            console.log('📥 MIME type:', mimeType);
        } else {
            // Regular URL - download and convert
            console.log('📥 Downloading image from URL...');
            let imageResponse;
            try {
                imageResponse = await fetch(imageUrl);
                console.log('📥 Image response status:', imageResponse.status);
            } catch (fetchError: unknown) {
                console.error('❌ Image fetch error:', fetchError);
                throw new Error(`Failed to fetch image: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
            }

            if (!imageResponse.ok) {
                const errorText = await imageResponse.text();
                console.error('❌ Image download failed:', errorText);
                throw new Error(`Failed to fetch image: ${imageResponse.status} - ${errorText}`);
            }

            let imageBuffer;
            try {
                imageBuffer = await imageResponse.arrayBuffer();
                imageBase64 = Buffer.from(imageBuffer).toString('base64');
                mimeType = imageResponse.headers.get('content-type') || 'image/png';

                console.log('📥 Image downloaded successfully');
                console.log('📥 Image size:', imageBuffer.byteLength, 'bytes');
                console.log('📥 MIME type:', mimeType);
            } catch (bufferError: unknown) {
                console.error('❌ Image buffer conversion error:', bufferError);
                throw new Error(`Failed to convert image to base64: ${bufferError instanceof Error ? bufferError.message : String(bufferError)}`);
            }
        }

        // Step 2: Generate video from the REAL image
        const videoPrompt = prompt || `A person trying on and showing off ${productTitle || 'fashionable clothing'}. Standing in place and slowly rotating 360 degrees to show front, left side, back, and right side of the outfit. Fashion fitting room style. Vertical 9:16 format. Stay in the same spot, only turn body smoothly. Clean background.`;

        console.log('🎬 Starting video generation with Veo 3.1 using REAL image');
        console.log('🎬 Video settings: 6 seconds, vertical 9:16 (720p), 360° rotation showcase');

        let operation;
        try {
            console.log('🎬 Calling Google GenAI generateVideos with real image...');
            operation = await ai.models.generateVideos({
                model: "veo-3.1-generate-preview",
                prompt: videoPrompt,
                image: {
                    imageBytes: imageBase64,
                    mimeType: mimeType,
                },
                config: {
                    durationSeconds: 6, // 6 giây (gần 5s nhất theo spec: 4, 6, 8)
                    aspectRatio: "9:16", // Video dọc (vertical/portrait) 
                    resolution: "720p", // 720p resolution
                    personGeneration: "allow_adult" // Cho phép generate người lớn (image-to-video)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any // Type cast vì SDK có thể chưa update với latest API
            });
            console.log('🎬 Google GenAI API call successful');
        } catch (apiError: unknown) {
            console.error('❌ Google GenAI API error:', apiError);
            console.error('❌ API Error details:', {
                message: apiError instanceof Error ? apiError.message : String(apiError),
                name: apiError instanceof Error ? apiError.name : 'Unknown',
                stack: apiError instanceof Error ? apiError.stack : undefined
            });
            throw new Error(`Google GenAI API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
        }

        console.log('🎬 Video generation operation started:', operation.name);

        // Step 3: Poll the operation status until the video is ready
        console.log('🎬 Polling for video generation completion...');

        while (!operation.done) {
            console.log("🎬 Waiting for video generation to complete...");
            await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds

            try {
                operation = await ai.operations.getVideosOperation({
                    operation: operation,
                });
            } catch (pollError: unknown) {
                console.error('❌ Polling error:', pollError);
                throw new Error(`Polling error: ${pollError instanceof Error ? pollError.message : String(pollError)}`);
            }
        }

        if (operation.error) {
            throw new Error(`Video generation failed: ${operation.error.message}`);
        }

        // Step 4: Get the video URL and download it
        const googleVideoUrl = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!googleVideoUrl) {
            throw new Error("No video URL returned from generation");
        }

        console.log('🎬 Video generation completed successfully');
        console.log('📥 Original Google Video URL:', googleVideoUrl);

        // Download video with API key authentication
        console.log('📥 Downloading video from Google API...');
        const downloadUrl = new URL(googleVideoUrl);
        downloadUrl.searchParams.set('key', process.env.GEMINI_API_KEY || '');

        const videoResponse = await fetch(downloadUrl.toString());

        if (!videoResponse.ok) {
            console.error('❌ Failed to download video:', videoResponse.status);
            // Fallback to proxy URL if download fails
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
            const proxyVideoUrl = `${baseUrl}/api/ai/video-proxy?url=${encodeURIComponent(googleVideoUrl)}`;

            return NextResponse.json({
                success: true,
                data: {
                    videoUrl: proxyVideoUrl,
                    originalUrl: googleVideoUrl,
                    prompt: videoPrompt,
                    operationName: operation.name,
                    duration: "6초",
                    generationTime: "15-20초",
                    aspectRatio: "9:16",
                    resolution: "720p"
                }
            });
        }

        // Convert video to base64 data URL
        const videoBuffer = await videoResponse.arrayBuffer();
        const videoBase64 = Buffer.from(videoBuffer).toString('base64');
        const videoDataUrl = `data:video/mp4;base64,${videoBase64}`;

        console.log('✅ Video downloaded and converted to base64');
        console.log('📊 Video size:', videoBuffer.byteLength, 'bytes');

        return NextResponse.json({
            success: true,
            data: {
                videoUrl: videoDataUrl,
                originalUrl: googleVideoUrl,
                prompt: videoPrompt,
                operationName: operation.name,
                duration: "6초",
                generationTime: "15-20초",
                aspectRatio: "9:16",
                resolution: "720p"
            }
        });


    } catch (error) {
        console.error("Video Generation API Error:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined,
        });
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
                error: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
