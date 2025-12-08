"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/languageProvider";
import {
    hairColorSamples,
    hairSamples,
} from "@/contents/VirtualFitting/sampleImages";
import Image from "next/image";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { ChevronUp, ChevronDown, X, Sparkles, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";

interface HairFittingProps {
    onResultGenerated?: (resultImage: string) => void;
}

export default function HairFitting({ onResultGenerated }: HairFittingProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(true);
    const [showResults, setShowResults] = useState(false);

    // State for files
    const [files, setFiles] = useState<{
        model: File | null;
        hair: File | null;
    }>({
        model: null,
        hair: null,
    });

    // State for previews
    const [previews, setPreviews] = useState<{
        model: string;
        hair: string;
    }>({
        model: "",
        hair: "",
    });

    // State for selected sample source URLs
    const [selectedSampleSrcs, setSelectedSampleSrcs] = useState<{
        model: string;
        hair: string;
    }>({
        model: "",
        hair: "",
    });


    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedImage, setGeneratedImage] = useState("");

    // Video generation states
    const [generatedVideo, setGeneratedVideo] = useState("");
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const videoGeneration = useVideoGeneration();


    // Helper to validate file
    const validateFile = (file: File): string => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return t("productDetail.virtualFitting.unsupportedFormat");
        }
        return "";
    };

    // Handle file changes (upload or drop)
    const handleFileChange = (fieldName: keyof typeof files, file: File | null) => {
        if (file) {
            const error = validateFile(file);
            if (error) {
                alert(error);
                return;
            }

            setFiles((prev) => ({ ...prev, [fieldName]: file }));

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews((prev) => ({
                    ...prev,
                    [fieldName]: e.target?.result as string,
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setFiles((prev) => ({ ...prev, [fieldName]: null }));
            setPreviews((prev) => ({ ...prev, [fieldName]: "" }));
            setSelectedSampleSrcs((prev) => ({ ...prev, [fieldName]: "" }));
        }
    };

    // Handle sample selection
    const handleSampleSelect = (fieldName: keyof typeof files, imageSrc: string) => {
        setPreviews((prev) => ({ ...prev, [fieldName]: imageSrc }));
        setSelectedSampleSrcs((prev) => ({ ...prev, [fieldName]: imageSrc }));
    };



    const handleGenerate = async () => {
        const hasModel = files.model || previews.model;
        const hasHair = files.hair || previews.hair;

        if (!hasModel || !hasHair) {
            alert(t("productDetail.virtualFitting.uploadModelAndHair") || "Please select both model and hair style.");
            return;
        }

        setIsProcessing(true);
        setShowResults(true);
        setGeneratedVideo(""); // Reset video state when generating new image

        try {
            const formData = new FormData();

            // Handle Model Image
            if (files.model) {
                formData.append('personImage', files.model);
            } else if (previews.model) {
                try {
                    const response = await fetch(previews.model);
                    const blob = await response.blob();
                    formData.append('personImage', blob, 'model.png');
                } catch (e) {
                    console.error("Error fetching model image:", e);
                    alert("Failed to load model image.");
                    setIsProcessing(false);
                    return;
                }
            }

            // Handle Hair Image
            if (files.hair) {
                formData.append('hairImage', files.hair);
            } else if (previews.hair) {
                try {
                    const response = await fetch(previews.hair);
                    const blob = await response.blob();
                    formData.append('hairImage', blob, 'hair.png');
                } catch (e) {
                    console.error("Error fetching hair image:", e);
                    alert("Failed to load hair image.");
                    setIsProcessing(false);
                    return;
                }
            }

            // Call the API
            const response = await fetch('/api/ai/hair-style', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to generate image');
            }

            setGeneratedImage(result.imageUrl);
            if (onResultGenerated) {
                onResultGenerated(result.imageUrl);
            }

        } catch (error) {
            console.error("Error generating hair style:", error);
            alert(t("productDetail.virtualFitting.imageGenerationFailed") || "Failed to generate image. Please try again.");
        } finally {
            setIsProcessing(false);
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
        setIsProcessing(false);
        setIsGeneratingVideo(false);
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Header Card */}
            <Card
                className="mb-6 py-4"
                style={{
                    background: "linear-gradient(270deg, #A78BFA, #FBCFE8)", // Different gradient for Hair Solution
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
                            <div className="w-8 h-8 bg-gradient-to-r from-[#A78BFA] to-[#FBCFE8] rounded-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            {t("ui.solution.fashion.hairFitting") || "Hair Style Solution"}
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
                                                onDrop={(file) => handleFileChange("model", file)}
                                                preview={previews.model}
                                                label={t("productDetail.virtualFitting.modelImage") || "Model Image"}
                                                required
                                                description={t("productDetail.virtualFitting.fullBodyPhotoRecommended") || "Full body photo recommended"}
                                                sampleImages={hairColorSamples}
                                                onSampleSelect={(imageSrc) => handleSampleSelect("model", imageSrc)}
                                                onClear={() => handleFileChange("model", null)}
                                                type="model"
                                                selectedSampleSrc={selectedSampleSrcs.model}
                                            />
                                        </div>
                                    </div>

                                    {/* Hair Dropzone */}
                                    <div className="flex flex-col space-y-3">
                                        <div className="w-full aspect-[9/16] min-h-[400px] max-h-[500px]">
                                            <FileDropzone
                                                onDrop={(file) => handleFileChange("hair", file)}
                                                preview={previews.hair}
                                                label={t("ui.solution.fashion.hairImage") || "Hair Style Image"}
                                                required
                                                description={t("ui.solution.fashion.hairImageDescription") || "Select a hair style sample"}
                                                sampleImages={hairSamples}
                                                onSampleSelect={(imageSrc) => handleSampleSelect("hair", imageSrc)}
                                                onClear={() => handleFileChange("hair", null)}
                                                type="clothing"
                                                solutionType="hair"
                                                selectedSampleSrc={selectedSampleSrcs.hair}
                                            />
                                        </div>

                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                                    onClick={handleGenerate}
                                    disabled={(!files.model && !previews.model) || (!files.hair && !previews.hair) || isProcessing}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {t("productDetail.virtualFitting.processing") || "Processing..."}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            {t("productDetail.virtualFitting.startVirtualFitting") || "Start Fitting"}
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Result Section */}
                    {showResults && (
                        <Card className="order-2 transition-all duration-700 ease-in-out animate-in fade-in slide-in-from-right-4">
                            <CardContent className="space-y-4 p-6">
                                {/* Generated Image */}
                                <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
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
                                </div>

                                {/* Generated Video */}
                                {generatedVideo && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-gray-700">Generated Video</h3>
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                                6s • 9:16 • 720p
                                            </Badge>
                                        </div>
                                        <div className="relative w-full aspect-[9/16] max-w-md mx-auto rounded-lg overflow-hidden shadow-lg bg-black">
                                            <video
                                                src={generatedVideo}
                                                controls
                                                autoPlay
                                                loop
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Video Generation Button (Always at bottom) */}
                                {generatedImage && (
                                    <Button
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md transition-all duration-300 transform hover:scale-[1.02]"
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
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 