"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { categories } from "@/contents/Category/categories";

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

const categoryUrlMap: Record<string, string> = {
  상의: "top",
  하의: "bottom",
  아우터: "outer",
  원피스: "onepiece",
};

export default function CategorySection() {
  return (
    <section className="w-full py-16 px-4 sm:px-6 md:px-8 lg:px-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            카테고리별 쇼핑
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            원하는 스타일을 빠르게 찾아보세요
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.name} variants={itemVariants}>
              <Link
                href={`/category/${categoryUrlMap[category.name]}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  {/* 배경 그라디언트 */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br  opacity-10 group-hover:opacity-20 transition-opacity`}
                  />

                  {/* 카테고리 이미지 */}
                  <div className="relative aspect-square p-8"></div>

                  {/* 카테고리 이름 */}
                  <div className="p-6 pt-0">
                    <h3 className="text-xl font-semibold text-center text-gray-900 group-hover:text-gray-700 transition-colors">
                      {category.name}
                    </h3>
                  </div>

                  {/* 호버 효과 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
