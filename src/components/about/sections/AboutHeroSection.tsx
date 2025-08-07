"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const AboutHeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-purple-400 via-pink-400 to-pink-300 overflow-hidden line-seed-kr">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h3 className="text-white text-lg lg:text-xl font-normal mb-4">
            언제 어디서든 내 마음대로 보고 PICK하다
          </h3>
          <h1 className="text-white text-5xl lg:text-7xl font-bold tracking-widest">
            BOGOFIT
          </h1>
        </motion.div>

        {/* Background Image Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative w-full h-96 lg:h-[600px] mb-16 rounded-3xl overflow-hidden"
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 z-10"></div>

          {/* Background Image */}
          <Image
            src="/about/bogofitClick.png"
            alt="BOGOFIT Background"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Introduction Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center space-y-6"
        >
          <p className="text-white text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto">
            AI 기술을 활용하여 사용자에게{" "}
            <span className="bg-pink-200 text-white px-4 py-2 rounded-full font-bold">
              정확한 피팅기능
            </span>
            을 제공하고
            <br />
            최적의{" "}
            <span className="bg-pink-200 text-white px-4 py-2 rounded-full font-bold">
              스타일을 추천
            </span>
            하는 가상피팅 플랫폼입니다
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHeroSection;
