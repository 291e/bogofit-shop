"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

const MobileAppSection = () => {
  return (
    <section className="relative bg-gradient-to-b from-pink-100 to-pink-50 py-20 line-seed-kr">
      <div className="container mx-auto px-4">
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 mb-16"
        >
          <p className="text-gray-800 text-xl lg:text-2xl font-bold leading-relaxed">
            클릭 몇 번으로{" "}
            <span className="bg-pink-200 text-white px-4 py-2 rounded-full">
              언제 어디서든
            </span>
            원하는 옷을 입어보고
            <br />
            나만의 스타일을 찾아보세요
          </p>
        </motion.div>

        {/* Mobile Mockups */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center items-center gap-8 mb-12"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="w-40 h-72 bg-black rounded-3xl p-2 shadow-2xl">
              <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden">
                <Image
                  src="/hero/image4.png"
                  alt="BOGOFIT App Screen 1"
                  width={160}
                  height={280}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Click Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-pink-200">
              <span className="text-3xl">👆</span>
            </div>
            {/* Pulse Animation */}
            <div className="absolute inset-0 w-16 h-16 bg-pink-200 rounded-full animate-ping opacity-20"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="w-40 h-72 bg-black rounded-3xl p-2 shadow-2xl">
              <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden">
                <Image
                  src="/hero/image5.png"
                  alt="BOGOFIT App Screen 2"
                  width={160}
                  height={280}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
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

        {/* Bottom Decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 flex justify-center"
        >
          <div className="flex space-x-4">
            <div className="w-3 h-3 bg-pink-300 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MobileAppSection;
