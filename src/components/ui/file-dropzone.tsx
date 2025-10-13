"use client";

import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import type { SampleImage } from "@/contents/VirtualFitting/sampleImages";
import { useI18n } from "@/providers/I18nProvider";

interface FileDropzoneProps {
  onDrop: (file: File) => void;
  preview: string;
  label: string;
  required?: boolean;
  description?: string;
  sampleImages: SampleImage[];
  onSampleSelect: (imageSrc: string) => void;
  onClear?: () => void;
  type?: "model" | "clothing"; // 모델 이미지인지 상의/하의인지 구분
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
  type = "clothing", // 기본값은 상의/하의
}: FileDropzoneProps) {
  const { t } = useI18n();
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
          throw new Error(t("ui.fileDropzone.imageLoadFailed") + " " + response.status);
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
        throw new Error(t("ui.fileDropzone.proxyRequestFailed") + " " + response.status);
      }

      const blob = await response.blob();
      const file = new File([blob], `sample-${Date.now()}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      onDrop(file);
      onSampleSelect(imageSrc);
    } catch (error) {
      console.error(t("ui.fileDropzone.sampleImageLoadFailed"), error);
      // 직접 이미지 URL 사용
      onSampleSelect(imageSrc);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* 라벨 영역 */}
      <div className="mb-3">
        <label className="block text-sm font-semibold text-gray-900">
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-600 mt-1 leading-relaxed min-h-[39px]">
            {description}
          </p>
        )}
      </div>

      {/* 업로드 영역 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div
          {...getRootProps()}
          className={`flex-1 rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden ${
            preview
              ? "border-0" // 이미지가 있을 때는 테두리 없음
              : `border-2 border-dashed ${
                  isDragActive
                    ? "border-pink-500 bg-pink-50 shadow-lg"
                    : required
                      ? "border-gray-300 hover:border-pink-400 hover:shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                }`
          }`}
        >
          <input {...getInputProps()} />
          {preview ? (
            <div className="relative w-full h-full">
              {preview.startsWith('data:') || preview.startsWith('blob:') ? (
                <Image
                  src={preview}
                  alt={label}
                  className="w-full h-full rounded-xl object-contain"
                  fill
                />
              ) : (
                <Image
                  src={preview}
                  alt={label}
                  fill
                  className="rounded-xl object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized={preview.startsWith('http')}
                />
              )}

              {/* 삭제 버튼 */}
              {onClear && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="absolute top-3 right-3 w-6 h-6 bg-[#FF84CD] text-white rounded-full flex items-center justify-center hover:bg-[#F9CFB7] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title={t("ui.fileDropzone.removeImage")}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="mb-4">
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                <p className="text-base font-medium text-gray-700 mb-1">
                  {isDragActive
                    ? t("ui.fileDropzone.dragActiveText")
                    : type === "model"
                      ? t("ui.fileDropzone.uploadModelText")
                      : t("ui.fileDropzone.uploadClothingText")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("ui.fileDropzone.uploadInstructions")}
                </p>
              </div>
              <div className="text-xs text-gray-400 border-t border-gray-200 pt-3 w-full">
                {t("ui.fileDropzone.supportedFormats")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 샘플 이미지 선택 버튼 */}
      {sampleImages.length > 0 && (
        <div className="mt-3 ">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-sm font-medium hover:bg-pink-50 hover:border-pink-300 transition-all duration-200"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {t("ui.fileDropzone.selectSampleImage")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="pb-4 flex-shrink-0">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {label} {t("ui.fileDropzone.sampleSelectionTitle")}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-1 min-h-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-4">
                  {sampleImages.map((sample) => (
                    <div
                      key={sample.id}
                      className="cursor-pointer group"
                      onClick={() => handleSampleSelect(sample.src)}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-gray-200 group-hover:border-pink-400 transition-all duration-200 shadow-sm group-hover:shadow-md">
                        <Image
                          src={sample.src}
                          alt={sample.alt}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />
                      </div>
                      <p className="text-xs text-center mt-2 text-gray-600 group-hover:text-gray-900 transition-colors truncate">
                        {sample.alt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 pt-4 border-t border-gray-200">
                <DialogClose asChild>
                  <Button variant="outline" className="w-full">
                    {t("ui.fileDropzone.selectionComplete")}
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
