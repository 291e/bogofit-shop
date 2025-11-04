import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

        // Convert images to base64 (conditionally)
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

        // Build dynamic prompt based on available images
        let prompt = `TASK: Create a fashion image`;
        let imageIndex = 1;

        if (personImage && garmentImage) {
            // Both person and garment - virtual try-on
            prompt = `You are an expert AI for virtual clothing try-on. Your ONLY task is to digitally dress the person from IMAGE ${imageIndex} with the clothing from IMAGE ${imageIndex + 1}.

TASK: Virtual Try-On (like IDM-VTON)

SOURCE - IMAGE ${imageIndex} (THE PERSON):
This is the BASE image. You must preserve EVERYTHING from this image:
• Person's face - IDENTICAL (same facial features, skin tone, expression, hair, makeup)
• Person's body - IDENTICAL (same proportions, pose, stance, arms position, legs position)
• Person's hair - IDENTICAL (same hairstyle, color, length, style)
• Background - IDENTICAL (same environment, lighting, colors, shadows)
• Image framing - IDENTICAL (same camera angle, distance, composition)
• Image dimensions - Maintain 720×1080 pixels (9:16 vertical portrait)

GARMENT - IMAGE ${imageIndex + 1} (THE CLOTHING):
Extract ONLY the ${productTitle || 'clothing item'}:
• Copy: Design, pattern, color, fabric texture, style details
• Fit: Naturally onto the person's body from IMAGE ${imageIndex}
• Adapt: Wrinkles, shadows, and draping to match body shape and pose

OUTPUT SPECIFICATIONS:
Format: 720×1080 pixels (9:16 portrait - vertical orientation for mobile)
Quality: Photorealistic, high-resolution, professional fashion photography
Content: The EXACT SAME person from IMAGE ${imageIndex}, wearing the clothing from IMAGE ${imageIndex + 1}

CRITICAL RULES - MUST FOLLOW:
✓ DO: Keep person's identity 100% identical
✓ DO: Keep background 100% identical
✓ DO: Keep pose and position 100% identical
✓ DO: Show full body from head to feet
✓ DO: Apply clothing naturally with realistic fit
✓ DO: Maintain 720×1080 vertical format

✗ DON'T: Change or modify the person's face
✗ DON'T: Change or modify the person's body shape
✗ DON'T: Change or modify the background
✗ DON'T: Crop or cut off body parts
✗ DON'T: Change camera angle or distance
✗ DON'T: Use horizontal format

RESULT: A perfect virtual try-on where ONLY the clothing has changed. The person should look exactly as they do in IMAGE ${imageIndex}, just wearing different clothes.`;
            imageIndex = 3;
        } else if (personImage) {
            // Only person - enhance or add accessories
            prompt = `Create a professional fashion photo based on this person in image ${imageIndex}. Keep their face, body, pose, and background EXACTLY the same. High quality fashion photography.`;
            imageIndex = 2;
        } else if (garmentImage) {
            // Only garment - create fashion image
            prompt = `Create a professional product photo for this ${productTitle || 'clothing item'} from image ${imageIndex}. Show it in a professional fashion photography style.`;
            imageIndex = 2;
        }

        // Add item if provided
        if (itemImage) {
            prompt += `
5. Add the item from image ${imageIndex} - the person should be naturally holding/wearing this accessory item (bag, hat, etc.) while maintaining their exact same appearance (DO NOT change the person's face or body)`;
        }

        prompt += `

OUTPUT: A photorealistic image where the person looks EXACTLY like in image 1 (same face, same hair, same pose, same background), but wearing the clothing from image 2${itemImage ? ' with the accessory item' : ''}. The result should look like a professional product photo where only the outfit has been changed.`;

        // Build content parts dynamically
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contentParts: any[] = [{ text: prompt }];

        // Add main images
        if (personImage && personBase64) {
            contentParts.push({
                inlineData: {
                    mimeType: personMimeType,
                    data: personBase64,
                },
            });
        }

        if (garmentImage && garmentBase64) {
            contentParts.push({
                inlineData: {
                    mimeType: garmentMimeType,
                    data: garmentBase64,
                },
            });
        }

        // Add item image if provided
        if (itemImage && itemBase64) {
            contentParts.push({
                inlineData: {
                    mimeType: itemMimeType,
                    data: itemBase64,
                },
            });
        }

        // Generate image with Gemini (using image generation model)
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: [
                {
                    parts: contentParts,
                },
            ],
            generationConfig: {
                temperature: 0.3, // Lower temperature for more consistent results
                topP: 0.8,
                topK: 20,
                candidateCount: 1,
                // Hint for maintaining aspect ratio and full body
                responseMimeType: "image/png",
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        // Extract generated image
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

