import AboutHeroSection from "./sections/AboutHeroSection";
import FeatureCardsSection from "./sections/FeatureCardsSection";
import MobileAppSection from "./sections/MobileAppSection";
import ComprehensiveBogoFitSection from "./sections/ComprehensiveBogoFitSection";
import UserTestimonialSection from "./sections/UserTestimonialSection";
import ComprehensiveLandingSection from "./sections/ComprehensiveLandingSection";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* 메인 랜딩 섹션 - Figma v9upzo8u 디자인 */}
      <ComprehensiveLandingSection />

      {/* 추가 보완 섹션들 */}
      <AboutHeroSection />
      <FeatureCardsSection />
      <UserTestimonialSection />
      <MobileAppSection />

      {/* 기존 보고핏 섹션 (하단 배치) */}
      <ComprehensiveBogoFitSection />
    </main>
  );
}
