"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { features } from "@/contents/Featured/features";

export default function FeaturedSection() {
  return (
    <section className="w-full py-20 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="outline"
            className="mb-4 px-4 py-2 text-sm font-medium"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            SPECIAL OFFERS
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            특별 기획전
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            놓칠 수 없는 특별한 혜택과 인기 상품들을 만나보세요
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                {/* 배경 그라디언트 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color}`}
                />

                {/* 배경 패턴 */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                </div>

                {/* 콘텐츠 */}
                <div className="relative z-10 p-8 h-80 flex flex-col justify-between">
                  <div>
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                      viewport={{ once: true }}
                      className="inline-flex items-center gap-2 mb-4"
                    >
                      <Zap className={`w-6 h-6 ${feature.textColor}`} />
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0"
                      >
                        LIMITED
                      </Badge>
                    </motion.div>

                    <h3
                      className={`text-2xl font-bold mb-2 ${feature.textColor}`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-3xl font-extrabold mb-4 ${feature.textColor}`}
                    >
                      {feature.subtitle}
                    </p>
                    <p className={`text-lg opacity-90 ${feature.textColor}`}>
                      {feature.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link href="/products">
                      <Button
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm group-hover:scale-110 transition-transform"
                      >
                        지금 보기
                      </Button>
                    </Link>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${feature.textColor} fill-current`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 장식 요소 */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
