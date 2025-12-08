import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface VideoRequestParams {
    model: string;
    prompt: string;
    config: {
        durationSeconds: number;
        aspectRatio: string;
        resolution: string;
        personGeneration: string;
    };
    image?: {
        imageBytes: string;
        mimeType: string;
    };
    negativePrompt?: string;
}

// Kết quả operation tối thiểu mà ta cần dùng


// Initialize Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

/**
 * POST /api/ai/generate-video
 * Generate video using Google Gemini Veo 3.1
 *
 * Request body:
 * - prompt: string (required) - Video generation prompt
 * - imageUrl?: string (optional) - Base image for image-to-video
 * - negativePrompt?: string (optional) - What to avoid in video
 * - config?: object (optional) - Video configuration (duration, aspect ratio, resolution)
 */
export async function POST(request: NextRequest) {
    try {
        const { prompt, imageUrl, negativePrompt, config } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { success: false, message: "Prompt is required" },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            console.log("⚠️ GEMINI_API_KEY not configured");
            return NextResponse.json(
                { success: false, message: "API key not configured" },
                { status: 500 }
            );
        }

        console.log("🎬 Generating video with Veo 3.1...");

        // Build request parameters following Google's Veo 3.1 pattern
        const requestParams: VideoRequestParams = {
            model: "veo-3.1-generate-preview",
            prompt,
            config: {
                durationSeconds: config?.durationSeconds || 6,
                aspectRatio: config?.aspectRatio || "9:16",
                resolution: config?.resolution || "720p",
                personGeneration: config?.personGeneration || "allow_adult",
            },
        };

        // Add image if provided (for image-to-video)
        if (imageUrl) {
            // Handle data URL (base64 encoded image)
            if (imageUrl.startsWith("data:")) {
                const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
                if (matches) {
                    requestParams.image = {
                        imageBytes: matches[2],
                        mimeType: matches[1],
                    };
                }
            } else {
                // For regular URLs, download and convert to base64
                const imageResponse = await fetch(imageUrl);
                const imageBuffer = await imageResponse.arrayBuffer();
                requestParams.image = {
                    imageBytes: Buffer.from(imageBuffer).toString("base64"),
                    mimeType:
                        imageResponse.headers.get("content-type") || "image/png",
                };
            }
        }

        // Add negative prompt if provided
        if (negativePrompt) {
            requestParams.negativePrompt = negativePrompt;
        }

        // Log request params for debugging (without full imageBytes to avoid spam)
        console.log("📤 Request params:", {
            model: requestParams.model,
            prompt: requestParams.prompt,
            config: requestParams.config,
            hasImage: !!requestParams.image,
            imageSize: requestParams.image
                ? `${requestParams.image.imageBytes.length} bytes`
                : "N/A",
            mimeType: requestParams.image?.mimeType,
            hasNegativePrompt: !!requestParams.negativePrompt,
        });

        // Validate image size (Gemini has limits)
        if (requestParams.image) {
            const imageSizeInMB =
                requestParams.image.imageBytes.length / (1024 * 1024);
            console.log(`📏 Image size: ${imageSizeInMB.toFixed(2)} MB`);

            if (imageSizeInMB > 20) {
                throw new Error(
                    `Image too large: ${imageSizeInMB.toFixed(
                        2
                    )} MB. Maximum allowed is 20 MB.`
                );
            }
        }

        // Generate video with retry logic
        const operation = await ai.models.generateVideos(requestParams);
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                console.log(
                    `🎬 Attempt ${retryCount + 1}/${maxRetries} to generate video...`
                );

                // Poll đến khi xong
                while (!operation.done) {
                    await new Promise((resolve) => setTimeout(resolve, 10_000));
                }

                // Check for errors in the operation
                if (operation.error) {
                    const errorMessage =
                        operation.error.message ||
                        JSON.stringify(operation.error) ||
                        "Unknown error occurred";
                    console.error("❌ Operation error:", operation.error);
                    throw new Error(`Video generation failed: ${errorMessage}`);
                }

                // Nếu thành công thì thoát vòng lặp
                break;
            } catch (err) {
                console.error(
                    `❌ Attempt ${retryCount + 1} failed:`,
                    err
                );
                retryCount++;
                if (retryCount === maxRetries) {
                    throw err; // Re-throw last error if all retries fail
                }
                // Exponential backoff: 2s, 4s, 8s
                await new Promise((resolve) =>
                    setTimeout(resolve, 2000 * Math.pow(2, retryCount - 1))
                );
            }
        }

        // Ensure operation is defined
        if (!operation) {
            throw new Error("Video generation failed: operation is undefined");
        }

        const videoUrl =
            operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!videoUrl) {
            throw new Error("No video URL returned");
        }

        // Return proxy URL for client-side access
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            (process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : "http://localhost:3000");

        const proxyVideoUrl = `${baseUrl}/api/ai/video-proxy?url=${encodeURIComponent(
            videoUrl
        )}`;

        return NextResponse.json({
            success: true,
            data: {
                videoUrl: proxyVideoUrl,
                originalUrl: videoUrl,
                prompt,
                operationName: operation.name,
                duration: `${config?.durationSeconds || 6}초`,
                aspectRatio: config?.aspectRatio || "9:16",
                resolution: config?.resolution || "720p",
            },
        });
    } catch (error) {
        console.error("Video Generation Error:", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            },
            { status: 500 }
        );
    }
}
