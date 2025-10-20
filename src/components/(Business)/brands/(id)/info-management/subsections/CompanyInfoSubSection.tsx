"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandResponseDto } from "@/types/brand";
import { useBrandContext } from "@/app/business/brands/[id]/layout";
import Image from "next/image";
interface CompanyInfoSubSectionProps {
  brandId?: string;
  className?: string;
}

export default function CompanyInfoSubSection({ className }: CompanyInfoSubSectionProps) {
  const { brand: contextBrand } = useBrandContext();
  const [brand, setBrand] = useState<BrandResponseDto | null>(contextBrand || null);
  const [isLoading, setIsLoading] = useState(false);
  const [_error] = useState<string | null>(null);

  // ✅ Context에서 받은 brand 데이터 사용, 별도 API 호출 불필요
  useEffect(() => {
    if (contextBrand) {
      setBrand(contextBrand);
      setIsLoading(false);
    }
  }, [contextBrand]);

  if (isLoading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">브랜드 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (_error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-red-500 mb-2">오류가 발생했습니다</div>
            <p className="text-gray-600 text-sm">{_error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">업체 정보관리</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              수정
            </Button>
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              내보내기
            </Button>
          </div>
        </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">업체명</label>
                <p className="text-gray-900 font-medium mt-1">{brand?.name || "정보 없음"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">상태</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    brand?.status === 'approved' ? 'bg-green-100 text-green-800' :
                    brand?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    brand?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    brand?.status === 'banned' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {brand?.status === 'approved' ? '승인됨' : 
                     brand?.status === 'pending' ? '대기중' : 
                     brand?.status === 'rejected' ? '거부됨' : 
                     brand?.status === 'banned' ? '차단됨' : 
                     brand?.status || '정보 없음'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">연락처 정보</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-gray-900 mt-1">{brand?.contactEmail || "정보 없음"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">전화번호</label>
                  <p className="text-gray-900 mt-1">{brand?.contactPhone || "정보 없음"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              브랜드 자산
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">로고</label>
              <div className="mt-2">
                {brand?.logoUrl ? (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image 
                      src={brand.logoUrl} 
                      alt="로고" 
                      width={96}
                      height={96}
                      className="w-full h-full object-contain" 
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">커버 이미지</label>
              <div className="mt-2">
                {brand?.coverUrl ? (
                  <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image 
                      src={brand.coverUrl} 
                      alt="커버" 
                      width={1200}
                      height={256}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

   

