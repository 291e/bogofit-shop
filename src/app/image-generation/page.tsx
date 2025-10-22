'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, Search, Wand2, Edit3 } from 'lucide-react';
import { ImageUploader } from '@/features/imageGeneration/components/imageUploader';
import { GeneratedImagesDisplay } from '@/features/imageGeneration/components/generatedImagesDisplay';
import { ImageAnalysisDisplay } from '@/features/imageGeneration/components/imageAnalysisDisplay';
import { useImageGeneration } from '@/features/imageGeneration/hooks/useImageGeneration';
import { useImageAnalysis } from '@/features/imageGeneration/hooks/useImageAnalysis';
import Image from 'next/image';

export default function ImageGenerationPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [editInstructions, setEditInstructions] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editResult, setEditResult] = useState<{
    success: boolean;
    editedImage?: { id: string; base64: string; instructions: string };
    error?: string;
  } | null>(null);

  const { generateImages, isLoading: isGenerating, images, analysis: genAnalysis } = useImageGeneration();
  const { analyzeImage, isLoading: isAnalyzing, analysis, imageInfo } = useImageAnalysis();

  const handleGenerate = async () => {
    if (!selectedImage) return;
    setEditResult(null);
    await generateImages(selectedImage, numberOfImages);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setEditResult(null);
    await analyzeImage(selectedImage);
  };

  const handleEdit = async () => {
    if (!selectedImage || !editInstructions.trim()) {
      alert('이미지와 편집 지시사항을 모두 입력해주세요.');
      return;
    }

    setIsEditing(true);
    setEditResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('instructions', editInstructions);

      const response = await fetch('/api/image-generation/edit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setEditResult(data);
    } catch (error) {
      setEditResult({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setEditResult(null);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI 이미지 분석, 생성 & 편집
        </h1>
        <p className="text-gray-600 text-lg">
          Gemini AI로 이미지를 분석하고, 유사한 이미지를 생성하거나 편집합니다
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 왼쪽 패널: 입력 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>이미지 업로드</CardTitle>
              <CardDescription>
                분석하거나 유사 이미지를 생성할 이미지를 업로드하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onImageSelect={setSelectedImage}
                selectedImage={selectedImage}
                onClear={handleClear}
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">
                <Wand2 className="h-4 w-4 mr-2" />
                이미지 생성
              </TabsTrigger>
              <TabsTrigger value="edit">
                <Edit3 className="h-4 w-4 mr-2" />
                이미지 편집
              </TabsTrigger>
              <TabsTrigger value="analyze">
                <Search className="h-4 w-4 mr-2" />
                이미지 분석
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>유사 이미지 생성</CardTitle>
                  <CardDescription>
                    업로드된 이미지를 분석하여 유사한 새 이미지를 생성합니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="numberOfImages">
                      생성할 이미지 개수: {numberOfImages}개
                    </Label>
                    <Slider
                      id="numberOfImages"
                      min={1}
                      max={4}
                      step={1}
                      value={[numberOfImages]}
                      onValueChange={(value) => setNumberOfImages(value[0])}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      이미지 생성에는 시간이 걸릴 수 있습니다 (1개당 약 5-15초)
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>💡 참고:</strong> Gemini AI를 사용하여 이미지를 생성합니다.
                      현재 베타 기간 동안 무료로 사용 가능합니다.
                    </p>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!selectedImage || isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        이미지 생성 중... ({numberOfImages}개)
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        유사 이미지 생성
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>이미지 편집</CardTitle>
                  <CardDescription>
                    AI가 지시사항에 따라 이미지를 수정합니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructions">편집 지시사항</Label>
                    <Textarea
                      id="instructions"
                      placeholder="예: 배경을 해변으로 변경하고 석양 분위기를 추가해주세요"
                      value={editInstructions}
                      onChange={(e) => setEditInstructions(e.target.value)}
                      disabled={isEditing}
                      rows={4}
                    />
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>✅ 현재 상태:</strong>
                    </p>
                    <p className="text-xs text-green-700 mb-2">
                      Gemini 2.5 Flash Image 모델을 사용하여 이미지 편집이 가능합니다.
                    </p>
                    <p className="text-xs text-green-700">
                      <strong>기능:</strong> AI가 지시사항에 따라 이미지를 수정합니다.
                    </p>
                  </div>

                  <Button
                    onClick={handleEdit}
                    disabled={!selectedImage || !editInstructions.trim() || isEditing}
                    className="w-full"
                    size="lg"
                  >
                    {isEditing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        이미지 편집 중...
                      </>
                    ) : (
                      <>
                        <Edit3 className="mr-2 h-4 w-4" />
                        이미지 편집
                      </>
                    )}
                  </Button>

                  {isEditing && (
                    <Alert>
                      <AlertDescription>
                        ⏱️ AI가 이미지를 편집하고 있습니다. 잠시만 기다려주세요...
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analyze">
              <Card>
                <CardHeader>
                  <CardTitle>이미지 상세 분석</CardTitle>
                  <CardDescription>
                    업로드된 이미지의 특징, 스타일, 구도 등을 상세히 분석합니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!selectedImage || isAnalyzing}
                    className="w-full"
                    size="lg"
                    variant="secondary"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        이미지 분석 시작
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 오른쪽 패널: 결과 */}
        <div>
          {images.length > 0 && genAnalysis && (
            <GeneratedImagesDisplay
              images={images}
              analysis={genAnalysis}
            />
          )}

          {analysis && imageInfo && (
            <ImageAnalysisDisplay
              analysis={analysis}
              imageInfo={imageInfo}
            />
          )}

          {editResult?.success && editResult.editedImage && (
            <Card>
              <CardHeader>
                <CardTitle>편집된 이미지</CardTitle>
                <CardDescription>AI가 생성한 편집 결과</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <Image
                    src={`data:image/png;base64,${editResult.editedImage.base64}`}
                    alt="Edited"
                    className="w-full h-auto"
                    width={300}
                    height={300}
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    적용된 편집 지시사항:
                  </p>
                  <p className="text-sm text-green-700">
                    {editResult.editedImage.instructions}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `data:image/png;base64,${editResult.editedImage?.base64}`;
                    link.download = `edited-${Date.now()}.png`;
                    link.click();
                  }}
                >
                  이미지 다운로드
                </Button>
              </CardContent>
            </Card>
          )}

          {editResult?.error && (
            <Card>
              <CardContent className="pt-6">
                <Alert variant="destructive">
                  <AlertDescription>{editResult.error}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {images.length === 0 && !analysis && !editResult && (
            <Card className="h-full min-h-[700px] flex items-center justify-center">
              <CardContent className="text-center">
                <Sparkles className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  결과가 여기에 표시됩니다
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  이미지를 업로드하고 기능을 선택하세요
                </p>
                <div className="text-left bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
                  <h4 className="font-semibold text-sm mb-2">🚀 기능 안내:</h4>
                  <ul className="text-xs space-y-1 text-gray-600">
                    <li>• <strong>이미지 생성:</strong> 원본을 분석하여 유사한 새 이미지 생성</li>
                    <li>• <strong>이미지 편집:</strong> 지시사항에 따라 이미지 수정</li>
                    <li>• <strong>이미지 분석:</strong> 이미지의 특징과 스타일 상세 분석</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
