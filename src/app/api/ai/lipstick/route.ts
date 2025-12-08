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
        const lipstickColor = formData.get('lipstickColor') as string;

        // Validation
        if (!personImage) {
            return NextResponse.json(
                { success: false, message: 'Person image is required' },
                { status: 400 }
            );
        }

        if (!lipstickColor) {
            return NextResponse.json(
                { success: false, message: 'Lipstick color is required' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const imageBuffer = Buffer.from(await personImage.arrayBuffer());
        const imageBase64 = imageBuffer.toString('base64');
        const imageMimeType = personImage.type || 'image/jpeg';

        // Extract image dimensions
        let imageDimensions = 'Original Dimensions';
        let aspectRatio = '9:16'; // Default fallback

        const dimensions = getImageDimensions(imageBuffer);
        if (dimensions) {
            imageDimensions = `${dimensions.width}×${dimensions.height}`;
            aspectRatio = getClosestAspectRatio(dimensions.width, dimensions.height);
        }

        // Construct the prompt for lipstick application
        const prompt = `You are an expert AI for virtual makeup application, specifically for applying lipstick. Your task is to apply lipstick color to the person's lips in IMAGE 1 while maintaining absolute realism and preserving their identity.

TASK: Virtual Lipstick Application

SOURCE - IMAGE 1 (THE PERSON):
This is the person whose lips will receive the lipstick color.

TARGET LIPSTICK COLOR: ${lipstickColor}

APPLICATION INSTRUCTIONS:
• Focus: Apply the lipstick color ONLY to the lips of the person in IMAGE 1.
• Precision: The lipstick should follow the natural lip line precisely, without bleeding or extending beyond the lips.
• Realism: The lipstick should look natural and realistic, with appropriate shine, texture, and depth.
• Lip Enhancement: Maintain the natural shape and volume of the lips. Do not alter lip size or shape.
• Color Accuracy: The lipstick color should match the specified hex color ${lipstickColor} as closely as possible.
• Lighting: Respect the existing lighting in the image. The lipstick should have appropriate highlights and shadows based on the light source.

PRESERVATION REQUIREMENTS (CRITICAL):
• Face: Keep the person's face, features, skin tone, and expression **100% IDENTICAL**.
• Identity: The person's unique identity/likeness **MUST BE IDENTICAL**.
• Background: Keep the background, pose, clothing, and all other elements **IDENTICAL**.
• Hair & Makeup: Preserve existing hair, eye makeup, and other facial features exactly as they are.

OUTPUT SPECIFICATIONS (MUST FOLLOW):
• Format: **${imageDimensions}** (EXACT same dimensions as the original IMAGE 1).
• Quality: Photorealistic, high-resolution, professional makeup application quality.

***ABSOLUTE MANDATORY RULES - IF VIOLATED, THE RESULT IS INVALID:***
✓ **DO:** Apply lipstick color ${lipstickColor} to the lips ONLY.
✓ **DO:** Maintain 100% identical face, identity, and all other features.
✓ **DO:** Ensure the lipstick looks natural and realistic.
✓ **DO:** Follow the natural lip line precisely.

✗ **DON'T:** Change the person's face, identity, or any features other than lip color.
✗ **DON'T:** Alter lip shape or size.
✗ **DON'T:** Apply makeup to any area other than the lips.
✗ **DON'T:** Change lighting, background, or image dimensions.

RESULT: A professional-quality image showing the person with beautifully applied lipstick in the specified color, while maintaining their complete identity and natural appearance.`;

        // Prepare prompt parts
        const promptParts = [
            {
                text: prompt
            },
            {
                inlineData: {
                    mimeType: imageMimeType,
                    data: imageBase64,
                },
            }
        ];

        // Generate image with Gemini
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
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
                        message: 'Lipstick application completed successfully'
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
                        message: 'Lipstick application completed successfully'
                    });
                }
            }
        }

        return NextResponse.json(
            { success: false, message: 'No image generated from AI' },
            { status: 500 }
        );

    } catch (error) {
        console.error('Error in lipstick application:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error', error: String(error) },
            { status: 500 }
        );
    }
}
