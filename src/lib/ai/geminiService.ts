import { GoogleGenAI, Type } from "@google/genai";
import { PlatformType, GenderType } from "../../types/ai";

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ""
});

export interface GenerateImageRequest {
  baseImage: string; // Base64 encoded image
  prompt?: string;
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
    // Define specific prompts for each image type based on user request
    const prompts = {
      // 1. Hero Image (Beautiful representative shot)
      hero: `Create a stunning main product image for e-commerce.
        - **Content:** The garment looks perfectly ironed, voluminous (ghost mannequin style), and premium.
        - **Style:** High-end fashion commercial photography, clean white background.
        - **Rule:** ABSOLUTELY NO TEXT, NO LOGOS. Pure product image.`,

      // 2. 3-Angle View (Front/Back/Side)
      features: `Create a multi-view composition image with a specific layout ratio.
        - **Layout Structure:**
          1. **Top Section (Occupies 50% of vertical space):** Split equally (50%/50%). Left slot: Front view. Right slot: Back view.
          2. **Bottom Section (Occupies 50% of vertical space):** Split equally (50%/50%). Left slot: Side view. Right slot: Perspective view.
        - **Goal:** Strictly follow the 50% Top (Front/Back) and 50% Bottom (Side) proportion. 
        - **Style:** Clean white background, consistent lighting. NO TEXT.`,

      // 3. Details (Sleeve/Collar)
      detail: `Create a collage of key product details.
        - **Content:** Two distinct close-up shots: 1) The collar/neckline area. 2) The sleeve/cuff area.
        - **Focus:** Show fabric texture, stitching, and material quality.
        - **Style:** Macro photography, sharp focus, clean background. NO TEXT.`,

      // 4. Model Lifestyle (Wearing the product)
      lifestyle: `Create a fashion model lookbook shot featuring a Korean model, clean white background.
        - **Content:** A professional Korean model wearing this exact product. Fit should be natural and stylish.
        - **Setting:**Soft natural light.
        - **Rule:** NO TEXT on the image. Focus on the outfit.
        - **Subject:** Korean model wearing the product.`

    };

    if (aspectRatio && ['hero', 'features', 'detail', 'lifestyle'].includes(aspectRatio)) {
      const type = aspectRatio as keyof typeof prompts;
      enhancedPrompt = prompts[type];
    } else {
      // Fallback
      enhancedPrompt = prompt || prompts.hero;
    }

    // Clean base64 data (remove data URL prefix if present)
    let cleanBase64 = baseImage;
    let mimeType = "image/png";

