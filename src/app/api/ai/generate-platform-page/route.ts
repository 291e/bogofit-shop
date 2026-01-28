import { NextRequest, NextResponse } from "next/server";
import { generatePlatformPage } from "@/lib/ai/geminiService";

export async function POST(req: NextRequest) {
  try {
    const { prompt, base64Image, platform, gender } = await req.json();

    if (!prompt || !base64Image || !platform || !gender) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await generatePlatformPage({
      prompt,
      baseImage: base64Image,
      platform,
      gender
    });

    return NextResponse.json({
      success: true,
      images: result.images,
      details: result.details,
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate AI content" },
      { status: 500 }
    );
  }
}
