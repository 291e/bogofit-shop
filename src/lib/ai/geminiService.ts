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

    // Create enhanced prompt - don't force square format if aspectRatio is provided
    let enhancedPrompt = "";
    if (aspectRatio) {
      // If aspectRatio is provided, use the prompt as-is (should already contain format requirements)
      // But ensure we emphasize using the exact product from the uploaded image
      enhancedPrompt = productName
        ? `IMPORTANT: Use the EXACT product from the uploaded image - DO NOT create a different product. The product must appear IDENTICAL to the uploaded image (same design, colors, style, details). Based on this product image, create a professional product detail image for "${productName}". ${prompt}`
        : `IMPORTANT: Use the EXACT product from the uploaded image - DO NOT create a different product. The product must appear IDENTICAL to the uploaded image (same design, colors, style, details). ${prompt}`;
    } else {
      // Default behavior: square format for regular product images
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

    const requestPrompt = [
      {
        parts: [
          { text: enhancedPrompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generateConfig: any = {
      candidateCount: 1,
      responseMimeType: "image/png",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = {};

    // Add aspect ratio config if provided
    if (aspectRatio) {
      config.imageConfig = {
        aspectRatio: aspectRatio,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestParams: any = {
      model: "gemini-2.5-flash-image",
      contents: requestPrompt,
      generationConfig: generateConfig,
    };

    // Add config with imageConfig if aspectRatio is provided
    if (aspectRatio && Object.keys(config).length > 0) {
      requestParams.config = config;
      console.log('📐 Using aspect ratio config:', config);
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
