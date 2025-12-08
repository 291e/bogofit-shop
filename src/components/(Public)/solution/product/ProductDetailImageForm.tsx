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
    const [description, setDescription] = useState("");
    const [basePrice, setBasePrice] = useState<number>(0);
    const [comparePrice, setComparePrice] = useState<number>(0);
    const [sizes, setSizes] = useState<string[]>([""]);
    const [colors, setColors] = useState<string[]>([""]);
    const [sizeCharts, setSizeCharts] = useState<string[]>([""]);

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



    // New state for multiple images
    const [generatedImages, setGeneratedImages] = useState<{ type: string, url: string }[]>([]);

    const generateAllImages = async (base64: string, infoPrompt: string) => {
        setGeneratedImages([]); // Clear previous

        const types = [
            { id: 'hero', label: 'Hero Image' },
            { id: 'features', label: 'Features' },
            { id: 'lifestyle', label: 'Lifestyle' },
            { id: 'info', label: 'Info & Size', prompt: infoPrompt }
        ];

        // Fire requests in parallel
        const promises = types.map(async (type) => {
            try {
                const result = await generateImage({
                    baseImage: base64,
                    prompt: type.prompt || "", // Info needs specific text, others use default templates in backend
                    productName: productName,
                    aspectRatio: type.id, // Pass type as aspect ratio to trigger specific prompt
                });

                if (result.success && result.imageUrl) {
                    setGeneratedImages(prev => {
                        const newImages = [...prev, { type: type.label, url: result.imageUrl! }];
                        // Sort by fixed order
                        const order = ['Hero Image', 'Features', 'Lifestyle', 'Info & Size'];
                        return newImages.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
                    });
                }
            } catch (error) {
                console.error(`Failed to generate ${type.label}:`, error);
            }
        });

        await Promise.all(promises);
    };

    // Updated handleGenerate
    const handleGenerateClick = async () => {
        if (!baseImage) {
            alert("이미지를 업로드해주세요.");
            return;
        }

        // Build text content for Info image
        const textSections: string[] = [];
        if (productName) textSections.push(`제품명: ${productName}`);
        if (description) textSections.push(`설명: ${description}`);

        // Add price information
        if (basePrice > 0) {
            textSections.push(`가격: ₩${basePrice.toLocaleString()}`);
            if (comparePrice > 0) {
                textSections.push(`정가: ₩${comparePrice.toLocaleString()}`);
            }
        }

        // Add sizes
        if (sizes.filter(s => s.trim()).length > 0) {
            textSections.push(`사이즈: ${sizes.filter(s => s.trim()).join(', ')}`);
        }

        // Add colors
        if (colors.filter(c => c.trim()).length > 0) {
            textSections.push(`색상: ${colors.filter(c => c.trim()).join(', ')}`);
        }

        // Add size charts
        if (sizeCharts.filter(sc => sc.trim()).length > 0) {
            textSections.push(`사이즈 차트:\n${sizeCharts.filter(sc => sc.trim()).map(sc => `• ${sc}`).join('\n')}`);
        }

        const infoPrompt = textSections.join('\n');

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            await generateAllImages(base64, infoPrompt);
        };
        reader.readAsDataURL(baseImage);
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

    const handleLoadSampleData = () => {
        setProductName("립드 탱크탑");
        setDescription("편안한 착용감의 립드 니트 탱크탑입니다. 데일리룩으로 활용하기 좋습니다.");
        setBasePrice(29000);
        setComparePrice(39000);
        setSizes(["S", "M", "L", "XL"]);
        setColors(["블랙", "화이트", "베이지"]);
        setSizeCharts([
            "S: 가슴 88cm, 어깨 42cm, 총장 60cm",
            "M: 가슴 92cm, 어깨 44cm, 총장 62cm",
            "L: 가슴 96cm, 어깨 46cm, 총장 64cm"
        ]);
    };

    const handleClearForm = () => {
        setBaseImage(null);
        setPreview("");
        setProductName("");
        setDescription("");
        setBasePrice(0);
        setComparePrice(0);
        setSizes([""]);
        setColors([""]);
        setSizeCharts([""]);
        setGeneratedImages([]);
    };

    return (
        <div className="space-y-6">
            {/* ... Header and Inputs (unchanged) ... */}
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
                <Label htmlFor="description">제품 설명 (선택사항)</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="제품에 대한 설명을 입력하세요"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="basePrice">판매 가격 (선택사항)</Label>
                    <Input
                        id="basePrice"
                        type="number"
                        value={basePrice || ''}
                        onChange={(e) => setBasePrice(Number(e.target.value))}
                        placeholder="₩29,000"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="comparePrice">정가 (선택사항)</Label>
                    <Input
                        id="comparePrice"
                        type="number"
                        value={comparePrice || ''}
                        onChange={(e) => setComparePrice(Number(e.target.value))}
                        placeholder="₩39,000"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>색상 정보 (선택사항)</Label>
                <div className="space-y-2">
                    {colors.map((color, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                type="text"
                                value={color}
                                onChange={(e) => {
                                    const newColors = [...colors];
                                    newColors[index] = e.target.value;
                                    setColors(newColors);
                                }}
                                placeholder="예: 블랙, 화이트, 베이지"
                            />
                            {colors.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        const newColors = colors.filter((_, i) => i !== index);
                                        setColors(newColors);
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
                        onClick={() => setColors([...colors, ""])}
                        className="w-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        색상 추가
                    </Button>
                </div>
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
            {(productName || description || basePrice > 0 || sizes.filter(s => s.trim()).length > 0 || colors.filter(c => c.trim()).length > 0 || sizeCharts.filter(sc => sc.trim()).length > 0) && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">입력 정보 미리보기</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        {productName && (
                            <div>
                                <span className="font-medium">제품명:</span> {productName}
                            </div>
                        )}
                        {description && (
                            <div>
                                <span className="font-medium">설명:</span> {description}
                            </div>
                        )}
                        {basePrice > 0 && (
                            <div>
                                <span className="font-medium">가격:</span> ₩{basePrice.toLocaleString()}
                                {comparePrice > 0 && <span className="text-gray-400 line-through ml-2">₩{comparePrice.toLocaleString()}</span>}
                            </div>
                        )}
                        {colors.filter(c => c.trim()).length > 0 && (
                            <div>
                                <span className="font-medium">색상:</span> {colors.filter(c => c.trim()).join(', ')}
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
                onClick={handleGenerateClick}
                disabled={!baseImage || !productName || isGenerating}
                className="w-full"
                size="lg"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        상세 이미지 세트 생성 중 (4장)...
                    </>
                ) : (
                    <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        상세 이미지 세트 생성 (Hero, Features, Lifestyle, Info)
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

            {generatedImages.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">생성된 상세 이미지 세트 ({generatedImages.length}/4)</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                generatedImages.forEach((img, index) => {
                                    setTimeout(() => {
                                        downloadFile(img.url, `product-detail-${img.type.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`);
                                    }, index * 500);
                                });
                            }}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            전체 다운로드
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {generatedImages.map((img, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm text-gray-700">{img.type}</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 px-2"
                                        onClick={() => {
                                            const filename = `product-detail-${img.type.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
                                            downloadFile(img.url, filename);
                                        }}
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border bg-gray-50 shadow-sm">
                                    <Image
                                        src={img.url}
                                        alt={img.type}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
