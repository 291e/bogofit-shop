"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { heroBannerSlides, heroImageUrls } from "@/contents/Hero/slideImages";

export function Cafe24HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 슬라이드 개수 (3개씩 그룹화)
  const slideCount = Math.ceil(heroBannerSlides.length / 3);

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

  // 슬라이드 변경 함수
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

  // 현재 슬라이드 데이터 (첫 번째 이미지 기준)
  const currentSlideData = useMemo(
    () => heroBannerSlides[currentSlide * 3] || heroBannerSlides[0],
    [currentSlide]
  );

  return (
    <div className="w-full pb-8">
      {/* 슬라이드 컨테이너 - 이미지 크기에 맞춤 */}
      <div
        className="relative h-[400px] md:h-[500px] container mx-auto overflow-hidden "
        role="region"
        aria-label="메인 배너 슬라이드"
        tabIndex={0}
      >
        {/* 슬라이드 이미지들 */}
        <div
          className="flex transition-transform duration-700 ease-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          aria-live="polite"
        >
          {/* 각 슬라이드마다 3개 이미지를 배치 */}
          {Array.from({ length: Math.ceil(heroBannerSlides.length / 3) }).map(
            (_, slideIndex) => (
              <div
                key={slideIndex}
                className="min-w-full h-full relative flex"
                aria-hidden={slideIndex !== currentSlide}
              >
                {/* 3개 이미지를 가로로 배치 */}
                {heroBannerSlides
                  .slice(slideIndex * 3, slideIndex * 3 + 3)
                  .map((slide) => (
                    <div key={slide.id} className="flex-1 relative">
                      {/* 이미지 */}
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        className="object-contain"
                        priority={slide.priority || slideIndex === 0}
                        quality={100}
                      />

                      {/* 개별 이미지 오버레이 */}
                      {/* <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors duration-300" /> */}

                      {/* 개별 이미지 텍스트 */}
                      <div className="absolute inset-0 flex items-end justify-center p-4">
                        <div className="text-center text-white">
                          {/* 할인율 */}
                          {slide.discount && (
                            <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 animate-pulse">
                              {slide.discount}
                            </div>
                          )}

                          {/* 제목 */}
                          <h3 className="text-lg md:text-2xl lg:text-3xl font-bold mb-2 leading-tight drop-shadow-lg">
                            {slide.title}
                          </h3>

                          {/* 부제목 */}
                          <h4 className="text-sm md:text-lg lg:text-xl font-medium  leading-snug drop-shadow-md">
                            {slide.subtitle}
                          </h4>

                          {/* 설명 */}
                          <p className="text-xs md:text-sm lg:text-base mb-4 opacity-90 leading-relaxed drop-shadow-sm line-clamp-2">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* 빈 공간 채우기 (3개 미만일 경우) */}
                {heroBannerSlides.slice(slideIndex * 3, slideIndex * 3 + 3)
                  .length < 3 &&
                  Array.from({
                    length:
                      3 -
                      heroBannerSlides.slice(slideIndex * 3, slideIndex * 3 + 3)
                        .length,
                  }).map((_, emptyIndex) => (
                    <div
                      key={`empty-${emptyIndex}`}
                      className="flex-1 bg-gray-200"
                    />
                  ))}
              </div>
            )
          )}
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
          {Array.from({ length: slideCount }).map((_, index) => (
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
    </div>
  );
}
