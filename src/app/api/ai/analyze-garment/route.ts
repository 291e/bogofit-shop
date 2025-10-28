import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ""
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 AI Garment Analysis API called');

    const body = await request.json();
    const { image, productName } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, message: 'Image is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Create analysis prompt
    const prompt = `Analyze this clothing/fashion product image and determine if it's a TOP (상의) or BOTTOM (하의) garment.

Product name: ${productName || 'Unknown'}

Classification rules:
- TOP (상의): shirts, t-shirts, blouses, sweaters, jackets, coats, hoodies, tops, dresses, one-piece
- BOTTOM (하의): pants, trousers, jeans, shorts, skirts, leggings

Respond with ONLY ONE of these two words:
- 상의 (if it's a top garment)
- 하의 (if it's a bottom garment)

If you're unsure or it's neither (like accessories, shoes, bags), respond with: 상의

Your response (one word only):`;

    const requestPrompt = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/png",
          data: image,
        },
      },
    ];

    console.log('📤 Sending analysis request to Gemini...');
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: requestPrompt,
    });

    console.log('📥 Received response from Gemini');

    // Extract text from response
    let analysisResult = "상의"; // Default

    if (response.candidates && response.candidates[0]?.content?.parts) {
      const textParts = response.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');

      console.log('🤖 AI Analysis:', textParts);

      // Parse result
      const normalized = textParts.trim().toLowerCase();
      if (normalized.includes('하의') || normalized.includes('bottom')) {
        analysisResult = "하의";
      } else {
        analysisResult = "상의"; // Default to 상의 (top)
      }
    }

    console.log('✅ Analysis result:', analysisResult);

    return NextResponse.json({
      success: true,
      category: analysisResult
    });

  } catch (error) {
    console.error('❌ AI Analysis Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to analyze image',
        error: error instanceof Error ? error.message : 'Unknown error',
        category: "상의" // Fallback default
      },
      { status: 500 }
    );
  }
}


