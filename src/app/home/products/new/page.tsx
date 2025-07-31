"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";

// Accordion Components
const AccordionItem = ({ value, trigger, children }: { value: string; trigger: React.ReactNode; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(value === "basic" || value === "price");

  return (
    <div className="border rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{trigger}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
};

// Basic Info Section
const BasicInfoSection = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="productName">상품명 *</Label>
          <Input id="productName" placeholder="상품명을 입력하세요..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="productCode">상품코드</Label>
          <Input id="productCode" placeholder="상품코드를 입력하세요..." />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">상품설명</Label>
        <Textarea 
          id="description" 
          placeholder="상품설명을 입력하세요..."
          rows={4}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">카테고리 *</Label>
          <Select>
            <option value="">카테고리를 선택하세요</option>
            <option value="clothing">의류</option>
            <option value="shoes">신발</option>
            <option value="bags">가방</option>
            <option value="accessories">액세서리</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">브랜드</Label>
          <Input id="brand" placeholder="브랜드를 입력하세요..." />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">태그</Label>
        <Input id="tags" placeholder="태그를 입력하세요..." />
      </div>
    </div>
  );
};

// Price and Inventory Section
const SalesInfoSection = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price">판매가 *</Label>
          <Input id="price" type="number" placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="originalPrice">원가</Label>
          <Input id="originalPrice" type="number" placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">재고 *</Label>
          <Input id="stock" type="number" placeholder="0" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sku">상품코드</Label>
          <Input id="sku" placeholder="상품코드를 입력하세요..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">무게 (그램)</Label>
          <Input id="weight" type="number" placeholder="0" />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="trackInventory" defaultChecked />
        <Label htmlFor="trackInventory">재고 관리</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="allowBackorder" />
        <Label htmlFor="allowBackorder">재고 부족 시 주문 허용</Label>
      </div>
    </div>
  );
};

// Media Section
const ProductMediaSection = () => {
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>상품 이미지</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Label htmlFor="imageUpload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500">이미지 업로드</span>
            </Label>
            <input
              id="imageUpload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            PNG, JPG, GIF 최대 10MB
          </p>
        </div>
      </div>
      
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="videoUrl">비디오 URL</Label>
        <Input id="videoUrl" placeholder="https://youtube.com/..." />
      </div>
    </div>
  );
};

// Visibility Section
const VisibilitySection = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox id="isActive" defaultChecked />
        <Label htmlFor="isActive">상품 표시</Label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="publishDate">출시 날짜</Label>
          <Input id="publishDate" type="datetime-local" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">만료 날짜</Label>
          <Input id="expiryDate" type="datetime-local" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="seoTitle">SEO 제목</Label>
        <Input id="seoTitle" placeholder="SEO 제목을 입력하세요..." />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="seoDescription">SEO 설명</Label>
        <Textarea 
          id="seoDescription" 
          placeholder="SEO 설명을 입력하세요..."
          rows={3}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="featured" />
        <Label htmlFor="featured">추천 상품</Label>
      </div>
    </div>
  );
};

export default function NewProductPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("상품 생성 기능은 데모 전용입니다!");
  };

  return (
    <div className="p-6 h-full overflow-y-auto  space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
       
          <div>
            <h1 className="text-2xl font-bold text-gray-900">상품 생성</h1>
            <p className="text-sm text-gray-600">상품을 추가하세요</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="max-w-8xl py-2 px-2">
          {/* Accordion Sections */}
          <AccordionItem value="basic" trigger="📝 기본 정보">
            <BasicInfoSection />
          </AccordionItem>

          <AccordionItem value="price" trigger="💰 가격 및 재고">
            <SalesInfoSection />
          </AccordionItem>

          <AccordionItem value="media" trigger="📷 이미지 및 비디오">
            <ProductMediaSection />
          </AccordionItem>

          <AccordionItem value="visibility" trigger="👁️ 표시">
            <VisibilitySection />
          </AccordionItem>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-6 border-t">
          <Button type="submit" className="bg-gray-600 hover:bg-gray-700 text-white">
            상품 생성
          </Button>
        </div>
      </form>
    </div>
  );
} 