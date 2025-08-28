import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// AWS S3 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// S3 버킷 이름
export const S3_BUCKET = process.env.AWS_S3_BUCKET || "bogofit-images";

// 허용된 파일 타입
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// 최대 파일 크기 (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  folder?: string; // 선택적 폴더 (product-main, product-thumbnail, product-detail 등)
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  s3Key: string;
  s3Url: string;
}

/**
 * 파일 타입 검증
 */
export function validateFileType(fileType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(fileType.toLowerCase());
}

/**
 * 파일 크기 검증
 */
export function validateFileSize(fileSize: number): boolean {
  return fileSize > 0 && fileSize <= MAX_FILE_SIZE;
}

/**
 * S3 키 생성 (폴더 구조 포함)
 */
export function generateS3Key(fileName: string, folder?: string): string {
  const uuid = uuidv4();
  const extension = fileName.split(".").pop();
  const timestamp = Date.now();

  // 폴더 구조
  const folderPath = folder ? `${folder}/` : "";

  return `images/${folderPath}${timestamp}-${uuid}.${extension}`;
}

/**
 * S3 전체 URL 생성
 */
export function generateS3Url(s3Key: string): string {
  return `https://${S3_BUCKET}.s3.${
    process.env.AWS_REGION || "ap-northeast-2"
  }.amazonaws.com/${s3Key}`;
}

/**
 * Presigned URL 생성
 */
export async function generatePresignedUrl(
  s3Key: string,
  contentType: string,
  expiresIn: number = 300 // 5분
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: contentType,
    // ACL: "public-read", // 퍼블릭 읽기 권한 (필요한 경우)
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Presigned URL 생성 실패:", error);
    throw new Error("Presigned URL 생성에 실패했습니다");
  }
}

/**
 * 이미지 메타데이터 추출 (필요한 경우 Sharp 라이브러리 사용)
 */
export async function extractImageMetadata(/* buffer: Buffer */): Promise<{
  width?: number;
  height?: number;
}> {
  // TODO: Sharp 라이브러리를 사용하여 이미지 메타데이터 추출
  // 현재는 기본값 반환
  return {
    width: undefined,
    height: undefined,
  };
}

/**
 * S3 객체 삭제 (필요한 경우)
 */
export async function deleteS3Object(s3Key: string): Promise<boolean> {
  try {
    // 실제 구현 시 DeleteObjectCommand 사용
    console.log(`S3 객체 삭제 요청: ${s3Key}`);
    return true;
  } catch (error) {
    console.error("S3 객체 삭제 실패:", error);
    return false;
  }
}