    // ✅ Case 1: Image URL provided (e.g. S3 URL)
    if (baseImage.startsWith('http')) {
      console.log('🌐 Fetching image from URL:', baseImage);
      try {
        const imageRes = await fetch(baseImage);
        if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.statusText}`);

        const arrayBuffer = await imageRes.arrayBuffer();
        cleanBase64 = Buffer.from(arrayBuffer).toString('base64');

        const contentType = imageRes.headers.get('content-type');
        if (contentType) mimeType = contentType;
        console.log('✅ Image fetched and converted to Base64');
      } catch (fetchError) {
        console.error('❌ Error downloading image:', fetchError);
        return { success: false, error: 'Failed to download reference image' };
      }
    }
    // ✅ Case 2: Data URL provided
    else if (baseImage.startsWith('data:')) {
      const base64Match = baseImage.match(/base64,(.+)$/);
      if (base64Match) {
        cleanBase64 = base64Match[1];
      }

      // Detect mime type from base64 data URL
      if (baseImage.startsWith('data:image/jpeg') || baseImage.startsWith('data:image/jpg')) {
        mimeType = "image/jpeg";
      } else if (baseImage.startsWith('data:image/png')) {
        mimeType = "image/png";
      } else if (baseImage.startsWith('data:image/webp')) {
        mimeType = "image/webp";
      }
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
      config: generateConfig,
    };

    // Add aspect ratio config if provided
    if (aspectRatio) {
      // If it's one of our custom types, default to 9:16 (vertical)
      const ratio = ['hero', 'features', 'lifestyle', 'detail', 'info'].includes(aspectRatio) ? '9:16' : aspectRatio;

      // Note: Node SDK param structure might differ slightly, but assuming this follows previous working patterns or updated docs
      // If 'imageConfig' belongs in 'generationConfig':
      generateConfig.imageConfig = {
        aspectRatio: ratio
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

/**
 * Generate platform-specific high-end set (12 images + copy)
 */
export async function generatePlatformPage({
  prompt,
  baseImage,
  platform,
  gender
}: {
  prompt: string;
  baseImage: string;
  platform: PlatformType;
  gender: GenderType;
}) {
  const details = await generateCopy(prompt, platform, gender);
  const viewConfigs = getPlatformConfigs(platform, gender);

  const imagePromises = viewConfigs.map(async (config) => {
    // Clean base64 data
    let cleanBase64 = baseImage;
    let mimeType = "image/png";

    if (baseImage.startsWith('data:')) {
      const base64Match = baseImage.match(/base64,(.+)$/);
      if (base64Match) cleanBase64 = base64Match[1];
      const mimeMatch = baseImage.match(/:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
    } else if (baseImage.startsWith('http')) {
      const imageRes = await fetch(baseImage);
      const arrayBuffer = await imageRes.arrayBuffer();
      cleanBase64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = imageRes.headers.get('content-type');
      if (contentType) mimeType = contentType;
    }

    const promptText = `ACT AS A PROFESSIONAL FASHION PHOTOGRAPHER FOR ${platform}.
        TARGET: ${gender === 'MAN' ? 'Men' : 'Women'}.
        STRICT RULES:
        1. Keep EXACT face and body identity.
        2. Keep EXACT clothing details (fabric, color, fit).
        3. IF THE SCENE IS ACCESSORY: Focus on bags, shoes, or jewelry that perfectly match this outfit.
        SCENE: ${config.desc}.
        OUTPUT: Professional ${config.ratio} aspect ratio, high-fidelity.`;

    const requestParams: any = {
      model: "gemini-3-pro-image-preview",
      contents: [
        { text: promptText },
        { inlineData: { mimeType, data: cleanBase64 } }
      ],
      config: {
        candidateCount: 1,
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: config.ratio }
      }
    };

    const response = await ai.models.generateContent(requestParams);

    if (response.candidates && response.candidates[0]?.content?.parts) {
      const part = response.candidates[0].content.parts.find((p: any) => p.inlineData);
      return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : null;
    }
    return null;
  });

  const images = (await Promise.all(imagePromises)).filter((img): img is string => img !== null);
  return { images, details };
}

function getPlatformConfigs(platform: PlatformType, gender: GenderType) {
  const commonRatio = platform === 'ABLY' ? "9:16" : platform === 'MUSINSA' ? "3:4" : "1:1";
  return [
    { desc: "Main hero shot, full body, iconic pose", ratio: commonRatio },
    { desc: "Upper body close-up, natural expression", ratio: commonRatio },
    { desc: "Side profile showing the drape and fit", ratio: commonRatio },
    { desc: "Detail shot: Fabric texture and stitching close-up", ratio: "1:1" },
    { desc: "Walking motion, showing the garment in movement", ratio: commonRatio },
    { desc: "Accessory matching: Focus on a luxury bag that suits this look", ratio: "1:1" },
    { desc: "Footwear matching: Focus on shoes and pant-hem detail", ratio: "1:1" },
    { desc: "Back silhouette, clean composition", ratio: commonRatio },
    { desc: "Lifestyle shot: Sitting in a modern architectural space", ratio: commonRatio },
    { desc: "Emotional moody shot, soft lighting", ratio: commonRatio },
    { desc: "Close-up on buttons or unique design elements", ratio: "1:1" },
    { desc: "Final full look with all accessories visible", ratio: commonRatio }
  ];
}

async function generateCopy(prompt: string, platform: PlatformType, gender: GenderType) {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Product: ${prompt}. Platform: ${platform}. Gender: ${gender}. Write a high-end fashion detail page copy in Korean. Include Title, Intro, Fabric, Fit, and Matching Tips for bags/shoes.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          intro: { type: Type.STRING },
          fabric: { type: Type.STRING },
          fit: { type: Type.STRING },
          tip: { type: Type.STRING },
          accessory_matching: { type: Type.STRING }
        },
        required: ["title", "intro", "fabric", "fit", "tip", "accessory_matching"]
      }
    }
  });

  try {
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text || '{}');
  } catch (e) {
    console.error("Failed to parse copy JSON:", e);
    return {};
  }
}
