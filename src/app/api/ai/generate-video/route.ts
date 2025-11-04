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

        const { imageUrl, prompt, productTitle, negativePrompt } = await request.json();

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
                    prompt: prompt || `Fashionshow turning: A model wearing ${productTitle || 'fashionable clothing'} turning and rotating on a runway. Fashion show presentation with smooth turning motion.`,
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
        const videoPrompt = prompt || `Fashionshow turning: A model wearing ${productTitle || 'fashionable clothing'} turning and rotating 360 degrees on a runway. Fashion show presentation, professional model pose, smooth turning motion, showing front, side, back views. Vertical 9:16 format. Fashion runway style.`;

        // Negative prompt to avoid unwanted elements
        const videoNegativePrompt = negativePrompt || "blurry, distorted, low quality, artifacts, bad proportions, deformed, ugly, multiple people, crowd, background people, text overlay, watermark";

        console.log('🎬 Starting video generation with Veo 3.1 using REAL image');
        console.log('🎬 Video settings: 6 seconds, vertical 9:16 (720p), 360° rotation showcase');

        let operation;
        try {
            console.log('🎬 Calling Google GenAI generateVideos with real image...');
            operation = await ai.models.generateVideos({
                model: "veo-3.1-generate-preview",
                prompt: videoPrompt,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                negativePrompt: videoNegativePrompt as any, // Tham số mới để tránh những thứ không mong muốn (SDK có thể chưa update type)
                image: {
                    imageBytes: imageBase64,
                    mimeType: mimeType,
                },
                config: {
                    durationSeconds: 6, // 6 giây (theo spec Veo 3.1: 4, 6, 8)
                    aspectRatio: "9:16", // Video dọc (vertical/portrait) - hỗ trợ 720p và 1080p
                    resolution: "720p", // 720p (mặc định). 1080p chỉ hỗ trợ thời lượng 8 giây
                    personGeneration: "allow_adult" // Cho phép generate người lớn (image-to-video) - chỉ hỗ trợ "allow_adult" cho image-to-video
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any // Type cast vì SDK có thể chưa update với latest API
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any); // Type cast toàn bộ object để hỗ trợ negativePrompt
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
