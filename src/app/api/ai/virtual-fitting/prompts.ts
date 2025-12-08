/**
 * AI Virtual Fitting Prompts Configuration
 * Centralized prompt templates for different solution types
 */

export interface PromptConfig {
    /**
     * Dresses person with garment AND optional item while preserving identity
     */
    virtualTryOn: (params: {
        imageIndex: number;
        productTitle?: string;
        itemTitle?: string; // New: Title for the accessory/item
        imageDimensions: string;
        hasItem: boolean; // New: Flag to include accessory instructions
    }) => string;

    personOnly: (params: { imageIndex: number; imageDimensions: string }) => string;

    garmentOnly: (params: { imageIndex: number; productTitle?: string; imageDimensions: string }) => string;

    /**
     * Consolidated final instructions, less redundant
     */
    finalOutputInstructions: (params: { imageDimensions: string }) => string;
}

export const PROMPTS: PromptConfig = {
    /**
     * Virtual Try-On Prompt (Enhanced for Accessories)
     */
    virtualTryOn: ({ imageIndex, productTitle, itemTitle, hasItem }) => {
        // IMAGE INDEXING: Person=Image 1, Garment=Image 2, Item=Image 3 (if exists)
        const garmentImageIndex = imageIndex + 1;
        const itemImageIndex = hasItem ? imageIndex + 2 : null;

        const accessoryInstructions = hasItem ? `
ACCESSORY - IMAGE ${itemImageIndex} (THE ITEM):
Extract ONLY the ${itemTitle || 'accessory item'}.
• Placement: Place the accessory item naturally onto the person (e.g., a bag in hand, a hat on the head, or jewelry on the body).
• Integration: Must look physically present and interact realistically with the person and clothing.
` : '';

        return `You are an expert AI for virtual clothing try-on and product integration. Your ONLY task is to create a photorealistic fashion photo by combining elements from the source images.
TASK: Virtual Try-On with Optional Accessory Integration,
SOURCE - IMAGE ${imageIndex} (THE PERSON):
This is the BASE image. You must preserve EVERYTHING from this image:
• Person's face, identity, hair, and expression - **IDENTICAL**.
• Person's body, proportions, pose, stance, and arms position - **IDENTICAL**.
• Background, lighting, colors, and shadows - **IDENTICAL**.

GARMENT - IMAGE ${garmentImageIndex} (THE CLOTHING):
Extract ONLY the ${productTitle || 'clothing item'}:
• Copy: Design, pattern, color, fabric texture, and style details.
• Fit: Naturally onto the person's body from IMAGE ${imageIndex}.
• Adapt: Wrinkles, shadows, and draping must match the person's body shape and pose realistically.

${accessoryInstructions}

CRITICAL RULES - MUST FOLLOW:
✓ DO: Keep person's identity, pose, and background **100% identical**.
✓ DO: Apply clothing and accessory naturally with realistic fit and interaction.
✓ DO: Show the full body from head to feet (as much as the original image allows).
✓ DO: Preserve the original image orientation and aspect ratio.

✗ DON'T: Change or modify the person's face or body shape.
✗ DON'T: Change or modify the background or camera angle.
✗ DON'T: Crop or cut off body parts unintentionally.
✗ DON'T: Change image dimensions or aspect ratio.

RESULT: A professional virtual try-on image where the person from IMAGE ${imageIndex} is wearing the clothing from IMAGE ${garmentImageIndex}${hasItem ? ` and seamlessly integrated with the accessory from IMAGE ${itemImageIndex}` : ''}.
The final image MUST be photorealistic and high-resolution.`;
    },

    /**
     * Person Only Prompt
     */
    personOnly: ({ imageIndex }) => `Create a professional fashion photo based on the person in image ${imageIndex}.
• IDENTITY: Keep their face, body, pose, and background **EXACTLY** the same.
• ENHANCEMENT: Lightly enhance the image quality and professional aesthetic.
• OUTPUT: The final image must be high-quality fashion photography.`,

    /**
     * Garment Only Prompt
     */
    garmentOnly: ({ imageIndex, productTitle }) => `Create a stunning, photorealistic product photo for this ${productTitle || 'clothing item'} from image ${imageIndex}.
• PRESENTATION: Show the item clearly and attractively, highlighting its design, fabric, and color.
• STYLE: Professional e-commerce or fashion catalogue style (e.g., flat lay, ghost mannequin, or realistic display model).
• OUTPUT: The final image must be high-resolution and suitable for commercial use.`,

    /**
     * Final Output Specifications (Applies to all)
     */
    finalOutputInstructions: ({ imageDimensions }) => `

OUTPUT SPECIFICATIONS (MUST FOLLOW):
Format: ${imageDimensions} (EXACT same dimensions as the original image)
Aspect Ratio: EXACTLY match the original image
Quality: Photorealistic, high-resolution, professional fashion photography
Final output image MUST be ${imageDimensions} (EXACT same dimensions as original).`,
};

/**
 * Build prompt based on solution type and available inputs
 */
export function buildPrompt(params: {
    personImage: boolean;
    garmentImage: boolean;
    itemImage: boolean;
    productTitle: string | null;
    imageDimensions: string;
}): string {
    const { personImage, garmentImage, itemImage, productTitle, imageDimensions } = params;
    let prompt = '';
    const imageIndex = 1; // Start index for the person image

    // 1. Handle Virtual Try-On (Person + Garment + Optional Item)
    if (personImage && garmentImage) {
        prompt = PROMPTS.virtualTryOn({
            imageIndex: 1,
            productTitle: productTitle || undefined,
            imageDimensions,
            hasItem: itemImage // Use itemImage flag
        });

        // 2. Handle Person Only (Enhance/Stylize Person)
    } else if (personImage) {
        prompt = PROMPTS.personOnly({ imageIndex, imageDimensions });

        // 3. Handle Garment Only (Product Photo)
    } else if (garmentImage) {
        prompt = PROMPTS.garmentOnly({ imageIndex, productTitle: productTitle || undefined, imageDimensions });

        // 4. Default/Fallback (If only an item is provided, treat it like a garment)
    } else if (itemImage) {
        prompt = PROMPTS.garmentOnly({
            imageIndex,
            productTitle: productTitle || 'item',
            imageDimensions
        });
    } else {
        // Should not happen in a working system
        return `Error: No valid images provided for processing. Dimensions: ${imageDimensions}.`;
    }

    // Add final output instructions (now common for all)
    prompt += PROMPTS.finalOutputInstructions({ imageDimensions });

    return prompt;
}