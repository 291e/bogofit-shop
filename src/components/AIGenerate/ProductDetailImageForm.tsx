"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAIImageGeneration } from "@/hooks/useAIImageGeneration";
import { Upload, Download, Loader2, Image as ImageIcon, Plus, X } from "lucide-react";
import Image from "next/image";

export function ProductDetailImageForm() {
    const [baseImage, setBaseImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [sizes, setSizes] = useState<string[]>([""]);
    const [sizeCharts, setSizeCharts] = useState<string[]>([""]);
    const [marketplace, setMarketplace] = useState("");
    const [features, setFeatures] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
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
            let detailPrompt = "";

            if (customPrompt && customPrompt.trim()) {
                detailPrompt = customPrompt;
            } else {
                detailPrompt = `Create a professional, long vertical product detail image (상세 이미지) for a fashion/clothing shop.

CRITICAL REQUIREMENT - YOU MUST FOLLOW THESE EXACTLY:
- YOU MUST USE THE EXACT PRODUCT FROM THE UPLOADED IMAGE - DO NOT CREATE A NEW OR DIFFERENT PRODUCT
- The product in the uploaded image MUST appear EXACTLY as it is - same design, same colors, same style, same details
- DO NOT change, modify, or replace the product from the original image
- DO NOT create a different product - use the SAME product from the uploaded image
- You can resize or reposition the product image, but the product itself must remain IDENTICAL
- Format: Vertical long banner (portrait orientation)
- Dimensions: Width MUST be approximately 1000 pixels, Height MUST be 2000-5000+ pixels (AT LEAST 3-5 times the width)
- The image MUST be a VERY vertical image - ABSOLUTELY NOT a square (1024x1024 is FORBIDDEN)
- The height MUST be at least 3-5 times LONGER than the width - This is a LONG VERTICAL detail image (상세 이미지), NOT a square product image
- Style: Clean, modern, minimalist commerce design like Korean fashion shops
- Layout: Professional product shop with information arranged vertically in sections
- LANGUAGE: ALL TEXT IN THE IMAGE MUST BE IN KOREAN (한국어) - NO ENGLISH TEXT ALLOWED. All labels, headers, and descriptions must be in Korean.

CONTENT SECTION INCLUDE (arrange vertically from top to bottom, ALL TEXT MUST BE IN KOREAN):
${productName ? `1. 제품명: "${productName}" (prominent, stylish typography at top, text must be in Korean)` : ""}
${description ? `2. 제품 설명: "${description}" (detailed description, readable text, all in Korean)` : ""}
${price ? `3. 가격: "${price}" (displayed, attractive formatting, prominent, Korean text format)` : ""}
${sizes.filter(s => s.trim()).length > 0 ? `4. 사이즈 정보: \n${sizes.filter(s => s.trim()).map((s, i) => `   ${i + 1}. ${s}`).join('\n')} (available size options, label in Korean)` : ""}
${sizeCharts.filter(sc => sc.trim()).length > 0 ? `5. 사이즈 차트:\n${sizeCharts.filter(sc => sc.trim()).map((sc, i) => `   ${i + 1}. ${sc}`).join('\n')} (detailed size chart with measurements, label in Korean)` : ""}
${features ? `6. 특징: \n${features.split('\n').map(f => `   • ${f}`).filter(f => f !== '• ').join('\n')} (label must be in Korean)` : ""}
${marketplace ? `7. 판매 지역/시장 정보: "${marketplace}" (where product is sold, market information, label in Korean)` : ""}

DESIGN ELEMENTS:
- Use the EXACT product from the uploaded image - DO NOT create a different product or modify the product design
- The product must appear EXACTLY as shown in the uploaded image - same colors, same design, same style
- You can use the same product image multiple times throughout the vertical layout if needed
- Arrange the product image(s) and information in a seamless, continuous vertical layout
- Each section should be clearly separated with subtle dividers or spacing
- Use soft, clean backgrounds (white, light gray, or subtle tints) around the product
- Professional typography with clear hierarchy - larger text for headings, smaller for details
- Add subtle decorative elements if needed (minimal lines, icons, or patterns) - ensure all text is readable - contrasted
- Create a clean, elegant design that flows vertically from top to bottom
- Style should match premium Korean fashion e-commerce 상세 이미지 (detail images)
- Include size chart measurements, and detailed information organized in a clear manner - price should be prominently displayed
- Marketplace information should be clear and visible - do not clutter or busy - keep it clean and sophisticated
- Each information section should have clear visual separation
- ALL TEXT, LABELS, AND HEADINGS MUST BE IN KOREAN - NO ENGLISH WORDS IN THE IMAGE
- IMPORTANT: The product from the uploaded image must be preserved completely - same appearance, same details, same everything

CRITICAL - ABSOLUTE REQUIREMENTS:
1. YOU MUST USE THE EXACT PRODUCT FROM THE UPLOADED IMAGE - The product must look IDENTICAL to the uploaded image
2. DO NOT create a different product or modify the product design, colors, or style from the original
3. The product appearance must remain EXACTLY the same - only add text information around it
4. The output image MUST be a vertical long banner
5. Width: 1000 pixels (FIXED)
6. Height: 2000 pixels MINIMUM (the longer the better - Height MUST be at least 3-5 times LONGER than width)
7. DO NOT create a square image - 1024x1024 is ABSOLUTELY FORBIDDEN
8. DO NOT create any aspect ratio that results in height less than 2000 pixels
9. This is a LONG VERTICAL detail image (상세 이미지) for Korean fashion e-commerce
10. The image should be a continuous vertical layout with all information arranged vertically from top to bottom
11. ALL TEXT IN THE IMAGE MUST BE IN KOREAN (한국어) - Use Korean labels like "제품명", "제품 설명", "가격", "사이즈 정보", "사이즈 차트", "특징", "판매 지역" etc. NO ENGLISH TEXT ALLOWED.
12. REMEMBER: The product from the uploaded image is the REAL product - use it EXACTLY as shown, do not create a new or different product

The image should look like a professional product detail image (상세 이미지) that you would see on Korean fashion e-commerce websites, with fixed width and long vertical height containing product information in a beautiful vertical layout. The product from the uploaded image must appear EXACTLY as it is - same design, colors, and style. Only add Korean text information around the product. All text must be in Korean language.`;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target?.result as string;

                const result = await generateImage({
                    baseImage: base64,
                    prompt: detailPrompt,
                    productName: productName || undefined,
                    aspectRatio: "9:16", // Vertical long banner aspect ratio (768x1344)
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

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="baseImage">제품 이미지</Label>
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
                <Label htmlFor="productName">제품명</Label>
                <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="제품명을 입력하세요"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">제품 설명</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="제품에 대한 설명을 입력하세요"
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="price">가격 (선택사항)</Label>
                <Input
                    id="price"
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="예: 29,000원"
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

            <div className="space-y-2">
                <Label htmlFor="marketplace">판매 지역/시장 정보 (선택사항)</Label>
                <Input
                    id="marketplace"
                    type="text"
                    value={marketplace}
                    onChange={(e) => setMarketplace(e.target.value)}
                    placeholder="예: 한국 전국 배송, 서울/부산/인천 판매 가능"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="features">특징 (선택사항)</Label>
                <Textarea
                    id="features"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="제품의 주요 특징을 한 줄씩 입력하세요&#10;예:&#10;- 고급 소재 사용&#10;- 편안한 착용감&#10;- 세탁 가능"
                    rows={5}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="customPrompt">프롬프트 (선택사항)</Label>
                <Textarea
                    id="customPrompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="사용자 정의 프롬프트를 입력하세요. 비워두면 기본 프롬프트가 사용됩니다."
                    rows={4}
                />
                <p className="text-xs text-gray-500">
                    프롬프트를 입력하지 않으면 자동으로 제품 정보를 포함한 세로형 상세 이미지가 생성됩니다.
                </p>
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
