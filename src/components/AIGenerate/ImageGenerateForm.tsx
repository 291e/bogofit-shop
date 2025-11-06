"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAIImageGeneration } from "@/hooks/useAIImageGeneration";
import { Upload, Download, Loader2 } from "lucide-react";
import Image from "next/image";

export function ImageGenerateForm() {
    const [baseImage, setBaseImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [prompt, setPrompt] = useState("");
    const [productName, setProductName] = useState("");
    const [generatedImage, setGeneratedImage] = useState<string>("");

    const { generateImage, isGenerating, error } = useAIImageGeneration();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBaseImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!baseImage) {
            alert("이미지를 업로드해주세요.");
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target?.result as string;

                const result = await generateImage({
                    baseImage: base64,
                    prompt: prompt || undefined,
                    productName: productName || undefined,
                });

                if (result.success && result.imageUrl) {
                    setGeneratedImage(result.imageUrl);
                }
            };
            reader.readAsDataURL(baseImage);
        } catch (err) {
            console.error("Image generation error:", err);
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
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="baseImage">기본 이미지</Label>
                <div className="relative">
                    <Input
                        id="baseImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-700">
                            {preview ? "이미지 선택됨" : "파일을 선택하거나 드래그하여 업로드하세요"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">지원 형식: JPG, PNG, WEBP</p>
                    </div>
                </div>
                {preview && (
                    <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="productName">제품명 (선택사항)</Label>
                <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="제품명을 입력하세요"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="prompt">프롬프트 (선택사항)</Label>
                <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="생성할 이미지에 대한 설명을 입력하세요"
                    rows={4}
                />
            </div>

            <Button
                onClick={handleGenerate}
                disabled={!baseImage || isGenerating}
                className="w-full"
                size="lg"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        생성 중...
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4 mr-2" />
                        이미지 생성
                    </>
                )}
            </Button>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                        오류: {error instanceof Error ? error.message : "알 수 없는 오류"}
                    </p>
                </div>
            )}

            {generatedImage && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">생성된 이미지</h3>
                    <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border">
                        <Image
                            src={generatedImage}
                            alt="Generated"
                            fill
                            className="object-contain"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white"
                            onClick={() => {
                                const filename = `ai-generated-image-${Date.now()}.png`;
                                downloadFile(generatedImage, filename);
                            }}
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

