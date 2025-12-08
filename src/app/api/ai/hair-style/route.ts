import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
// Đảm bảo rằng các hàm này đã được định nghĩa đúng cách trong '../virtual-fitting/image-utils'
import { getImageDimensions, getClosestAspectRatio } from "../virtual-fitting/image-utils";

// Khởi tạo Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

// Giao diện (interface) tối giản cho phản hồi, chủ yếu để tránh lỗi TypeScript nghiêm ngặt.
// Trong môi trường thực tế, bạn có thể muốn sử dụng loại (type) từ SDK nếu có.
interface GeminiResponse {
    candidates?: {
        content?: {
            parts?: {
                inlineData?: {
                    data: string;
                    mimeType?: string;
                };
            }[];
        };
    }[];
}

/**
 * Hàm trợ giúp để trích xuất dữ liệu hình ảnh (base64) từ phản hồi Gemini.
 * Nó kiểm tra cấu trúc phản hồi phổ biến khi yêu cầu responseMimeType là 'image/png'.
 * @param response Phản hồi từ ai.models.generateContent.
 * @returns Đối tượng chứa data (base64) và mimeType, hoặc null nếu không tìm thấy.
 */
function extractImageFromResponse(response: GeminiResponse): { data: string; mimeType: string } | null {
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        const parts = response.candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                // MimeType mặc định là image/png theo responseMimeType đã cấu hình
                return {
                    data: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'image/png'
                };
            }
        }
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const personImage = formData.get('personImage') as File;
        const hairImage = formData.get('hairImage') as File;

        // Validation
        if (!personImage || !hairImage) {
            return NextResponse.json(
                {
                    success: false,
                    message: !personImage
                        ? 'Person image is required'
                        : 'Hair style image is required'
                },
                { status: 400 }
            );
        }

        // Chuyển đổi files sang base64
        const personBuffer = Buffer.from(await personImage.arrayBuffer());
        const personBase64 = personBuffer.toString('base64');
        const personMimeType = personImage.type || 'image/jpeg';

        const hairBuffer = Buffer.from(await hairImage.arrayBuffer());
        const hairBase64 = hairBuffer.toString('base64');
        const hairMimeType = hairImage.type || 'image/jpeg';

        // Trích xuất kích thước ảnh gốc cho prompt
        let imageDimensions = 'Original Dimensions';
        let aspectRatio = '9:16'; // Mặc định dự phòng (Fallback)

        const dimensions = getImageDimensions(personBuffer);
        if (dimensions) {
            imageDimensions = `${dimensions.width}×${dimensions.height}`;
            aspectRatio = getClosestAspectRatio(dimensions.width, dimensions.height);
        }

        // --- BƯỚC 1: CHUYỂN ĐỔI KIỂU TÓC (Gộp) ---
        // Prompt yêu cầu mô hình tự động trích xuất tóc từ IMAGE 2 và áp dụng nó lên IMAGE 1.
        const transferPrompt = `You are an expert AI for hyper-realistic face preservation and hair style transfer. Your sole objective is to transfer the hair style, color, and texture from **IMAGE 2** onto the person in **IMAGE 1**, while maintaining the identity of IMAGE 1 perfectly.

TASK: STRICT Identity-Preserving Hair Style Transfer (One-Step Process)

SOURCE - IMAGE 1 (THE PERSON / BASE IMAGE):
This is the **ABSOLUTE BASE**. You must preserve these elements with the highest priority:
• **Person's face, features, identity, expression, skin tone - 100% IDENTICAL**. This is the non-negotiable anchor.
• Person's body, pose, clothing, background, and lighting - IDENTICAL.

STYLE SOURCE - IMAGE 2 (THE HAIR STYLE SOURCE):
Treat this image as the source for **ONLY** the following elements, ignoring the face/person in it:
• Hair Style/Cut: Copy the exact shape, volume, and silhouette.
• Hair Color: Apply the hair color from IMAGE 2.
• Hair Texture: Apply the texture (e.g., degree of wave, straightness) from IMAGE 2.

INTEGRATION INSTRUCTIONS (CRITICAL):
• **Face Preservation:** Do not change or blend any facial features of the person in IMAGE 1.
• **Seamless Realism:** Integrate the new hair style onto the head structure of IMAGE 1, respecting the existing lighting and shadows for a photorealistic result.

OUTPUT SPECIFICATIONS (MUST FOLLOW):
• Format: **${imageDimensions}** (EXACT same dimensions as the original IMAGE 1).
• Quality: Photorealistic, high-resolution, professional-grade output.

***ABSOLUTE MANDATORY RULES - IF VIOLATED, THE RESULT IS INVALID:***
✓ **DO:** The face and identity of the final result **MUST** be **100%** the face and identity of **IMAGE 1**.
✓ **DO:** The hair style, color, and texture **MUST** be taken from **IMAGE 2**.
✓ **DO:** Keep background, pose, lighting, and dimensions of IMAGE 1.

✗ **DON'T:** Change, alter, or blend the face/identity of IMAGE 1 with IMAGE 2.
✗ **DON'T:** Allow any facial features or expression from IMAGE 2 to appear.
✗ **DON'T:** Crop the final image.

RESULT: A perfect blend: IMAGE 1's identity + IMAGE 2's hair style, color, and texture. The person is recognizable as being from IMAGE 1, but with new hair.`;

        const transferParts = [
            { text: transferPrompt },
            { // IMAGE 1: The Person / Base Image
                inlineData: { mimeType: personMimeType, data: personBase64 },
            },
            { // IMAGE 2: The Hair Style Source
                inlineData: { mimeType: hairMimeType, data: hairBase64 },
            }
        ];

        // Gọi Gemini cho quá trình Chuyển đổi (Chỉ một lần gọi)
        const transferResponse = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: transferParts,
            generationConfig: {
                candidateCount: 1,
                responseMimeType: "image/png", // Đảm bảo đầu ra là hình ảnh
            },
            config: {
                imageConfig: {
                    // Cấu hình tỷ lệ khung hình giúp mô hình tạo ra hình ảnh phù hợp
                    aspectRatio: aspectRatio,
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        const finalImageData = extractImageFromResponse(transferResponse as unknown as GeminiResponse);

        if (finalImageData) {
            const dataUrl = `data:${finalImageData.mimeType};base64,${finalImageData.data}`;
            return NextResponse.json({
                success: true,
                imageUrl: dataUrl,
                message: 'Hair style transfer completed successfully in a single step.'
            });
        }

        return NextResponse.json(
            { success: false, message: 'No image generated from AI' },
            { status: 500 }
        );

    } catch (error) {
        console.error('Error in hair style transfer:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error', error: String(error) },
            { status: 500 }
        );
    }
}