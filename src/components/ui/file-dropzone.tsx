"use client";

import { useState } from "react";
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
import { useLanguage } from "@/providers/languageProvider";

interface SampleImage {
  id: string;
  src: string;
  alt: string;
}


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
  selectedSampleSrc?: string; // Source URL of currently selected sample image
  version?: "v1" | "v2"; // BOGOFIT V1 or V2
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
  selectedSampleSrc,
  version,
}: FileDropzoneProps) {
  const { t } = useLanguage();
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleSampleClick = (sampleId: string) => {
    setSelectedSampleId(sampleId);
  };

  const handleDialogClose = () => {
    setSelectedSampleId(null);
    setIsDialogOpen(false);
  };

  const handleConfirmSelection = async () => {
    if (!selectedSampleId) return;

    const selectedSample = sampleImages.find(s => s.id === selectedSampleId);
    if (!selectedSample) return;

    const imageSrc = selectedSample.src;

    // Call onSampleSelect with the source URL so parent can track it
    onSampleSelect(imageSrc);

    try {
      // 로컬 이미지인 경우 직접 사용
      if (imageSrc.startsWith("/")) {
        // 로컬 이미지를 Blob으로 변환
        const response = await fetch(imageSrc);
        if (!response.ok) {
          throw new Error("이미지 로드 실패: " + response.status);
        }

        const blob = await response.blob();
        const file = new File([blob], `sample-${Date.now()}.jpg`, {
          type: blob.type || "image/jpeg",
        });
        onDrop(file);
        onSampleSelect(imageSrc);
        handleDialogClose();
        return;
      }

      // 외부 이미지인 경우 프록시 사용
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageSrc)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error("프록시 요청 실패: " + response.status);
      }

      const blob = await response.blob();
      const file = new File([blob], `sample-${Date.now()}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      onDrop(file);
      onSampleSelect(imageSrc);
      handleDialogClose();
    } catch (error) {
      console.error("샘플 이미지 로드 실패:", error);
      // 직접 이미지 URL 사용
      onSampleSelect(imageSrc);
      handleDialogClose();
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      // When dialog opens, find and highlight the currently selected image
      // Priority: selectedSampleSrc > preview matching
      if (selectedSampleSrc && sampleImages.length > 0) {
        const matchingSample = sampleImages.find(sample => sample.src === selectedSampleSrc);
        if (matchingSample) {
          setSelectedSampleId(matchingSample.id);
          return;
        }
      }

      // Fallback: try to match preview with sample images
      if (preview && sampleImages.length > 0) {
        const matchingSample = sampleImages.find(sample => {
          // For data URLs or blob URLs, we can't match directly
          if (preview.startsWith('data:') || preview.startsWith('blob:')) {
            return false;
          }

          // Extract path from preview URL for comparison
          const previewPath = preview.split('?')[0]; // Remove query params
          const samplePath = sample.src.split('?')[0]; // Remove query params

          // Check exact match or if preview contains sample path or vice versa
          return preview === sample.src ||
            previewPath === samplePath ||
            previewPath.includes(samplePath) ||
            samplePath.includes(previewPath);
        });
        if (matchingSample) {
          setSelectedSampleId(matchingSample.id);
        }
      }
    } else {
      // Reset selection when dialog closes
      setSelectedSampleId(null);
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
          className={`flex-1 rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden ${preview
            ? "border-0" // 이미지가 있을 때는 테두리 없음
            : `border-2 border-dashed ${isDragActive
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
                  width={200}
                  height={200}
                  className="w-full h-full rounded-xl object-contain"
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
                    ? t("ui.fileDropzone.dropFile")
                    : type === "model"
                      ? t("ui.fileDropzone.uploadModelImage")
                      : version === "v2" && type === "clothing" && label.includes("아이템")
                        ? t("ui.fileDropzone.uploadItemImage")
                        : version === "v1" && type === "clothing" && label.includes("하의")
                          ? t("ui.fileDropzone.uploadBottomImage")
                          : t("ui.fileDropzone.uploadClothingImage")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("ui.fileDropzone.dragOrClick")}
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
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
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
                  {t("ui.fileDropzone.selectSampleImageLabel").replace("{label}", label)}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-1 min-h-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-4">
                  {sampleImages.map((sample) => (
                    <div
                      key={sample.id}
                      className="cursor-pointer group"
                      onClick={() => handleSampleClick(sample.id)}
                    >
                      <div className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 shadow-sm group-hover:shadow-md ${selectedSampleId === sample.id
                        ? "border-pink-500 ring-2 ring-pink-300"
                        : "border-gray-200 group-hover:border-pink-400"
                        }`}>
                        <Image
                          src={sample.src}
                          alt={sample.alt}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />
                        {selectedSampleId === sample.id && (
                          <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className={`text-xs text-center mt-2 transition-colors truncate ${selectedSampleId === sample.id
                        ? "text-pink-600 font-semibold"
                        : "text-gray-600 group-hover:text-gray-900"
                        }`}>
                        {sample.alt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 pt-4 border-t border-gray-200">
                <Button
                  variant={selectedSampleId ? "default" : "outline"}
                  className={`w-full ${selectedSampleId
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                    : ""
                    }`}
                  onClick={handleConfirmSelection}
                  disabled={!selectedSampleId}
                >
                  {t("ui.fileDropzone.selectionComplete")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
