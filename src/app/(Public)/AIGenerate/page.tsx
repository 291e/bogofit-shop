"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VirtualFitting from "@/components/(Public)/product/VirtualFitting";
import { ImageGenerateForm } from "@/components/AIGenerate/ImageGenerateForm";
import { ProductDetailImageForm } from "@/components/AIGenerate/ProductDetailImageForm";
import { Sparkles } from "lucide-react";

export default function AIGeneratePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI 생성 도구</h1>
            <p className="text-gray-600 mt-1">AI를 활용한 이미지 생성 도구</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="image">이미지 생성</TabsTrigger>
          <TabsTrigger value="fitting">가상 피팅</TabsTrigger>
          <TabsTrigger value="detail">상세 이미지</TabsTrigger>
        </TabsList>

        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>AI 이미지 생성</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                이미지를 업로드하고 프롬프트를 입력하여 새로운 이미지를 생성합니다.
              </p>
            </CardHeader>
            <CardContent>
              <ImageGenerateForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fitting">
          <Card>
            <CardHeader>
              <CardTitle>가상 피팅</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                모델 이미지와 의류 이미지를 업로드하여 가상 피팅 결과를 확인합니다.
              </p>
            </CardHeader>
            <CardContent>
              <VirtualFitting />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail">
          <Card>
            <CardHeader>
              <CardTitle>상세 이미지 생성</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                제품 이미지와 정보를 입력하여 상세 소개 이미지를 생성합니다.
              </p>
            </CardHeader>
            <CardContent>
              <ProductDetailImageForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

