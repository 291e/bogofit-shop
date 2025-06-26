"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

const ComprehensiveBogoFitSection = () => {
  const useCases = [
    "매장에 직접가서 옷을 입어보기 귀찮을 때",
    "온라인으로 구매한 후 핏이 아쉬울 때",
    "옷을 어떻게 입어야 할지 모를 때",
    "나에게 맞는 스타일을 찾고 싶을 때",
  ];

  const features = [
    {
      title: "AI 가상 피팅",
      hashtag: "#정확한 피팅",
      description:
        "언제 어디서든 내가 원하는 옷을\n클릭 몇번으로 입어 볼 수 있어요",
      icon: "👗",
      bgImage: "/images/WunderStory/WunderStory.jpg",
    },
    {
      title: "TPO 스타일 추천",
      hashtag: "#나만의 스타일 가이드",
      description: "시간, 장소,상황에 적합한\n최적의 코디를 추천해줘요",
      icon: "✨",
      bgImage: "/hero/image2.png",
    },
    {
      title: "쇼핑 연동",
      hashtag: "#후회없는 쇼핑",
      description:
        "다양한 브랜드를 비교해 주고 최적의\n쇼핑 구매페이지로 연결해줘요",
      icon: "🛍️",
      bgImage: "/hero/image3.png",
    },
  ];

  const steps = [
    {
      title: "STEP 1. 포즈 선택",
      description:
        "프리셋 포즈 말고도 자신의 사진과 앨범에서\n포즈를 선택할 수 있어요",
    },
    {
      title: "STEP 2. 옷 선택",
      description:
        "상의 뿐만 아니라 하의, 악세사리 등\n다양한 아이템들을 선택하여 착용해보세요",
    },
    {
      title: "STEP 3. AI생성 클릭",
      description: "단 몇번의 클릭으로\n언제 어디서든 원하는 옷을 피팅해보세요",
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-pink-400 via-pink-300 to-pink-200 overflow-hidden line-seed-kr">
      <div className="container mx-auto px-4 py-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-white text-4xl lg:text-6xl font-bold mb-8">
            보고핏 어떄?
          </h1>

          {/* Use Cases */}
          <div className="space-y-4 mb-12">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-center justify-center gap-3"
              >
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <p className="text-white text-lg font-medium">{useCase}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Background Image Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative w-full h-96 lg:h-[600px] mb-16 rounded-3xl overflow-hidden"
        >
          <Image
            src="/about/bogofitApp2.png"
            alt="BOGOFIT Background"
            fill
            className="object-contain"
          />

          {/* Floating Icons */}
          <div className="absolute inset-0 z-10">
            <motion.div
              initial={{ opacity: 0, rotate: -10 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute top-1/4 left-16"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, rotate: 10 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="absolute top-1/3 right-16"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-3xl">🧥</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="absolute bottom-1/4 left-1/4"
            >
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-2xl">🛍️</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="absolute bottom-1/3 right-1/4"
            >
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-xl">👆</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-white text-3xl lg:text-4xl font-bold mb-6">
            보고핏이란?
          </h2>
          <p className="text-white text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto">
            AI 기술을 활용하여 사용자에게 정확한 피팅기능을 제공하고
            <br />
            최적의 스타일을 추천하는 가상피팅 플랫폼입니다
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-pink-50 rounded-2xl p-6 shadow-lg"
            >
              {/* Feature Icon */}
              <div className="relative w-full h-24 bg-white rounded-xl overflow-hidden shadow-sm mb-4">
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
              <p className="text-gray-600 text-sm text-center mb-2">
                {feature.hashtag}
              </p>

              {/* Feature Title */}
              <h4 className="text-indigo-900 text-lg font-bold text-center mb-3">
                {feature.title}
              </h4>

              {/* Description */}
              <p className="text-gray-700 text-sm font-medium text-center leading-relaxed whitespace-pre-line">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Fitting Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="space-y-4 mb-8">
            <p className="text-white text-2xl lg:text-3xl font-bold">
              AI 가상피팅은
            </p>
            <p className="text-white text-4xl lg:text-6xl font-bold">
              처음이라
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
              #정확한 피팅
            </span>
            <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
              #나만의 스타일 가이드
            </span>
            <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
              #후회없는 쇼핑
            </span>
          </div>

          <p className="text-white text-xl font-medium">
            언제 어디서든 보고 PICK하다
          </p>
        </motion.div>

        {/* Mobile App Mockups */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center items-center gap-8 mb-20"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="w-48 h-80 bg-black rounded-3xl p-2 shadow-2xl">
              <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden">
                <Image
                  src="/hero/image6.png"
                  alt="BOGOFIT App Screen 1"
                  width={192}
                  height={320}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="w-48 h-80 bg-black rounded-3xl p-2 shadow-2xl">
              <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden">
                <Image
                  src="/hero/image7.png"
                  alt="BOGOFIT App Screen 2"
                  width={192}
                  height={320}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Steps Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12 mb-20"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <h3 className="text-white text-2xl lg:text-3xl font-bold mb-4">
                {step.title}
              </h3>
              <p className="text-white text-lg leading-relaxed whitespace-pre-line">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Download Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 py-4 rounded-xl flex items-center gap-4 font-medium shadow-lg hover:shadow-xl transition-all border border-gray-200 cursor-pointer"
          >
            <Link href="https://apps.apple.com/kr/app/bogofit/id6743146955">
              <Image
                src="/about/apple.png"
                alt="appStore"
                width={160}
                height={160}
              />
            </Link>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 py-4 rounded-xl flex items-center gap-4 font-medium shadow-lg hover:shadow-xl transition-all border border-gray-200 cursor-pointer"
          >
            <Link href="https://play.google.com/store/apps/details?id=com.metabank.bogofit">
              <Image
                src="/about/google.png"
                alt="googlePlay"
                width={160}
                height={160}
              />
            </Link>
          </motion.button>
        </motion.div>

        {/* Click Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative flex justify-center pt-12 animate-bounce"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-pink-200">
            <span className="text-3xl">👆</span>
          </div>
          {/* Pulse Animation */}
          <div className="absolute inset-0 w-16 h-16 bg-pink-200 rounded-full animate-ping opacity-20"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComprehensiveBogoFitSection;
