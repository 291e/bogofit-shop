import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ""
});

export interface GenerateImageRequest {
  baseImage: string; // Base64 encoded image
  prompt: string;
  productName?: string;
  aspectRatio?: string; // Optional aspect ratio for image generation
}

export interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Generate AI image based on uploaded product image
 */
export async function generateProductImage({
  baseImage,
  prompt,
  productName,
  aspectRatio
}: GenerateImageRequest): Promise<GenerateImageResponse> {
  try {
    console.log('🔧 Gemini Service: Starting image generation');

    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ Gemini Service: No API key');
      return {
        success: false,
        error: "Gemini API key not configured"
      };
    }

    console.log('✅ Gemini Service: API key found');
    console.log('📐 Requested aspect ratio:', aspectRatio || 'none (default square)');

    // Create enhanced prompt based on image type
    let enhancedPrompt = "";

    // Define specific prompts for each image type
    // Define specific prompts for each image type
    const prompts = {
      hero: `Design a high-impact "Hero" image for a Korean e-commerce product detail page.
        - **Content:** Showcase the product attractively with the product name "${productName || 'Product Name'}" in elegant Korean typography.
        - **Text Rule:** ONLY the product name should be visible. DO NOT add any other badges or promotional text. ALL visible text MUST be in Korean (Hangul).
        - **Style:** Minimalist, premium, clean background.
        - **Goal:** Catch the customer's eye immediately.
        - **Important:** Keep the product looking EXACTLY identical to the uploaded image.`,

      features: `Design a "Product Features" section image for a Korean e-commerce detail page.
        - **Content:** Show the product from 3 different angles (e.g., front, side, and back, or key detailed close-ups) in a clean split-view or collage layout.
        - **Text Rule:** DO NOT add any text or labels to the image.
        - **Style:** Clean, professional product photography, focus on multiple perspectives.
        - **Goal:** Show the product's design from all important sides.
        - **Important:** Keep the product in all angles looking EXACTLY identical to the uploaded image.`,

      lifestyle: `Design a "Lifestyle" image for a Korean e-commerce detail page.
        - **Content:** Show the product in a realistic, aspirational context (e.g., worn by a model or in a suitable environment).
        - **Text Rule:** DO NOT add any text (names, prices, or labels) to the image.
        - **Style:** Atmospheric, natural lighting, "Instagrammable".
        - **Goal:** Help customers visualize using the product.
        - **Important:** Keep the product looking EXACTLY identical to the uploaded image.`,

      info: `Design a "Product Info & Size" section image for a Korean e-commerce detail page.
        - **Content:** Display a clean, structured Size Chart and Product Specifications table. 
        - **Image Rule:** DO NOT include the actual product photo in this graphic. Focus ONLY on the graphical layout of the information.
        - **Details to Include:** ${prompt}
        - **Text Rule:** ALL visible text MUST be in Korean (Hangul). Translate any English labels to Korean (e.g., Size -> 사이즈, Color -> 색상).
        - **Style:** Professional, easy to read, minimal grid layout, infographic style.
        - **Goal:** Provide clear technical information without visual distractions.`
    };

    if (aspectRatio && ['hero', 'features', 'lifestyle', 'info'].includes(aspectRatio)) {
      // If aspectRatio is actually passing the image type (a bit of a hack to reuse the interface, but works)
      const type = aspectRatio as keyof typeof prompts;
      enhancedPrompt = prompts[type];
    } else if (aspectRatio) {
      // Standard aspect ratio provided
      enhancedPrompt = prompt;
    } else {
      // Default behavior
      enhancedPrompt = productName
        ? `IMPORTANT: Use the EXACT product from the uploaded image - DO NOT create a different product. The product must appear IDENTICAL to the uploaded image (same design, colors, style, details). Based on this product image, create a professional product photo for "${productName}". ${prompt}. Maintain the same composition, angle, and framing as the original. Make it suitable for e-commerce with clean background, professional lighting, and high quality.`
        : `IMPORTANT: Use the EXACT product from the uploaded image - DO NOT create a different product. The product must appear IDENTICAL to the uploaded image (same design, colors, style, details). Based on this product image, create a professional product photo. ${prompt}. Maintain the same composition, angle, and framing as the original. Make it suitable for e-commerce with clean background, professional lighting, and high quality.`;
    }

    // Clean base64 data (remove data URL prefix if present)
    let cleanBase64 = baseImage;
    if (baseImage.startsWith('data:')) {
      const base64Match = baseImage.match(/base64,(.+)$/);
      if (base64Match) {
        cleanBase64 = base64Match[1];
      }
    }

    // Detect mime type from base64 data URL
    let mimeType = "image/png";
    if (baseImage.startsWith('data:image/jpeg') || baseImage.startsWith('data:image/jpg')) {
      mimeType = "image/jpeg";
    } else if (baseImage.startsWith('data:image/png')) {
      mimeType = "image/png";
    } else if (baseImage.startsWith('data:image/webp')) {
      mimeType = "image/webp";
    }

    // Build prompt array according to Google GenAI API format
    const promptArray = [
      { text: enhancedPrompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generateConfig: any = {
      candidateCount: 1,
      responseModalities: ["TEXT", "IMAGE"],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestParams: any = {
      model: "gemini-3-pro-image-preview",
      contents: promptArray,
      generationConfig: generateConfig,
    };

    // Add aspect ratio config if provided
    if (aspectRatio) {
      // If it's one of our custom types, default to 9:16 (vertical)
      const ratio = ['hero', 'features', 'lifestyle', 'info'].includes(aspectRatio) ? '9:16' : aspectRatio;

      requestParams.config = {
        imageConfig: {
          aspectRatio: ratio,
        },
      };
      console.log('📐 Using aspect ratio config:', ratio);
    }

    console.log('🎨 Generating image with aspect ratio:', aspectRatio || 'default');
    const response = await ai.models.generateContent(requestParams);
    console.log('✅ Image generation response received');

    // Process response
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const imageData = part.inlineData.data;

          // Convert to data URL for immediate use
          const dataUrl = `data:image/png;base64,${imageData}`;

          return {
            success: true,
            imageUrl: dataUrl
          };
        }
      }
    }

    return {
      success: false,
      error: "No image generated from AI response"
    };

  } catch (error) {
    console.error("Gemini AI Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Generate multiple variations of product image
 */
export async function generateProductImageVariations({
  baseImage,
  productName
}: Omit<GenerateImageRequest, 'prompt'>): Promise<GenerateImageResponse[]> {
  const variations = [
    "Create a clean white background version",
    "Create a lifestyle scene with the product in use",
    "Create a minimalist studio shot",
    "Create a social media ready square format"
  ];

  const results: GenerateImageResponse[] = [];

  for (const prompt of variations) {
    const result = await generateProductImage({
      baseImage,
      prompt,
      productName
    });
    results.push(result);
  }

  return results;
}
