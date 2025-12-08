import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "./prompts";
import { getImageDimensions, getClosestAspectRatio } from "./image-utils";

// Initialize Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

/**
 * POST /api/ai/virtual-fitting
 * Generate virtual try-on image using Gemini AI with accessories
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const personImage = formData.get('personImage') as File;
        const garmentImage = formData.get('garmentImage') as File;
        const itemImage = formData.get('itemImage') as File | null;
        const productTitle = formData.get('productTitle') as string;
        // Validation - At least one image is required
        if (!personImage && !garmentImage && !itemImage) {
            return NextResponse.json(
                { success: false, message: 'At least one image is required' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { success: false, message: 'AI service not configured' },
                { status: 500 }
            );
        }

        // Convert images to base64
        let personBase64 = '';
        let personMimeType = '';
        let garmentBase64 = '';
        let garmentMimeType = '';

        if (personImage) {
            const personBuffer = await personImage.arrayBuffer();
            personBase64 = Buffer.from(personBuffer).toString('base64');
            personMimeType = personImage.type || 'image/jpeg';
        }

        if (garmentImage) {
            const garmentBuffer = await garmentImage.arrayBuffer();
            garmentBase64 = Buffer.from(garmentBuffer).toString('base64');
            garmentMimeType = garmentImage.type || 'image/jpeg';
        }

        // Convert item image to base64 if provided
        let itemBase64 = '';
        let itemMimeType = '';

        if (itemImage) {
            const itemBuffer = await itemImage.arrayBuffer();
            itemBase64 = Buffer.from(itemBuffer).toString('base64');
            itemMimeType = itemImage.type || 'image/jpeg';
        }

        // Extract image dimensions from the primary image (person image if available, otherwise garment)
        let imageDimensions = '768×1344'; // Default fallback
        let aspectRatio = '9:16'; // Default fallback

        const primaryBuffer = personImage
            ? Buffer.from(await personImage.arrayBuffer())
            : garmentImage
                ? Buffer.from(await garmentImage.arrayBuffer())
                : itemImage
                    ? Buffer.from(await itemImage.arrayBuffer())
                    : null;

        if (primaryBuffer) {
            const dimensions = getImageDimensions(primaryBuffer);
            if (dimensions) {
                imageDimensions = `${dimensions.width}×${dimensions.height}`;
                aspectRatio = getClosestAspectRatio(dimensions.width, dimensions.height);
            }
        }

        // Build dynamic prompt based on available images using centralized prompts
        const prompt = buildPrompt({
            personImage: !!personImage,
            garmentImage: !!garmentImage,
            itemImage: !!itemImage,
            productTitle,
            imageDimensions,
        });

        // Build content parts dynamically - format similar to example
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const promptParts: any[] = [];

        // Add images first (as in example)
        if (personImage && personBase64) {
            promptParts.push({
                inlineData: {
                    mimeType: personMimeType,
                    data: personBase64,
                },
            });
        }

        if (garmentImage && garmentBase64) {
            promptParts.push({
                inlineData: {
                    mimeType: garmentMimeType,
                    data: garmentBase64,
                },
            });
        }

        // Add item image if provided
        if (itemImage && itemBase64) {
            promptParts.push({
                inlineData: {
                    mimeType: itemMimeType,
                    data: itemBase64,
                },
            });
        }

        // Add text prompt last (as in example)
        promptParts.push({ text: prompt });

        // Generate image with Gemini (using image generation model)
        // Format matches the example: contents is the array directly
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: promptParts,
            generationConfig: {
                candidateCount: 1,
                responseMimeType: "image/png",
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio, // Use dynamic aspect ratio from input image
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        // Extract generated image - try both formats for compatibility
        // First try direct response.parts (as in example) - using type assertion
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseAny = response as any;
        if (responseAny.parts) {
            for (const part of responseAny.parts) {
                if (part.inlineData && part.inlineData.data) {
                    const imageData = part.inlineData.data;
                    const dataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${imageData}`;

                    return NextResponse.json({
                        success: true,
                        imageUrl: dataUrl,
                        hasItem: !!itemImage,
                        message: 'Virtual fitting completed successfully'
                    });
                }
            }
        }

        // Fallback to candidates format (standard format)
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            const parts = response.candidates[0].content.parts;

            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    const imageData = part.inlineData.data;
                    const dataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${imageData}`;

                    return NextResponse.json({
                        success: true,
                        imageUrl: dataUrl,
                        hasItem: !!itemImage,
                        message: 'Virtual fitting completed successfully'
                    });
                }
            }
        }

        return NextResponse.json(
            { success: false, message: 'No image generated from AI' },
            { status: 500 }
        );

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error',
                error: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}

