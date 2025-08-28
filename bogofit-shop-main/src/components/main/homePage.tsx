"use client";

// import HeroBanner from "./sections/HeroBanner";
// import CategorySection from "./sections/CategorySection";
import FeaturedSection from "./sections/FeaturedSection";
import GlobalShoppingSection from "./sections/GlobalShoppingSection";
// import ServiceInfoSection from "./sections/ServiceInfoSection";
import TestimonialSection from "./sections/TestimonialSection";
import VirtualFittingSection from "./sections/VirtualFittingSection";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 히어로 배너 */}
      {/* <HeroBanner /> */}

      {/* 가상피팅 AI 서비스 섹션 */}
      <VirtualFittingSection />

      {/* 특별 기획전 섹션 */}
      <FeaturedSection />

      {/* 해외구매 대행 서비스 섹션 */}
      <GlobalShoppingSection />

      {/* 서비스 정보 섹션 */}
      {/* <ServiceInfoSection /> */}

      {/* 고객 후기 섹션 */}
      <TestimonialSection />
    </div>
  );
}
