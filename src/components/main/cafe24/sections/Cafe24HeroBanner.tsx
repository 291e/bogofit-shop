"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { heroBannerSlides } from "@/contents/Hero/slideImages";
import { useI18n } from "@/providers/I18nProvider";

export function Cafe24HeroBanner() {
  const { t } = useI18n();
  const [currentCenterImage, setCurrentCenterImage] = useState(0);

  // 15 ảnh cho center rotation
  const centerImages = [
    "/hero/2025-10-20/1.png",
    "/hero/2025-10-20/2.png", 
    "/hero/2025-10-20/3.png",
    "/hero/2025-10-20/4.png",
    "/hero/2025-10-20/5.png",
    "/hero/2025-10-20/6.png",
    "/hero/2025-10-20/7.png",
    "/hero/2025-10-20/8.png",
    "/hero/2025-10-20/9.png",
    "/hero/2025-10-20/10.png",
    "/hero/2025-10-20/11.png",
    "/hero/2025-10-20/12.png",
    "/hero/2025-10-20/13.png",
    "/hero/2025-10-20/14.png",
    "/hero/2025-10-20/15.png"
  ];

  // 이미지 프리로딩
  useEffect(() => {
    const preloadImages = () => {
      // Preload first 3 images for sides
      heroBannerSlides.slice(0, 3).forEach((slide) => {
        const img = document.createElement("img");
        img.src = slide.image;
      });
      
      // Preload all center images
      centerImages.forEach((imagePath) => {
        const img = document.createElement("img");
        img.src = imagePath;
      });
    };

    preloadImages();
  }, []);

  // Center image rotation every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCenterImage((prev) => (prev + 1) % centerImages.length);
    }, 1000); // 1 second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full pt-4 pb-8">
      {/* 3 Fixed Images Container - Center image larger */}
      <div
        className="relative h-[400px] md:h-[700px] container mx-auto overflow-hidden"
        role="region"
        aria-label={t("hero.mainBanner")}
        tabIndex={0}
      >
        {/* 3 Images Layout - Fixed, No Sliding */}
        <div className="flex h-full">
          {/* Left Image - Same size */}
          <div className="flex-1 relative">
            <div className="relative w-full h-full overflow-hidden shadow-lg scale-100">
              <Image
                src={heroBannerSlides[0]?.image || "/hero/image1.png"}
                alt={heroBannerSlides[0]?.altKey ? t(heroBannerSlides[0].altKey) : heroBannerSlides[0]?.alt || ""}
                fill
                className="object-cover"
                priority
                sizes="50vw"
                quality={100}
              />
              
              {/* Text overlay - Left Image */}
              <div className="absolute inset-0 flex items-end justify-center p-6 md:p-8">
                <div className="text-center text-white">
                   <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight drop-shadow-lg">
                     {t("hero.slides.1.title")}
                   </h3>
                   <h4 className="text-sm md:text-xl lg:text-2xl font-medium leading-snug drop-shadow-md">
                     {t("hero.slides.1.subtitle")}
                   </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Center Image - Same size as sides with Rotation */}
          <div className="flex-1 relative">
            <div className="relative w-full h-full overflow-hidden shadow-lg scale-100">
              <Image
                src={centerImages[currentCenterImage]}
                alt={`Center image ${currentCenterImage + 1}`}
                fill
                className="object-cover object-top transition-opacity duration-300 ease-in-out"
                priority={currentCenterImage === 0}
                sizes="70vw"
        
                quality={100}
              />
              
              {/* Text overlay - only on center */}
              <div className="absolute inset-0 flex items-end justify-center p-6 md:p-8">
                <div className="text-center text-white transition-all duration-500 ease-out">
                  <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight drop-shadow-lg">
                    {t("hero.slides.2.title")}
                  </h3>
                  <h4 className="text-sm md:text-xl lg:text-2xl font-medium leading-snug drop-shadow-md">
                    {t("hero.slides.2.subtitle")}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image - Same size */}
          <div className="flex-1 relative">
            <div className="relative w-full h-full overflow-hidden shadow-lg scale-100">
              <Image
                src={heroBannerSlides[2]?.image || "/hero/image3.png"}
                alt={heroBannerSlides[2]?.altKey ? t(heroBannerSlides[2].altKey) : heroBannerSlides[2]?.alt || ""}
                fill
                className="object-cover"
                priority
                sizes="50vw"
                quality={100}
              />
              
              {/* Text overlay - Right Image */}
              <div className="absolute inset-0 flex items-end justify-center p-6 md:p-8">
                <div className="text-center text-white">
                  <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight drop-shadow-lg">
                    {t("hero.slides.3.title")}
                  </h3>
                  <h4 className="text-sm md:text-xl lg:text-2xl font-medium leading-snug drop-shadow-md">
                    {t("hero.slides.3.subtitle")}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}