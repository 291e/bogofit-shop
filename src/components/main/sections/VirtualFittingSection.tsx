"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Camera, Zap, Target, CheckCircle } from "lucide-react";

export default function VirtualFittingSection() {
  const features = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "본인 이미지 업로드",
      description: "최소한 상반신이 포함된 사진으로 체형 분석",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "의류 이미지 매칭",
      description: "상의, 하의, 배경을 선택적으로 조합",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI 가상 착용 생성",
      description: "1분 미만의 빠른 이미지 및 비디오 생성",
    },
  ];

  const benefits = [
    "사이즈 고민 완전 해결",
    "실제 착용감 미리 확인",
    "반품률 대폭 감소",
    "온라인 쇼핑의 새로운 경험",
  ];

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge
              variant="outline"
              className="mb-6 px-3 text-lg font-semibold bg-white/80 backdrop-blur-sm border-pink-200"
            >
              <Sparkles className="w-5 h-5 mr-2 text-pink-500" />
              혁신 기술
            </Badge>
            <h2 className="text-4xl sm:text-6xl font-bold mb-8 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI 가상피팅 쇼핑몰
            </h2>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
              보고 <span className="text-pink-500">핏</span>하자! 💪
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              AI 기술로 의류를 가상으로 입어보고 완벽한 핏을 미리 확인하세요.
              <br />더 이상 사이즈와 스타일 때문에 고민하지 마세요!
            </p>
          </motion.div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* 왼쪽: 기능 설명 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Sparkles className="w-6 h-6 mr-3 text-pink-500" />
                  어떻게 작동하나요?
                </h3>
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 오른쪽: 혜택 및 CTA */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">🎯 보고핏의 특별함</h3>
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-pink-200 flex-shrink-0" />
                    <span className="text-lg font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4">
                <Link href="/products" className="block">
                  <Button
                    size="lg"
                    className="w-full bg-white text-pink-600 hover:bg-pink-50 font-bold py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    지금 가상피팅 체험하기 ✨
                  </Button>
                </Link>
                <Link href="/about" className="block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white hover:text-pink-600 font-bold py-4 text-lg rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300 hover:scale-105"
                  >
                    기술 더 알아보기
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 하단 통계 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">AI</div>
              <div className="text-gray-600 font-medium">가상피팅 기술</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">1분</div>
              <div className="text-gray-600 font-medium">미만 생성시간</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">PRO</div>
              <div className="text-gray-600 font-medium">비디오 생성</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">혁신</div>
              <div className="text-gray-600 font-medium">쇼핑 경험</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
