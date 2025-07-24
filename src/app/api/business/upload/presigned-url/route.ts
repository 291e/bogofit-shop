import { NextRequest, NextResponse } from "next/server";
import {
  generatePresignedUrl,
  generateS3Key,
  generateS3Url,
  validateFileType,
  validateFileSize,
} from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize, folder } = body;

    // 필수 필드 검증
    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다 (fileName, fileType, fileSize)" },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!validateFileType(fileType)) {
      return NextResponse.json(
        {
          error:
            "허용되지 않는 파일 타입입니다. (jpeg, jpg, png, webp, gif만 허용)",
        },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (!validateFileSize(fileSize)) {
      return NextResponse.json(
        { error: "파일 크기가 허용 범위를 벗어났습니다. (최대 10MB)" },
        { status: 400 }
      );
    }

    // S3 키 생성
    const s3Key = generateS3Key(fileName, folder);
    const s3Url = generateS3Url(s3Key);

    try {
      // Presigned URL 생성
      const uploadUrl = await generatePresignedUrl(s3Key, fileType, 300); // 5분

      console.log(`Presigned URL 생성 성공 - S3 Key: ${s3Key}`);

      return NextResponse.json({
        success: true,
        data: {
          uploadUrl,
          s3Key,
          s3Url,
          expiresIn: 300, // 5분
        },
        message: "Presigned URL이 생성되었습니다",
      });
    } catch (s3Error) {
      console.error("S3 Presigned URL 생성 실패:", s3Error);
      return NextResponse.json(
        { error: "Presigned URL 생성에 실패했습니다" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Presigned URL API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        config: {
          maxFileSize: "10MB",
          allowedTypes: ["jpeg", "jpg", "png", "webp", "gif"],
          expiresIn: "5분",
          folders: [
            "product-main",
            "product-thumbnail",
            "product-detail",
            "brand-logo",
            "banner",
          ],
        },
      },
      message: "S3 업로드 설정 정보입니다",
    });
  } catch (error) {
    console.error("설정 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
