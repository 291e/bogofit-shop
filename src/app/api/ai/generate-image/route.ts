import { NextRequest, NextResponse } from 'next/server';
import { generateProductImage, generateProductImageVariations } from '@/lib/ai/geminiService';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Generate Image API called');
    
    const body = await request.json();
    const { baseImage, prompt, productName, generateVariations = false } = body;

    console.log('📝 Request data:', {
      hasBaseImage: !!baseImage,
      prompt: prompt?.substring(0, 50) + '...',
      productName,
      generateVariations
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

    let result;

    if (generateVariations) {
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
        productName
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
