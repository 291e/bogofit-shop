import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ""
});

export interface GenerateImageRequest {
  baseImage: string; // Base64 encoded image
  prompt: string;
  productName?: string;
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
  productName
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

    // Create enhanced prompt with product context
    const enhancedPrompt = productName 
      ? `Based on this product image, create a professional product photo for "${productName}". ${prompt}. Maintain the same composition, angle, and framing as the original. Make it suitable for e-commerce with clean background, professional lighting, and high quality. Output as 512x512 square format.`
      : `Based on this product image, create a professional product photo. ${prompt}. Maintain the same composition, angle, and framing as the original. Make it suitable for e-commerce with clean background, professional lighting, and high quality. Output as 512x512 square format.`;

    const requestPrompt = [
      { text: enhancedPrompt },
      {
        inlineData: {
          mimeType: "image/png",
          data: baseImage,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: requestPrompt,
    });

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
