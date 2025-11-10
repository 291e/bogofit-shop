"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAIImageGeneration } from "@/hooks/useAIImageGeneration";
import { Upload, Download, Loader2, Image as ImageIcon, Plus, X, Trash2, FileText } from "lucide-react";
import Image from "next/image";

export function ProductDetailImageForm() {
    const [baseImage, setBaseImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [productName, setProductName] = useState("");
    const [sizes, setSizes] = useState<string[]>([""]);
    const [sizeCharts, setSizeCharts] = useState<string[]>([""]);
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
            // Build text content sections
            const textSections: string[] = [];

            if (productName) {
                textSections.push(`Product Name: ${productName}`);
            }

            if (sizes.filter(s => s.trim()).length > 0) {
                textSections.push(`Size Information: ${sizes.filter(s => s.trim()).join(', ')}`);
            }

            if (sizeCharts.filter(sc => sc.trim()).length > 0) {
                textSections.push(`Size Chart:\n${sizeCharts.filter(sc => sc.trim()).map(sc => `• ${sc}`).join('\n')}`);
            }

            const detailPrompt = `TASK: Create a professional product detail image based on the uploaded base image.

CRITICAL - USE THE BASE IMAGE AS FOUNDATION:
- You MUST use the uploaded base image as the foundation to create the detail image
- The product in the base image MUST appear EXACTLY the same in the output detail image
- Same design, same colors, same style, same details, same shape, same proportions
- DO NOT modify, recreate, or change the product from the base image
- The product image should be IDENTICAL to the base image
- Only add text information BELOW or AROUND the product, never modify the product itself

FORMAT:
- Vertical long banner: width 1000px, height minimum 2000px

CRITICAL - TEXT LANGUAGE REQUIREMENT:
- ALL text in the image MUST be in English ONLY
- NO Korean text (한국어) allowed
- NO other languages allowed
- All section headers, labels, and information must be written in English
- Use English text for everything displayed in the image

LAYOUT STRUCTURE (arrange vertically from top to bottom with proper spacing):

1. TOP SECTION - Product Image from Base Image (40-50% of total height):
   - Display the EXACT product from the uploaded base image at the top
   - Use the product image from the base image unchanged and identical
   - Clean white or light gray background
   - Product should be clearly visible, centered, and unchanged from the base image
   - Generous padding around the product image
   - Professional product photography style

2. TEXT INFORMATION SECTION (50-60% of total height, ALL IN ENGLISH):
${textSections.length > 0 ? `   - Below the product image, create a well-organized text section with proper spacing
   - Add generous padding and spacing between sections
   - Use clear visual hierarchy with section headers and content
   - Display the following information in clean English text ONLY:
${textSections.map(section => `   ${section}`).join('\n\n')}
   - Each text section should have proper spacing and visual separation
   - Use professional typography with clear hierarchy` : '   - (No additional text information provided)'}

DESIGN GUIDELINES (for beautiful layout):
- Clean white or light gray background throughout
- Professional e-commerce style (like Uniqlo, Zara, H&M)
- Generous padding and margins throughout (at least 60-80px on sides, 40-60px between sections)
- Clear visual hierarchy:
  * Section headers: Bold, larger font size (24-32px)
  * Content text: Clear, readable font size (16-18px)
  * Proper line spacing and letter spacing
- Balanced composition: Product image takes 40-50% of height, text section takes 50-60%
- Center-aligned or left-aligned text with proper margins
- Subtle section dividers or spacing between different text sections
- Professional typography with good contrast
- Clean, minimal, and elegant design
- ALL text must be in English - clear, readable English text only
no
REMEMBER: 
- Use the base image as the foundation - the product must be IDENTICAL to the base image
- Only add text below the product image, never modify the product itself
- ALL text in the image must be in English ONLY - no Korean or other languages
- Create a professional product detail image based on the base image`;

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target?.result as string;

                const result = await generateImage({
                    baseImage: base64,
                    prompt: detailPrompt,
                    // Don't pass productName to avoid AI recreating the product
                    aspectRatio: "9:16",
                });

                if (result.success && result.imageUrl) {
                    setGeneratedImage(result.imageUrl);
                }
            };
            reader.readAsDataURL(baseImage);
        } catch (err) {
            console.error("Detail image generation error:", err);
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

    const handleClearForm = () => {
        setBaseImage(null);
        setPreview("");
        setProductName("");
        setSizes([""]);
        setSizeCharts([""]);
        setGeneratedImage("");
    };

    const handleLoadSampleData = () => {
        setProductName("립드 탱크탑");
        setSizes(["S", "M", "L", "XL"]);
        setSizeCharts([
            "S: 가슴 88cm, 어깨 42cm, 총장 60cm",
            "M: 가슴 92cm, 어깨 44cm, 총장 62cm",
            "L: 가슴 96cm, 어깨 46cm, 총장 64cm"
        ]);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">상세 이미지 생성</h2>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLoadSampleData}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        샘플 데이터 로드
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearForm}
                        className="text-gray-600"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        초기화
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="baseImage">제품 이미지 <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="productName">제품명 <span className="text-red-500">*</span></Label>
                <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="예: 립드 탱크탑"
                />
            </div>

            <div className="space-y-2">
                <Label>사이즈 정보 (선택사항)</Label>
                <div className="space-y-2">
                    {sizes.map((size, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                type="text"
                                value={size}
                                onChange={(e) => {
                                    const newSizes = [...sizes];
                                    newSizes[index] = e.target.value;
                                    setSizes(newSizes);
                                }}
                                placeholder="예: S, M, L, XL 또는 90, 95, 100, 105"
                            />
                            {sizes.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        const newSizes = sizes.filter((_, i) => i !== index);
                                        setSizes(newSizes);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSizes([...sizes, ""])}
                        className="w-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        사이즈 정보 추가
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label>사이즈 차트 (선택사항)</Label>
                <div className="space-y-2">
                    {sizeCharts.map((sizeChart, index) => (
                        <div key={index} className="flex gap-2">
                            <Textarea
                                value={sizeChart}
                                onChange={(e) => {
                                    const newSizeCharts = [...sizeCharts];
                                    newSizeCharts[index] = e.target.value;
                                    setSizeCharts(newSizeCharts);
                                }}
                                placeholder="사이즈 차트 정보를 입력하세요&#10;예: S: 가슴 88cm, 어깨 42cm, 소매 58cm"
                                rows={3}
                                className="flex-1"
                            />
                            {sizeCharts.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        const newSizeCharts = sizeCharts.filter((_, i) => i !== index);
                                        setSizeCharts(newSizeCharts);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSizeCharts([...sizeCharts, ""])}
                        className="w-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        사이즈 차트 추가
                    </Button>
                </div>
            </div>

            {/* Preview Section */}
            {(productName || sizes.filter(s => s.trim()).length > 0 || sizeCharts.filter(sc => sc.trim()).length > 0) && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">입력 정보 미리보기</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        {productName && (
                            <div>
                                <span className="font-medium">제품명:</span> {productName}
                            </div>
                        )}
                        {sizes.filter(s => s.trim()).length > 0 && (
                            <div>
                                <span className="font-medium">사이즈 정보:</span> {sizes.filter(s => s.trim()).join(', ')}
                            </div>
                        )}
                        {sizeCharts.filter(sc => sc.trim()).length > 0 && (
                            <div>
                                <span className="font-medium">사이즈 차트:</span>
                                <ul className="list-disc list-inside mt-1 ml-2">
                                    {sizeCharts.filter(sc => sc.trim()).map((sc, i) => (
                                        <li key={i}>{sc}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Button
                onClick={handleGenerate}
                disabled={!baseImage || !productName || isGenerating}
                className="w-full"
                size="lg"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        상세 이미지 생성 중...
                    </>
                ) : (
                    <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        상세 이미지 생성
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
                    <h3 className="text-lg font-semibold">생성된 상세 이미지</h3>
                    <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden border">
                        <Image
                            src={generatedImage}
                            alt="Generated Detail"
                            width={1000}
                            height={5000}
                            className="w-full h-auto"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white"
                            onClick={() => {
                                const filename = `product-detail-image-${Date.now()}.png`;
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
