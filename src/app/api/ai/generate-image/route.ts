import { NextRequest, NextResponse } from 'next/server';
import { generateProductImage, generateProductImageVariations } from '@/lib/ai/geminiService';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Generate Image API called');

    const body = await request.json();
    const { baseImage, prompt, productName, generateVariations = false, generateSet = false, generateRest = false, aspectRatio } = body;

    console.log('📝 Request data:', {
      hasBaseImage: !!baseImage,
      prompt: prompt?.substring(0, 50) + '...',
      productName,
      generateVariations,
      generateSet,
      generateRest
    });

    if (!baseImage) {
      console.log('❌ No base image provided');
      return NextResponse.json(
        { success: false, message: 'Base image is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ GEMINI_API_KEY not configured');
      return NextResponse.json(
        { success: false, message: 'AI service not configured' },
        { status: 500 }
      );
    }

    console.log('✅ API key found, proceeding with generation...');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    if (generateSet) {
      // ✅ Step 1: Generate Main (Hero) Image only
      console.log('🎨 Generating Main Image (Hero)...');
      const mainResult = await generateProductImage({
        baseImage,
        productName,
        aspectRatio: 'hero'
      });

      result = {
        success: mainResult.success,
        mainImage: mainResult.imageUrl,
        galleryImages: [],
        detailImages: [],
        error: mainResult.error
      };

    } else if (generateRest) {
      // ✅ Step 2: Generate Remaining Images (Lifestyle, Features, Info)
      console.log('🎨 Generating Remaining Images...');

      const restResults = await Promise.all([
        generateProductImage({ baseImage, productName, aspectRatio: 'features' }),
        generateProductImage({ baseImage, productName, aspectRatio: 'detail' }),
        generateProductImage({ baseImage, productName, aspectRatio: 'lifestyle' })
      ]);

      const successImages = restResults
        .filter(r => r.success && r.imageUrl)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(r => r.imageUrl!);

      result = {
        success: successImages.length > 0,
        galleryImages: successImages,
        detailImages: [], // Using galleryImages for all additional images
        error: restResults.find(r => !r.success)?.error
      };

    } else if (generateVariations) {
      // Generate multiple variations
      const variations = await generateProductImageVariations({
        baseImage,
        productName
      });

      result = {
        success: true,
        images: variations.filter(r => r.success).map(r => r.imageUrl),
        errors: variations.filter(r => !r.success).map(r => r.error)
      };
    } else {
      // Generate single image
      const singleResult = await generateProductImage({
        baseImage,
        prompt: prompt || "Create a professional product photo with clean background",
        productName,
        aspectRatio
      });

      result = {
        success: singleResult.success,
        imageUrl: singleResult.imageUrl,
        error: singleResult.error
      };
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate image',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
