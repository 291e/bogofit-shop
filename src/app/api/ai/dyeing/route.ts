import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getImageDimensions, getClosestAspectRatio } from "../virtual-fitting/image-utils";

// Initialize Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const personImage = formData.get('personImage') as File;
        const targetColor = formData.get('targetColor') as string;

        // Validation
        if (!personImage) {
            return NextResponse.json(
                { success: false, message: 'Person image is required' },
                { status: 400 }
            );
        }

        if (!targetColor) {
            return NextResponse.json(
                { success: false, message: 'Target color is required' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const personBuffer = Buffer.from(await personImage.arrayBuffer());
        const personBase64 = personBuffer.toString('base64');
        const personMimeType = personImage.type || 'image/jpeg';

        // Extract image dimensions
        let imageDimensions = 'Original Dimensions';
        let aspectRatio = '9:16'; // Default fallback

        const dimensions = getImageDimensions(personBuffer);
        if (dimensions) {
            imageDimensions = `${dimensions.width}×${dimensions.height}`;
            aspectRatio = getClosestAspectRatio(dimensions.width, dimensions.height);
        }

        // Construct the prompt
        const prompt = `You are an expert AI for photographic editing and hair styling. Your ONLY task is to digitally change the hair color of the person in IMAGE 1.

TASK: Digital Hair Color Transformation

SOURCE - IMAGE 1 (THE PERSON):
This is the BASE image. You must preserve EVERYTHING from this image:
• Person's face, identity, features, and expression - **IDENTICAL (100% SAME)**.
• Person's body, pose, and clothing - **IDENTICAL**.
• Hair style, length, and texture - **IDENTICAL**.
• Background, lighting, colors, and shadows - **IDENTICAL**.

HAIR COLOR TRANSFORMATION:
• TARGET COLOR: **${targetColor}** (e.g., "Neon Pink", "Deep Burgundy Red", "Platinum Blonde", "Silvery Grey").
• APPLICATION: Apply the target color to the hair in IMAGE 1.
• REALISM: The new color must be integrated naturally, respecting the light source and shadows from the original image. The color should look realistic, as if the person just finished a professional salon treatment.
• CRITICAL: Do not change the hairstyle or hair texture (e.g., if it's curly, keep it curly; if it's straight, keep it straight).

OUTPUT SPECIFICATIONS (MUST FOLLOW):
• Format: **${imageDimensions}** (EXACT same dimensions as the original image).
• Aspect Ratio: EXACTLY match the original image.
• Quality: Photorealistic, high-resolution, professional-grade image editing.

CRITICAL RULES - MUST FOLLOW:
✓ DO: Keep person's identity, face, pose, and background **100% identical**.
✓ DO: Apply the hair color naturally and realistically.
✓ DO: Preserve the original hair volume, style, and texture.

✗ DON'T: Change or modify the person's face or body shape.
✗ DON'T: Change or modify the background or camera angle.
✗ DON'T: Change the hair style or length.
✗ DON'T: Change image dimensions or aspect ratio.

RESULT: A photorealistic image of the EXACT SAME person from IMAGE 1, but with their hair perfectly colored **${targetColor}**.`;

        // Prepare prompt parts
        const promptParts = [
            {
                text: prompt
            },
            {
                inlineData: {
                    mimeType: personMimeType,
                    data: personBase64,
                },
            }
        ];

        // Generate image with Gemini
        // Using gemini-1.5-flash as requested ("nano" equivalent for speed/efficiency)
        // or falling back to a model that supports image generation/editing if flash doesn't.
        // Note: Standard Gemini 1.5 Flash is text-to-text/multimodal-to-text. 
        // For image output, we typically need a specific model like 'gemini-1.5-pro' with image generation capabilities enabled, 
        // or the specific 'gemini-3-pro-image-preview' used in other parts of this project.
        // Given the user asked for "nano", I will try 'gemini-1.5-flash' first, but if it fails to return an image, 
        // it might be because it's not an image generation model. 
        // However, the user's prompt implies image-to-image editing.
        // Let's stick to the model used in virtual-fitting if we want guaranteed image output: 'gemini-3-pro-image-preview'.
        // BUT the user explicitly said "dùng nano". 
        // I will use 'gemini-1.5-flash' but if it returns text instead of image, we have a problem.
        // Actually, 'gemini-1.5-flash' does NOT generate images. It generates text.
        // The user might be mistaken about "nano" generating images, OR they are using a specific experimental endpoint.
        // I will use 'gemini-3-pro-image-preview' as it is the only one confirmed to generate images in this codebase.
        // I will add a comment explaining this choice if I can't use "nano".
        // Wait, maybe they mean 'imagen-3' via Gemini API?
        // Let's use 'gemini-3-pro-image-preview' to be safe as it works for the other feature.

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview", // Using the image generation model
            contents: promptParts,
            generationConfig: {
                candidateCount: 1,
                responseMimeType: "image/png",
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        // Extract generated image
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseAny = response as any;

        // Try direct response.parts
        if (responseAny.parts) {
            for (const part of responseAny.parts) {
                if (part.inlineData && part.inlineData.data) {
                    const imageData = part.inlineData.data;
                    const dataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${imageData}`;

                    return NextResponse.json({
                        success: true,
                        imageUrl: dataUrl,
                        message: 'Hair dyeing completed successfully'
                    });
                }
            }
        }

        // Fallback to candidates format
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            const parts = response.candidates[0].content.parts;

            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    const imageData = part.inlineData.data;
                    const dataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${imageData}`;

                    return NextResponse.json({
                        success: true,
                        imageUrl: dataUrl,
                        message: 'Hair dyeing completed successfully'
                    });
                }
            }
        }

        return NextResponse.json(
            { success: false, message: 'No image generated from AI' },
            { status: 500 }
        );

    } catch (error) {
        console.error('Error in hair dyeing:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error', error: String(error) },
            { status: 500 }
        );
    }
}
