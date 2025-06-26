"use client";

import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import type { SampleImage } from "@/contents/VirtualFitting/sampleImages";

interface FileDropzoneProps {
  onDrop: (file: File) => void;
  preview: string;
  label: string;
  required?: boolean;
  description?: string;
  sampleImages: SampleImage[];
  onSampleSelect: (imageSrc: string) => void;
  onClear?: () => void;
}

export function FileDropzone({
  onDrop,
  preview,
  label,
  required = false,
  description,
  sampleImages,
  onSampleSelect,
  onClear,
}: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles[0]);
      }
    },
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
  });

  const handleSampleSelect = async (imageSrc: string) => {
    try {
      // 로컬 이미지인 경우 직접 사용
      if (imageSrc.startsWith("/")) {
        // 로컬 이미지를 Blob으로 변환
        const response = await fetch(imageSrc);
        if (!response.ok) {
          throw new Error(`이미지 로드 실패: ${response.status}`);
        }

        const blob = await response.blob();
        const file = new File([blob], `sample-${Date.now()}.jpg`, {
          type: blob.type || "image/jpeg",
        });
        onDrop(file);
        onSampleSelect(imageSrc);
        return;
      }

      // 외부 이미지인 경우 프록시 사용
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageSrc)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`프록시 요청 실패: ${response.status}`);
      }

      const blob = await response.blob();
      const file = new File([blob], `sample-${Date.now()}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      onDrop(file);
      onSampleSelect(imageSrc);
    } catch (error) {
      console.error("샘플 이미지 로드 실패:", error);
      // 직접 이미지 URL 사용
      onSampleSelect(imageSrc);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {required && <span className="text-red-500">*</span>} {label}
        {description && (
          <span className="block text-xs text-gray-500 font-normal mt-1">
            {description}
          </span>
        )}
      </label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          isDragActive
            ? "border-pink-500 bg-pink-50"
            : required
            ? "border-gray-300 hover:border-pink-400"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative">
            <Image
              src={preview}
              alt={label}
              width={100}
              height={100}
              className="mx-auto rounded"
            />
            {onClear && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 text-red-500 flex items-center justify-center"
                title="이미지 제거"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="py-4">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {isDragActive
                ? "여기에 파일을 드롭하세요"
                : "클릭하거나 드래그하여 업로드"}
            </p>
          </div>
        )}
      </div>

      {/* 샘플 이미지 선택 버튼 */}
      {sampleImages.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
              <ImageIcon className="w-3 h-3 mr-1" />
              샘플 이미지 선택
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{label} 샘플 선택</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
              {sampleImages.map((sample) => (
                <div
                  key={sample.id}
                  className="cursor-pointer group"
                  onClick={() => handleSampleSelect(sample.src)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 group-hover:border-pink-400 transition-colors">
                    <Image
                      src={sample.src}
                      alt={sample.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-600">
                    {sample.alt}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
