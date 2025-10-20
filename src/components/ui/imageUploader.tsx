'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from '@/components/ui/button';
import { ImageFolderType } from '@/types/image';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploaderProps {
  /** 이미 업로드된 이미지 URL들 */
  value?: string | string[];
  
  /** 이미지가 업로드/삭제될 때 호출되는 콜백 */
  onChange?: (urls: string | string[] | null) => void;
  
  /** 단일 이미지만 업로드 (기본: true) */
  single?: boolean;
  
  /** 최대 업로드 가능한 이미지 수 (multiple일 때) */
  maxFiles?: number;
  
  /** S3 폴더 경로 */
  folder?: ImageFolderType;
  
  /** 비활성화 여부 */
  disabled?: boolean;
  
  /** 추가 CSS 클래스 */
  className?: string;
  
  /** 업로드 영역 높이 */
  height?: string;
  
  /** 미리보기 이미지 크기 */
  previewSize?: 'sm' | 'md' | 'lg';
  
  /** 드래그 앤 드롭 활성화 */
  enableDragDrop?: boolean;
  
  /** 에러 콜백 */
  onError?: (error: string) => void;
}

export const ImageUploader = ({
  value,
  onChange,
  single = true,
  maxFiles = 5,
  folder = 'products',
  disabled = false,
  className,
  height = '200px',
  previewSize = 'md',
  enableDragDrop = true,
  onError
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, deleteImage, isUploading, error } = useImageUpload();

  // Normalize value to array
  const currentUrls = useMemo(() => 
    Array.isArray(value) ? value : value ? [value] : [], 
    [value]
  );

  const previewSizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const filesToUpload = Array.from(files).slice(
      0,
      single ? 1 : Math.max(0, maxFiles - currentUrls.length)
    );

    for (const file of filesToUpload) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = `지원되지 않는 파일 형식입니다: ${file.name}`;
        onError?.(errorMsg);
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        const errorMsg = `파일 크기가 5MB를 초과합니다: ${file.name}`;
        onError?.(errorMsg);
        continue;
      }

      // Upload image
      const url = await uploadImage(file, folder);
      if (url) {
        if (single) {
          onChange?.(url);
        } else {
          const newUrls = [...currentUrls, url];
          onChange?.(newUrls);
        }
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [currentUrls, folder, maxFiles, onChange, onError, single, uploadImage]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  // Handle delete image
  const handleDelete = async (urlToDelete: string) => {
    try {
      // Extract S3 key from URL
      const urlParts = urlToDelete.split('.amazonaws.com/');
      if (urlParts.length < 2) {
        onError?.('잘못된 이미지 URL입니다.');
        return;
      }
      const s3Key = urlParts[1];

      const success = await deleteImage(s3Key);
      if (success) {
        if (single) {
          onChange?.(null);
        } else {
          const newUrls = currentUrls.filter(url => url !== urlToDelete);
          onChange?.(newUrls.length > 0 ? newUrls : null);
        }
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : '이미지 삭제에 실패했습니다.');
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && enableDragDrop) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled && enableDragDrop) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const canUploadMore = single ? currentUrls.length === 0 : currentUrls.length < maxFiles;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed',
            isUploading && 'pointer-events-none'
          )}
          style={{ height }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            multiple={!single}
            className="hidden"
          />

          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-gray-600">업로드 중...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {enableDragDrop ? '이미지를 드래그하거나 클릭하여 업로드' : '클릭하여 이미지 업로드'}
                </p>
                <p className="text-xs text-gray-500">
                  JPEG, PNG, WebP, GIF (최대 5MB)
                </p>
                {!single && (
                  <p className="text-xs text-gray-500 mt-1">
                    최대 {maxFiles}개 업로드 가능 ({currentUrls.length}/{maxFiles})
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="mt-4"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  이미지 선택
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Preview Images */}
      {currentUrls.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            업로드된 이미지 ({currentUrls.length}
            {!single && `/${maxFiles}`})
          </p>
          <div className="flex flex-wrap gap-4">
            {currentUrls.map((url, index) => (
              <div
                key={url}
                className={cn(
                  'relative group rounded-lg overflow-hidden border-2 border-gray-200',
                  previewSizeClasses[previewSize]
                )}
              >
                <Image
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
                {!disabled && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(url)}
                      className="gap-1"
                    >
                      <X className="w-4 h-4" />
                      삭제
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

