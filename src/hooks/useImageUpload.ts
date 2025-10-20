import { useState } from 'react';
import { 
  PresignedUrlRequestDto, 
  GeneratePresignedUrlResponse,
  ValidateUploadResponse,
  DeleteFileResponse,
  GetUploadSpecsResponse,
  ImageFolderType 
} from '@/types/image';
import { useAuth } from '@/providers/authProvider';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseImageUploadResult {
  uploadImage: (file: File, folder?: ImageFolderType) => Promise<string | null>;
  deleteImage: (s3Key: string) => Promise<boolean>;
  validateUpload: (s3Key: string) => Promise<boolean>;
  getUploadSpecs: () => Promise<GetUploadSpecsResponse | null>;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  error: string | null;
}

export const useImageUpload = (): UseImageUploadResult => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  /**
   * Upload image to S3 using presigned URL
   * @param file - File to upload
   * @param folder - S3 folder (default: 'products')
   * @returns S3 URL of uploaded file or null if failed
   */
  const uploadImage = async (file: File, folder: ImageFolderType = 'products'): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(null);

    try {
      // Step 1: Generate presigned URL
      const requestDto: PresignedUrlRequestDto = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        folder
      };

      const generateResponse = await fetch('/api/presignedUrl/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(requestDto)
      });

      const generateData: GeneratePresignedUrlResponse = await generateResponse.json();

      if (!generateData.success || !generateData.data) {
        throw new Error(generateData.message || 'Failed to generate presigned URL');
      }

      const { uploadUrl, s3Url } = generateData.data;

      // Step 2: Upload file to S3 using presigned URL
      // MUST include x-amz-server-side-encryption header as it was signed in the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'x-amz-server-side-encryption': 'AES256'
        }
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 upload failed:', uploadResponse.status, errorText);
        throw new Error(`Failed to upload file to S3: ${uploadResponse.status}`);
      }



      setUploadProgress({ loaded: file.size, total: file.size, percentage: 100 });
      console.log('Upload successful! S3 URL:', s3Url);
      return s3Url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Delete image from S3
   * @param s3Key - S3 key of the file to delete
   * @returns true if deleted successfully, false otherwise
   */
  const deleteImage = async (s3Key: string): Promise<boolean> => {
    setError(null);

    try {
      const encodedKey = encodeURIComponent(s3Key);
      const response = await fetch(`/api/presignedUrl/delete/${encodedKey}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      const data: DeleteFileResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete file');
      }

      return data.deleted || false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      console.error('Delete error:', err);
      return false;
    }
  };

  /**
   * Validate that file exists on S3
   * @param s3Key - S3 key of the file to validate
   * @returns true if file exists, false otherwise
   */
  const validateUpload = async (s3Key: string): Promise<boolean> => {
    try {
      const encodedKey = encodeURIComponent(s3Key);
      const response = await fetch(`/api/presignedUrl/validate/${encodedKey}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data: ValidateUploadResponse = await response.json();

      return data.exists || false;
    } catch (err) {
      console.error('Validation error:', err);
      return false;
    }
  };

  /**
   * Get upload specifications (allowed types, max size, etc.)
   * @returns Upload specs or null if failed
   */
  const getUploadSpecs = async (): Promise<GetUploadSpecsResponse | null> => {
    try {
      const response = await fetch('/api/presignedUrl/specs', {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
      });
      const data: GetUploadSpecsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to get upload specs');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get specs';
      setError(errorMessage);
      console.error('Get specs error:', err);
      return null;
    }
  };

  return {
    uploadImage,
    deleteImage,
    validateUpload,
    getUploadSpecs,
    isUploading,
    uploadProgress,
    error
  };
};

