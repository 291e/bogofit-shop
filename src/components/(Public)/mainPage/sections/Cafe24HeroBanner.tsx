"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/languageProvider";

// Hero Banner Slide Interface
interface HeroBannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  alt: string;
  discount?: string;
  backgroundColor: string;
  textColor: string;
  priority?: boolean;
  titleKey?: string;
  subtitleKey?: string;
  descriptionKey?: string;
  buttonTextKey?: string;
  altKey?: string;
  discountKey?: string;
}

// Hero Banner Slides Data
const heroBannerSlides: HeroBannerSlide[] = [
  {
    id: 1,
    title: "신상품 런칭 기념",
    subtitle: "보고핏 계절 컬렉션",
    description: "시원하고 편안한 운동복으로 완벽한 여름을 준비하세요",
    buttonText: "지금 쇼핑하기",
    buttonLink: "/products?badge=NEW",
    image: "/hero/image1.png",
    alt: "보고핏 계절 컬렉션 신상품",
    discount: "최대 50%",
    backgroundColor: "",
    textColor: "text-gray-900",
    priority: true,
  },
  {
    id: 2,
    title: "타임세일 진행중",
    subtitle: "베스트셀러 특가전",
    description: "인기 상품들을 특별가로 만나보세요",
    buttonText: "특가 상품 보기",
    buttonLink: "/products?badge=SALE",
    image: "/hero/image2.png",
    alt: "베스트셀러 특가전 상품",
    discount: "50% OFF",
    backgroundColor: "",
    textColor: "text-gray-900",
  },
  {
    id: 3,
    title: "멤버십 혜택",
    subtitle: "무료배송 + 적립금",
    description: "회원가입하고 다양한 혜택을 받아보세요",
    buttonText: "회원가입하기",
    buttonLink: "/register",
    image: "/hero/image3.png",
    alt: "멤버십 혜택 안내",
    backgroundColor: "",
    textColor: "text-gray-900",
  },
];

export function Cafe24HeroBanner() {
  const [currentCenterImage, setCurrentCenterImage] = useState(0);
  const { t } = useLanguage();

  // 15 ảnh cho center rotation
  const centerImages = [
    "/hero/1.png",
    "/hero/2.png",
    "/hero/3.png",
    "/hero/4.png",
    "/hero/5.png",
    "/hero/6.png",
    "/hero/7.png",
    "/hero/8.png",
    "/hero/9.png",
    "/hero/10.png",
    "/hero/11.png",
    "/hero/12.png",
    "/hero/13.png",
    "/hero/14.png",
    "/hero/15.png"
  ];

  // 이미지 프리로딩
  useEffect(() => {
    const preloadImages = () => {
      // Preload first 3 images for sides

    };

    preloadImages();
  }, []);

  // Center image rotation every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCenterImage((prev) => (prev + 1) % centerImages.length);
    }, 1000); // 1 second

    return () => clearInterval(interval);
  }, [centerImages.length]);

  return (
    <div className="w-full pt-4 pb-8">
      {/* 3 Fixed Images Container - Center image larger */}
      <div
        className="relative h-[400px] md:h-[700px] container mx-auto overflow-hidden"
        role="region"
        aria-label="Hero banner"
        tabIndex={0}
      >
        {/* 3 Images Layout - Fixed, No Sliding */}
        <div className="flex h-full">
          {/* Left Image - Same size (Fixed) */}
          <div className="flex-1 relative">
            <div className="relative w-full h-full overflow-hidden shadow-lg scale-100">
              <Image
                src={heroBannerSlides[0].image}
                alt={heroBannerSlides[0].alt}
                fill
                className="object-cover"
                priority
                sizes="50vw"
                quality={100}
              />

              {/* Text overlay - Left Image */}
              <div className="absolute inset-0 flex items-end justify-center p-6 md:p-8">
                <div className="text-center text-white">
                  {heroBannerSlides[0].discount && (
                    <Badge className="mb-2 bg-red-500 text-white">
                      {heroBannerSlides[0].discount}
                    </Badge>
                  )}
                  <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight drop-shadow-lg">
                    {t("mainPage.hero.newLaunch")}
                  </h3>
                  <h4 className="text-sm md:text-xl lg:text-2xl font-medium leading-snug drop-shadow-md">
                    {t("mainPage.hero.seasonCollection")}
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

              {/* Text overlay - Center Image */}
              <div className="absolute inset-0 flex items-end justify-center p-6 md:p-8">
                <div className="text-center text-white">
                  <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight drop-shadow-lg">
                    {t("mainPage.hero.tryAndShop")}
                  </h3>
                  <h4 className="text-sm md:text-xl lg:text-2xl font-medium leading-snug drop-shadow-md">
                    {t("mainPage.hero.tryAndShopSubtitle")}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image - Same size (Fixed) */}
          <div className="flex-1 relative">
            <div className="relative w-full h-full overflow-hidden shadow-lg scale-100">
              <Image
                src={heroBannerSlides[2].image}
                alt={heroBannerSlides[2].alt}
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
                    {t("mainPage.hero.membership")}
                  </h3>
                  <h4 className="text-sm md:text-xl lg:text-2xl font-medium leading-snug drop-shadow-md">
                    {t("mainPage.hero.freeShipping")}
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