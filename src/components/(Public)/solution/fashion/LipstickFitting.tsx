"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, X, Sparkles } from "lucide-react";
import { useLanguage } from "@/providers/languageProvider";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { hairColorSamples } from "@/contents/VirtualFitting/sampleImages";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface LipstickFittingProps {
    onResultGenerated?: (resultImage: string) => void;
}

export default function LipstickFitting({ onResultGenerated }: LipstickFittingProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(true);
    const [showResults, setShowResults] = useState(false);

    const [modelFile, setModelFile] = useState<File | null>(null);
    const [modelPreview, setModelPreview] = useState<string>("");
    const [selectedSampleSrc, setSelectedSampleSrc] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("#DC143C");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string>("");

    // Predefined lipstick color palette
    const lipstickColors = [
        { name: "Classic Red", hex: "#DC143C" },
        { name: "Deep Red", hex: "#8B0000" },
        { name: "Pink", hex: "#FF69B4" },
        { name: "Coral", hex: "#FF7F50" },
        { name: "Rose", hex: "#FF007F" },
        { name: "Nude", hex: "#E8B4A0" },
        { name: "Mauve", hex: "#E0B0FF" },
        { name: "Berry", hex: "#8B008B" },
        { name: "Plum", hex: "#8E4585" },
        { name: "Wine", hex: "#722F37" },
        { name: "Orange", hex: "#FF6347" },
        { name: "Brown", hex: "#A0522D" },
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

            formData.append('lipstickColor', selectedColor);

            const response = await fetch("/api/ai/lipstick", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("립스틱 적용 실패");
            }

            const data = await response.json();
            setGeneratedImage(data.imageUrl);
            if (onResultGenerated) {
                onResultGenerated(data.imageUrl);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("립스틱 이미지 생성 중 오류가 발생했습니다");
        } finally {
            setIsGenerating(false);
        }
    };

    const resetComponent = () => {
        setShowResults(false);
        setGeneratedImage("");
        setIsGenerating(false);
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Header Card */}
            <Card
                className="mb-6 py-4"
                style={{
                    background: "linear-gradient(270deg, #EC4899, #F472B6)", // Pink gradient
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
                            <div className="w-8 h-8 bg-gradient-to-r from-[#EC4899] to-[#F472B6] rounded-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            {t("ui.solution.fashion.lipstickFitting") || "Lipstick Solution"}
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
                                    {/* Model Dropzone */}
                                    <div className="flex flex-col space-y-3">
                                        <div className="w-full aspect-[9/16] min-h-[400px] max-h-[500px]">
                                            <FileDropzone
                                                onDrop={handleFileChange}
                                                preview={modelPreview}
                                                label={t("productDetail.virtualFitting.modelImage") || "Model Image"}
                                                required
                                                description={t("productDetail.virtualFitting.fullBodyPhotoRecommended") || "Face photo recommended"}
                                                sampleImages={hairColorSamples}
                                                onSampleSelect={handleSampleSelect}
                                                onClear={() => handleFileChange(null)}
                                                type="model"
                                                selectedSampleSrc={selectedSampleSrc}
                                            />
                                        </div>
                                    </div>

                                    {/* Color Palette */}
                                    <div className="flex flex-col space-y-3">
                                        <label className="text-sm font-medium text-gray-700">
                                            {t("ui.solution.fashion.selectLipstickColor") || "Select Lipstick Color"}
                                        </label>
                                        <div className="grid grid-cols-2 gap-3 content-start">
                                            {lipstickColors.map((color) => (
                                                <button
                                                    key={color.hex}
                                                    onClick={() => setSelectedColor(color.hex)}
                                                    className={`relative group flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${selectedColor === color.hex
                                                        ? "border-pink-500 bg-pink-50 shadow-md"
                                                        : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                                                        }`}
                                                    type="button"
                                                >
                                                    <div
                                                        className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                                                        style={{ backgroundColor: color.hex }}
                                                    />
                                                    <span className="text-xs font-medium text-gray-700 text-center">
                                                        {color.name}
                                                    </span>
                                                    {selectedColor === color.hex && (
                                                        <div className="absolute top-1 right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md transition-all duration-300 transform hover:scale-[1.02]"
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
                                            {t("ui.solution.fashion.applyLipstick") || "Apply Lipstick"}
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
                                            alt="Generated Result"
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
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
