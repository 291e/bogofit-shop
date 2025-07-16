"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { heroBannerSlides, heroImageUrls } from "@/contents/Hero/slideImages";

export function Cafe24HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 슬라이드 개수
  const slideCount = heroBannerSlides.length;

  // 이미지 프리로딩
  useEffect(() => {
    const preloadImages = () => {
      heroImageUrls.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
      });
    };

    preloadImages();
  }, []);

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlaying || isTransitioning) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isTransitioning, slideCount]);

  // 슬라이드 변경 함수 (최적화)
  const changeSlide = useCallback(
    (newIndex: number) => {
      if (isTransitioning || newIndex === currentSlide) return;

      setIsTransitioning(true);
      setCurrentSlide(newIndex);

      // 트랜지션 완료 후 상태 리셋
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [currentSlide, isTransitioning]
  );

  const nextSlide = useCallback(() => {
    const newIndex = (currentSlide + 1) % slideCount;
    changeSlide(newIndex);
    setIsAutoPlaying(false);
  }, [currentSlide, slideCount, changeSlide]);

  const prevSlide = useCallback(() => {
    const newIndex = (currentSlide - 1 + slideCount) % slideCount;
    changeSlide(newIndex);
    setIsAutoPlaying(false);
  }, [currentSlide, slideCount, changeSlide]);

  const goToSlide = useCallback(
    (index: number) => {
      changeSlide(index);
      setIsAutoPlaying(false);
    },
    [changeSlide]
  );

  // 자동재생 토글
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev);
  }, []);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          prevSlide();
          break;
        case "ArrowRight":
          event.preventDefault();
          nextSlide();
          break;
        case " ":
          event.preventDefault();
          toggleAutoPlay();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, toggleAutoPlay]);

  // 현재 슬라이드 데이터
  const currentSlideData = useMemo(
    () => heroBannerSlides[currentSlide],
    [currentSlide]
  );

  return (
    <div
      className="relative h-[500px] md:h-[600px] overflow-hidden"
      role="region"
      aria-label="메인 배너 슬라이드"
      tabIndex={0}
    >
      {/* 슬라이드 컨테이너 */}
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        aria-live="polite"
      >
        {heroBannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`min-w-full h-full flex items-center ${slide.backgroundColor} relative`}
            aria-hidden={index !== currentSlide}
          >
            {/* 배경 이미지 */}
            <div className="absolute inset-0 opacity-20">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={slide.priority || index === 0}
                sizes="100vw"
                quality={85}
              />
            </div>

            {/* 컨텐츠 */}
            <div className="container mx-auto px-4 md:px-8 relative z-10">
              <div className={`max-w-2xl ${slide.textColor}`}>
                {/* 할인율 */}
                {slide.discount && (
                  <div className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
                    {slide.discount}
                  </div>
                )}

                {/* 제목 */}
                <h1 className="text-4xl md:text-6xl font-bold mb-2 leading-tight">
                  {slide.title}
                </h1>

                {/* 부제목 */}
                <h2 className="text-2xl md:text-3xl font-medium mb-4 leading-snug">
                  {slide.subtitle}
                </h2>

                {/* 설명 */}
                <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
                  {slide.description}
                </p>

                {/* 버튼 */}
                <Link
                  href={slide.buttonLink}
                  className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 이전/다음 버튼 */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="이전 슬라이드"
        disabled={isTransitioning}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="다음 슬라이드"
        disabled={isTransitioning}
      >
        <ChevronRight size={24} />
      </button>

      {/* 자동재생 제어 버튼 */}
      <button
        onClick={toggleAutoPlay}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm z-20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label={isAutoPlaying ? "자동재생 정지" : "자동재생 시작"}
      >
        {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* 인디케이터 */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {heroBannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              index === currentSlide
                ? "bg-white scale-110"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* 진행률 바 */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-10">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{
            width: `${((currentSlide + 1) / slideCount) * 100}%`,
          }}
        />
      </div>

      {/* 슬라이드 정보 (스크린 리더용) */}
      <div className="sr-only" aria-live="polite">
        슬라이드 {currentSlide + 1} / {slideCount}: {currentSlideData.title}
      </div>
    </div>
  );
}
