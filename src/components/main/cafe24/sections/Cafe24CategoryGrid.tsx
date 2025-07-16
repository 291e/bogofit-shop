"use client";

import React from "react";
import { categories } from "@/contents/Category/categories";

export function Cafe24CategoryGrid() {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        {/* 카테고리 그리드 - 반응형 최적화 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {categories.map((category) => (
            <a
              key={category.id}
              href={category.href}
              className="group flex flex-col items-center p-2 rounded-3xl transition-all duration-300 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none "
              aria-label={`${category.name} 카테고리로 이동`}
            >
              {/* 카테고리 이미지 컨테이너 */}
              <div className="relative mb-3 transform transition-all duration-300 group-hover:scale-105 group-active:scale-95">
                {/* 배경 원형 */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm group-hover:shadow-lg transition-all duration-300 overflow-hidden relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      // 이미지 로드 실패시 기본 스타일
                      const target = e.currentTarget;
                      target.style.backgroundColor = "#f3f4f6";
                      target.style.display = "flex";
                      target.style.alignItems = "center";
                      target.style.justifyContent = "center";
                      target.innerHTML = `<span style="color: #9ca3af; font-size: 12px;">${category.name}</span>`;
                    }}
                  />

                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* 특별 카테고리 배지 */}
                {category.special && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md pointer-events-none">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                )}
              </div>

              {/* 카테고리명 */}
              <span className="text-sm sm:text-base font-medium text-gray-800 text-center leading-tight max-w-[80px] sm:max-w-[100px] group-hover:text-blue-600 transition-colors duration-200">
                {category.name}
              </span>
            </a>
          ))}
        </div>

        {/* 추가 설명 텍스트 - 모바일에서는 숨김 */}
        <div className="hidden sm:block text-center mt-6">
          <p className="text-sm text-gray-500">
            원하는 스타일을 빠르게 찾아보세요
          </p>
        </div>
      </div>
    </section>
  );
}
