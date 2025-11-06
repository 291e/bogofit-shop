import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ""
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

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

    // Create comprehensive analysis prompt
    const prompt = `Analyze this fashion/clothing product image and extract all relevant information. Return a JSON object with the following structure:

{
  "name": "Product name in Korean (e.g., '기모 스웨트 가디건')",
  "description": "Detailed product description in Korean (2-3 sentences about style, material, features)",
  "category": "상의 or 하의 or 원피스 or 아우터",
  "categoryHint": "More specific category name in Korean (e.g., '가디건', '후드티', '청바지', '스웨터', '블라우스', '셔츠', '반팔티', '긴팔티', '원피스', '코트', '재킷', '패딩', '조끼', '바지', '청바지', '반바지', '치마', '레깅스')",
  "tags": ["tag1", "tag2", "tag3"],
  "color": "Main color (e.g., '베이지', '블랙', '네이비')",
  "material": "Material if visible (e.g., '면', '폴리에스터', '기모')",
  "style": "Style description (e.g., '캐주얼', '정장', '스트릿')"
}

Instructions:
- Extract product name from visible text or describe based on appearance
- Write description in natural Korean, professional e-commerce style
- Determine main category: 상의 (top), 하의 (bottom), 원피스 (dress), or 아우터 (outerwear)
- categoryHint should be the specific Korean name of the item type (e.g., '가디건' for cardigan, '청바지' for jeans)
- Identify main color, material, and style if visible
- Return ONLY valid JSON, no additional text`;

    const requestPrompt = [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: image,
            },
          },
        ],
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: requestPrompt,
      generationConfig: {
        responseMimeType: "application/json" as const,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Extract JSON from response
    let analysisResult = null;

    if (response.candidates && response.candidates[0]?.content?.parts) {
      const textParts = response.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');

      try {
        // Try to parse JSON
        const jsonMatch = textParts.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If JSON parsing fails, try to extract information manually
        analysisResult = {
          name: extractName(textParts),
          description: extractDescription(textParts),
          category: extractCategory(textParts),
          categoryHint: "",
          tags: [],
          color: "",
          material: "",
          style: ""
        };
      }
    }

    // Validate and set defaults
    if (!analysisResult) {
      analysisResult = {
        name: "",
        description: "",
        category: "상의",
        categoryHint: "",
        tags: [],
        color: "",
        material: "",
        style: ""
      };
    }

    return NextResponse.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to analyze product',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions to extract info if JSON parsing fails
function extractName(text: string): string {
  const nameMatch = text.match(/"name"\s*:\s*"([^"]+)"/);
  return nameMatch ? nameMatch[1] : "";
}

function extractDescription(text: string): string {
  const descMatch = text.match(/"description"\s*:\s*"([^"]+)"/);
  return descMatch ? descMatch[1] : "";
}

function extractCategory(text: string): "상의" | "하의" {
  if (text.includes('하의') || text.includes('"하의"')) return "하의";
  return "상의";
}

