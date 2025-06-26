"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const FeatureCardsSection = () => {
  const features = [
    {
      label: "PROBLEM 1",
      title: "AI 가상 피팅",
      hashtag: "#정확한 피팅",
      problem: "온라인 쇼핑시 사이즈와 핏이\n맞지 않아 반품률이 높아요",
      solution:
        "언제 어디서든 내가 원하는 옷을\n클릭 몇번으로 입어 볼 수 있어요",
      icon: "👗",
      bgImage: "/images/WunderStory/WunderStory.jpg",
    },
    {
      label: "PROBLEM 2",
      title: "TPO 스타일 추천",
      hashtag: "#나만의 스타일 가이드",
      problem: "항상 어디갈 때 마다 어떤 옷을\n입어야 할지 모르겠어요",
      solution: "시간, 장소,상황에 적합한\n최적의 코디를 추천해줘요",
      icon: "✨",
      bgImage: "/hero/image2.png",
    },
    {
      label: "PROBLEM 3",
      title: "쇼핑 연동",
      hashtag: "#후회없는 쇼핑",
      problem: "매장까지 가서 옷을 비교하고\n입어볼 시간이 없어요",
      solution:
        "다양한 브랜드를 비교해 주고 최적의\n쇼핑 구매페이지로 연결해줘요",
      icon: "🛍️",
      bgImage: "/hero/image3.png",
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-pink-300 to-pink-100 py-20 line-seed-kr">
      <div className="container mx-auto px-4">
        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="space-y-4"
            >
              {/* Problem Section */}
              <div className="relative">
                <div className="bg-pink-200 rounded-xl p-6 relative shadow-lg">
                  {/* Speech Bubble Tail */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-pink-200"></div>
                  </div>

                  {/* Label */}
                  <div className="bg-pink-50 text-pink-700 text-sm font-bold px-4 py-2 rounded-full text-center mb-4">
                    {feature.label}
                  </div>

                  {/* Problem Text */}
                  <p className="text-white text-sm font-bold text-center leading-relaxed whitespace-pre-line">
                    {feature.problem}
                  </p>
                </div>
              </div>

              {/* Solution Section */}
              <div className="bg-pink-50 rounded-xl p-6 space-y-4 shadow-lg">
                {/* Feature Icon with Background Image */}
                <div className="relative w-full h-24 bg-white rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src={feature.bgImage}
                    alt={feature.title}
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-200/60 to-pink-300/60 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-3xl">{feature.icon}</span>
                    </div>
                  </div>
                </div>

                {/* Hashtag */}
                <p className="text-gray-600 text-sm text-center font-medium">
                  {feature.hashtag}
                </p>

                {/* Feature Title */}
                <h4 className="text-indigo-900 text-lg font-bold text-center">
                  {feature.title}
                </h4>

                {/* Solution Text */}
                <p className="text-gray-700 text-sm font-medium text-center leading-relaxed whitespace-pre-line">
                  {feature.solution}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureCardsSection;
