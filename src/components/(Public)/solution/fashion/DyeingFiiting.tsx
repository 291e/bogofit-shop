"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, X, Sparkles, Play } from "lucide-react";
import { useLanguage } from "@/providers/languageProvider";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { hairColorSamples } from "@/contents/VirtualFitting/sampleImages";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";

interface DyeingFittingProps {
    onResultGenerated?: (resultImage: string) => void;
}

export default function DyeingFitting({ onResultGenerated }: DyeingFittingProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(true);
    const [showResults, setShowResults] = useState(false);

    const [modelFile, setModelFile] = useState<File | null>(null);
    const [modelPreview, setModelPreview] = useState<string>("");
    const [selectedSampleSrc, setSelectedSampleSrc] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("#000000");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string>("");

    // Video generation states
    const [generatedVideo, setGeneratedVideo] = useState("");
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const videoGeneration = useVideoGeneration();

    // Predefined color palette for dyeing
    const colorPalette = [
        { name: "Black", hex: "#000000" },
        { name: "Brown", hex: "#4A2C2A" },
        { name: "Blonde", hex: "#F4E4C1" },
        { name: "Red", hex: "#8B0000" },
        { name: "Auburn", hex: "#A52A2A" },
        { name: "Burgundy", hex: "#800020" },
        { name: "Purple", hex: "#800080" },
        { name: "Blue", hex: "#0000FF" },
        { name: "Pink", hex: "#FF69B4" },
        { name: "Silver", hex: "#C0C0C0" },
        { name: "Platinum", hex: "#E5E4E2" },
        { name: "Ash Brown", hex: "#6B5A4D" },
    ];

    const handleFileChange = (file: File | null) => {
        if (file) {
            setModelFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setModelPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            setSelectedSampleSrc("");
        } else {
            setModelFile(null);
            setModelPreview("");
        }
    };

    const handleSampleSelect = (imageSrc: string) => {
        setModelPreview(imageSrc);
        setSelectedSampleSrc(imageSrc);
        setModelFile(null);
    };

    const handleGenerate = async () => {
        if (!modelPreview) {
            alert("모델 이미지를 업로드해주세요");
            return;
        }

        setIsGenerating(true);
        setShowResults(true);

        try {
            const formData = new FormData();
            if (modelFile) {
                formData.append('personImage', modelFile);
            } else if (selectedSampleSrc) {
                try {
                    const response = await fetch(selectedSampleSrc);
                    const blob = await response.blob();
                    formData.append('personImage', blob, 'sample.png');
                } catch (e) {
                    console.error("Error fetching sample image:", e);
                    alert("샘플 이미지를 불러오는데 실패했습니다.");
                    return;
                }
            } else {
                alert("모델 이미지를 선택해주세요.");
                return;
            }

            formData.append('targetColor', selectedColor);

            const response = await fetch("/api/ai/dyeing", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("염색 생성 실패");
            }

            const data = await response.json();
            setGeneratedImage(data.imageUrl);
            if (onResultGenerated) {
                onResultGenerated(data.imageUrl);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("염색 이미지 생성 중 오류가 발생했습니다");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!generatedImage) {
            alert("Please generate an image first before creating a video.");
            return;
        }

        setIsGeneratingVideo(true);

        try {
            const videoResult = await videoGeneration.mutateAsync({
                prompt: "Smooth 360-degree head rotation (6s): The subject's head rotates continuously in one direction, starting from the front view, slowly turning through the left profile, back view, right profile, and smoothly completing a full 360-degree rotation back to the front view. Continuous circular motion to showcase the hair style from all angles. Maintain consistent facial identity throughout the rotation.",
                imageUrl: generatedImage,
                negativePrompt: "blurry, distorted, low quality, artifacts, bad proportions, deformed, ugly, body movement, walking, jumping, multiple people, background changes, jerky motion, back and forth movement, oscillating motion",
                config: {
                    durationSeconds: 6,
                    aspectRatio: "9:16",
                    resolution: "720p"
                }
            });

            if (videoResult.success && videoResult.data.videoUrl) {
                setGeneratedVideo(videoResult.data.videoUrl);
            } else {
                alert("Failed to generate video. Please try again.");
            }
        } catch (error) {
            console.error("Error generating video:", error);
            alert("Failed to generate video. Please try again.");
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    const resetComponent = () => {
        setShowResults(false);
        setGeneratedImage("");
        setGeneratedVideo("");
        setIsGenerating(false);
        setIsGeneratingVideo(false);
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Header Card */}
            <Card
                className="mb-6 py-4"
                style={{
                    background: "linear-gradient(270deg, #FB923C, #FBBF24)", // Orange to Yellow gradient
                    backgroundSize: "200% 200%",
                    animation: "gradientShift 8s ease-in-out infinite",
                }}
            >
                <CardHeader
                    className="cursor-pointer gap-0"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#FB923C] to-[#FBBF24] rounded-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            {t("ui.solution.fashion.dyeingFitting") || "Dyeing Solution"}
                            <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-none">
                                BETA
                            </Badge>
                        </div>
                        {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-white" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-white" />
                        )}
                    </CardTitle>
                </CardHeader>
            </Card>

            {/* Main Content */}
            <div
                className={`transition-all duration-500 ease-in-out ${isOpen
                    ? "max-h-none opacity-100 overflow-visible"
                    : "max-h-0 opacity-0 overflow-hidden"
                    }`}
            >
                <div className={`transition-all duration-700 ease-in-out ${showResults
                    ? "flex flex-col md:grid md:grid-cols-2 gap-6"
                    : "grid grid-cols-1"
                    }`}>

                    {/* Input Section */}
                    <Card className={`transition-all duration-700 ease-in-out ${showResults ? "md:transform md:-translate-x-0" : ""} order-1`}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">{t("productDetail.virtualFitting.imageUpload") || "Image Upload"}</CardTitle>
                            {showResults && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetComponent}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Model Image */}
                                    <div className="flex flex-col space-y-3">
                                        <div className="w-full aspect-[9/16] min-h-[400px] max-h-[500px]">
                                            <FileDropzone
                                                onDrop={handleFileChange}
                                                preview={modelPreview}
                                                label={t("productDetail.virtualFitting.modelImage") || "모델 이미지"}
                                                required
                                                description="전신 사진을 권장합니다"
                                                sampleImages={hairColorSamples}
                                                onSampleSelect={handleSampleSelect}
                                                selectedSampleSrc={selectedSampleSrc}
                                                onClear={() => handleFileChange(null)}
                                                type="model"
                                            />
                                        </div>
                                    </div>

                                    {/* Color Selection */}
                                    <div className="flex flex-col space-y-3">
                                        <h3 className="text-sm font-semibold">염색 색상 선택</h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            {colorPalette.map((color) => (
                                                <button
                                                    key={color.hex}
                                                    onClick={() => setSelectedColor(color.hex)}
                                                    className={`relative aspect-square rounded-lg border-2 transition-all ${selectedColor === color.hex
                                                        ? "border-orange-500 scale-110 shadow-lg"
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                    style={{ backgroundColor: color.hex }}
                                                    title={color.name}
                                                >
                                                    {selectedColor === color.hex && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                                                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">선택된 색상:</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div
                                                    className="w-8 h-8 rounded border border-gray-300"
                                                    style={{ backgroundColor: selectedColor }}
                                                />
                                                <span className="font-medium text-sm">{selectedColor}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                                    onClick={handleGenerate}
                                    disabled={!modelPreview || isGenerating}
                                >
                                    {isGenerating ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {t("productDetail.virtualFitting.processing") || "Processing..."}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            염색 이미지 생성
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Result Section */}
                    {showResults && (
                        <Card className="order-2 transition-all duration-700 ease-in-out animate-in fade-in slide-in-from-right-4">
                            <CardContent className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-6">
                                {generatedImage ? (
                                    <div className="relative w-full h-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                                        <Image
                                            src={generatedImage}
                                            alt="Generated Dyeing Result"
                                            fill
                                            className="object-contain bg-white"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400 flex flex-col items-center">
                                        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center animate-pulse">
                                            <Sparkles className="w-8 h-8 text-gray-300" />
                                        </div>

                                    </div>
                                )}
                            </CardContent>
                            {/* Generated Video */}
                            {generatedVideo && (
                                <div className="px-6 pb-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-700">Generated Video</h3>
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                            6s • 9:16 • 720p
                                        </Badge>
                                    </div>
                                    <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden shadow-lg bg-black">
                                        <video
                                            src={generatedVideo}
                                            controls
                                            preload="metadata"
                                            playsInline
                                            loop
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Video Generation Button */}
                            {generatedImage && (
                                <div className="px-6 pb-6">
                                    <Button
                                        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                                        onClick={handleGenerateVideo}
                                        disabled={isGeneratingVideo}
                                    >
                                        {isGeneratingVideo ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                {generatedVideo ? "Regenerating Video..." : "Generating Video..."}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Play className="w-4 h-4" />
                                                {generatedVideo ? "Regenerate Head Rotation Video" : "Generate Head Rotation Video"}
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
