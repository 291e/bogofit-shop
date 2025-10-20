// Presigned URL DTOs
export interface PresignedUrlRequestDto {
  fileName: string;
  fileType: string;
  fileSize: number; // in bytes, max 5MB
  folder?: string; // default: "products"
}

export interface PresignedUrlResponseDto {
  uploadUrl: string;
  s3Key: string;
  s3Url: string;
  expiresAt: string;
}


export interface UploadSpecsDto {
  allowedFileTypes: string[];
  maxFileSize: number; // in bytes
  maxFileSizeMB: number;
  defaultFolders: string[];
  presignedUrlExpiry: string;
}

// API Response DTOs
export interface GeneratePresignedUrlResponse {
  success: boolean;
  message: string;
  data?: PresignedUrlResponseDto;
}

export interface ValidateUploadResponse {
  success: boolean;
  message: string;
  exists?: boolean;
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
  deleted?: boolean;
}

export interface GetUploadSpecsResponse {
  success: boolean;
  message: string;
  data?: UploadSpecsDto;
}

// Image Types
export type ImageFolderType = 'products' | 'avatars' | 'brands' | 'categories';

