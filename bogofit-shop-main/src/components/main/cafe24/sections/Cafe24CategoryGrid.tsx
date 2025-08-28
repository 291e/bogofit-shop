"use client";

import React from "react";
import { categories } from "@/contents/Category/categories";

export function Cafe24CategoryGrid() {
  return (
    <section className="relative overflow-hidden py-10 bg-gradient-to-b from-white to-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-8 right-[12%] h-60 w-60 rounded-full bg-blue-300/15 blur-[90px]" />
        <div className="absolute bottom-10 left-[12%] h-60 w-60 rounded-full bg-indigo-300/10 blur-[90px]" />
      </div>
      <div className="relative container mx-auto px-4">
        {/* 헤더 (작게) */}
        <div className="mb-6">
          <div className="flex items-center gap-3 justify-center">
            <span className="h-1.5 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            <h3 className="text-sm font-semibold tracking-wide text-gray-700">
              카테고리 둘러보기
            </h3>
            <span className="h-1.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" />
          </div>
        </div>

        {/* 카테고리 그리드 - 반응형 최적화 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {categories.map((category) => (
            <a
              key={category.id}
              href={category.href}
              className="group flex flex-col items-center p-2 rounded-3xl transition-all duration-300 hover:bg-white/70 focus:bg-white/70 focus:outline-none"
              aria-label={`${category.name} 카테고리로 이동`}
            >
              {/* 카테고리 이미지 컨테이너 */}
              <div className="relative mb-3 transform transition-all duration-300 group-hover:scale-105 group-active:scale-95">
                {/* 배경 원형 */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm group-hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.backgroundColor = "#f3f4f6";
                      target.style.display = "flex";
                      target.style.alignItems = "center";
                      target.style.justifyContent = "center";
                      target.innerHTML = `<span style=\"color: #9ca3af; font-size: 12px;\">${category.name}</span>`;
                    }}
                  />

                  {/* 호버 오버레이 */}
                  <div className="pointer-events-none absolute inset-0 bg-blue-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* 특별 카테고리 배지 */}
                {category.special && (
                  <div className="pointer-events-none absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 shadow-md sm:h-5 sm:w-5">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                )}
              </div>

              {/* 카테고리명 */}
              <span className="max-w-[80px] text-center text-sm font-medium leading-tight text-gray-800 transition-colors duration-200 group-hover:text-blue-600 sm:max-w-[100px] sm:text-base">
                {category.name}
              </span>
            </a>
          ))}
        </div>

        {/* 추가 설명 텍스트 - 모바일에서는 숨김 */}
        <div className="mt-6 hidden text-center sm:block">
          <p className="text-sm text-gray-500">원하는 스타일을 빠르게 찾아보세요</p>
        </div>
      </div>
    </section>
  );
}
