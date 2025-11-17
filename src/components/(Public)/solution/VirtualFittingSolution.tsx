"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Progress } from "@/components/ui/progress";
import { Download, AlertTriangle } from "lucide-react";
import { humanSamples, itemSamples, hairSamples, hairColorSamples } from "@/contents/VirtualFitting/sampleImages";
import { useLanguage } from "@/providers/languageProvider";
import Image from "next/image";

type SolutionType = "item" | "hair" | "hairColor";

export default function VirtualFittingSolution() {
  const { t } = useLanguage();
  const [solutionType, setSolutionType] = useState<SolutionType>("item");
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [modelPreview, setModelPreview] = useState<string>("");
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [itemPreview, setItemPreview] = useState<string>("");
  const [hairColor, setHairColor] = useState<string>("#222");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [error, setError] = useState<string>("");
  const [showHairColorGallery, setShowHairColorGallery] = useState(false);

  const hairColorOptions = [
    { label: "블랙", value: "#000000" },
    { label: "블루 블랙", value: "#0b1226" },
    { label: "다크 브라운", value: "#3b2f2f" },
    { label: "레드 브라운", value: "#7a3b2a" },
    { label: "와인 레드", value: "#5b1220" },
    { label: "체리 레드", value: "#b22234" },
    { label: "애쉬 블론드", value: "#cfcfcf" },
    { label: "핑크", value: "#ff6fa3" },
    { label: "민트", value: "#7ee7c7" },
    { label: "베이지 블론드", value: "#f7e7be" },
    { label: "라벤더 퍼플", value: "#b57edc" },
    { label: "딥 바이올렛", value: "#37175e" },
    { label: "카키 그린", value: "#8d9772" },
    { label: "에메랄드 그린", value: "#50c878" }
  ];

  const handleModelImageChange = (file: File | null) => {
    setModelImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setModelPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setModelPreview("");
    }
  };

  const handleItemImageChange = (file: File | null) => {
    setItemImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setItemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setItemPreview("");
    }
  };

  const handleSampleSelect = async (type: "model" | "item", imageSrc: string) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], `${type}-sample.png`, { type: blob.type });

      if (type === "model") {
        handleModelImageChange(file);
      } else {
        handleItemImageChange(file);
      }
    } catch (err) {
      console.error("Failed to load sample image:", err);
    }
  };

  const handleGenerate = async () => {
    if (!modelImage) {
      setError(t("productDetail.solution.uploadModelImage"));
      return;
    }
    if ((solutionType === "item" || solutionType === "hair") && !itemImage) {
      setError(t("productDetail.solution.uploadItemImage"));
      return;
    }
    try {
      setIsProcessing(true);
      setError("");
      setProgress(0);
      setStatus(t("productDetail.solution.starting"));

      const formData = new FormData();
      formData.append('personImage', modelImage);
      if (solutionType === "item" || solutionType === "hair") {
        formData.append('itemImage', itemImage!);
      }
      if (solutionType === "hair") {
        formData.append('productTitle', 'Hair Style');
      } else if (solutionType === "hairColor") {
        formData.append('productTitle', 'Hair Color');
        formData.append('hairColor', hairColor);
      } else {
        formData.append('productTitle', 'Accessory Item');
      }
      formData.append('solutionType', solutionType);

      // Progress simulation - 13 seconds total (0% to 90% in 13s, then jump to 100% when done)
      const totalDuration = 13000; // 13 seconds
      const updateInterval = 100; // Update every 100ms for smooth progress
      const targetProgress = 90; // Stop at 90% until API responds
      const totalSteps = totalDuration / updateInterval; // 130 steps
      const progressStep = targetProgress / totalSteps; // ~0.69% per step

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + progressStep;
          if (next >= targetProgress) {
            clearInterval(progressInterval);
            return targetProgress;
          }
          return next;
        });
      }, updateInterval);

      setStatus(t("productDetail.solution.analyzing"));

      const response = await fetch('/api/ai/virtual-fitting', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to generate image');
      }

      setStatus(t("productDetail.solution.complete"));
      setGeneratedImage(result.imageUrl);
      setIsProcessing(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : t("productDetail.solution.unknownError"));
      setIsProcessing(false);
      setStatus("");
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("productDetail.solution.title")}</h1>
        <p className="text-gray-600">{t("productDetail.solution.description")}</p>
      </div>

      {/* Solution Type Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("productDetail.solution.selectSolutionType")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={solutionType === "item" ? "default" : "outline"}
              size="lg"
              onClick={() => {
                setSolutionType("item");
                setGeneratedImage("");
                handleItemImageChange(null);
              }}
              className="flex-1"
            >
              {t("productDetail.solution.itemSolution")}
            </Button>
            <Button
              variant={solutionType === "hair" ? "default" : "outline"}
              size="lg"
              onClick={() => {
                setSolutionType("hair");
                setGeneratedImage("");
                handleItemImageChange(null);
              }}
              className="flex-1"
            >
              {t("productDetail.solution.hairSolution")}
            </Button>
            <Button
              variant={solutionType === "hairColor" ? "default" : "outline"}
              size="lg"
              onClick={() => {
                setSolutionType("hairColor");
                setGeneratedImage("");
                handleItemImageChange(null);
              }}
              className="flex-1"
            >
              {t("productDetail.solution.hairColorSolution")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Upload area (model image always) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("productDetail.solution.imageUpload")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 모델 이미지 */}
                <div className="space-y-3">
                  <div className="w-full aspect-[9/16] min-h-[400px] max-h-[500px]">
                    <FileDropzone
                      onDrop={handleModelImageChange}
                      preview={modelPreview}
                      label={t("productDetail.solution.modelImage")}
                      required
                      description={t("productDetail.solution.modelImageDescription")}
                      sampleImages={solutionType === "hairColor" ? hairColorSamples : humanSamples}
                      onSampleSelect={(imageSrc) => handleSampleSelect("model", imageSrc)}
                      onClear={() => handleModelImageChange(null)}
                      type="model"
                    />
                  </div>
                </div>
                {/* Item/Hair. But for hairColor: show color/fonts only, NO FileDropzone here */}
                {solutionType === "item" || solutionType === "hair" ? (
                  <div className="space-y-3">
                    <div className="w-full aspect-[9/16] min-h-[400px] max-h-[500px]">
                      <FileDropzone
                        onDrop={handleItemImageChange}
                        preview={itemPreview}
                        label={solutionType === "hair" ? t("productDetail.solution.hairImage") : t("productDetail.solution.itemImage")}
                        required
                        description={solutionType === "hair" ? t("productDetail.solution.hairImageDescription") : t("productDetail.solution.itemImageDescription")}
                        sampleImages={solutionType === "hair" ? hairSamples : itemSamples}
                        onSampleSelect={(imageSrc) => handleSampleSelect("item", imageSrc)}
                        onClear={() => handleItemImageChange(null)}
                        type="clothing"
                      />
                    </div>
                  </div>
                ) : solutionType === "hairColor" ? (
                  <div className="space-y-3">
                    {/* Hair color gallery and picker (NO FileDropzone) */}
                    <label className="font-medium block">{t("productDetail.solution.selectHairColor") || "Chọn màu tóc"}</label>
                    {/* Gallery button opening modal of hair color samples, pick sets modelPreview */}
                    <div>

                      {showHairColorGallery && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {hairColorSamples.map((sample) => (
                                <div key={sample.id} className="cursor-pointer group" onClick={async () => {
                                  await handleSampleSelect("model", sample.src);
                                  setShowHairColorGallery(false);
                                }}>
                                  <div className="relative aspect-[9/16] overflow-hidden rounded-xl border-2 transition-all duration-200 ">
                                    <Image src={sample.src} alt={sample.alt} fill className="object-cover" />
                                  </div>
                                  <p className="text-xs text-center mt-2">{sample.alt}</p>
                                </div>
                              ))}
                            </div>
                            <button className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowHairColorGallery(false)}>닫기</button>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Color picker */}
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-3">
                      {hairColorOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setHairColor(opt.value)}
                          className={`flex items-center gap-3 p-2 rounded-lg border focus:outline-none transition-shadow ${hairColor === opt.value ? 'ring-2 ring-offset-2 ring-indigo-500 border-transparent' : 'border-gray-200'}`}
                          aria-pressed={hairColor === opt.value}
                        >
                          <span className="w-10 h-10 rounded-full shrink-0" style={{ backgroundColor: opt.value, boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.25)' }} />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-gray-700">{hairColor}</div>
                  </div>
                ) : null}
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">{t("productDetail.solution.error")}</p>
                      <p className="mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              <Button
                onClick={handleGenerate}
                disabled={!modelImage || (solutionType !== "hairColor" && !itemImage) || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? t("productDetail.solution.processing") : t("productDetail.solution.startVirtualFitting")}
              </Button>
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{status}</span>
                    <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side: Result image */}
        {generatedImage && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t("productDetail.solution.generatedImage")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border">
                  <Image
                    src={generatedImage}
                    alt={t("productDetail.solution.generatedImage")}
                    fill
                    className="object-contain"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={() => {
                      const filename = `virtual-fitting-${Date.now()}.png`;
                      downloadFile(generatedImage, filename);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
