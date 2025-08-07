"use client";

import { motion } from "framer-motion";
// import Image from "next/image";
import Link from "next/link";
import { categories } from "@/contents/Category/categories";

const categoryUrlMap: Record<string, string> = {
  상의: "top",
  하의: "bottom",
  아우터: "outer",
  원피스: "onepiece",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function CategoryListPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            카테고리별 쇼핑
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            원하는 스타일을 빠르게 찾아보세요
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
        >
          {categories.map((category) => (
            <motion.div key={category.name} variants={itemVariants}>
              <Link
                href={`/category/${categoryUrlMap[category.name]}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  {/* 배경 그라디언트 */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity`}
                  />

                  {/* 카테고리 이미지 */}
                  <div className="relative aspect-square p-12"></div>

                  {/* 카테고리 이름 */}
                  <div className="p-8 pt-0">
                    <h3 className="text-2xl font-bold text-center text-gray-900 group-hover:text-gray-700 transition-colors">
                      {category.name}
                    </h3>
                  </div>

                  {/* 호버 효과 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-3xl" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
