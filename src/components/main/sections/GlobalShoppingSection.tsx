"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Truck, Shield, CreditCard, Clock, MapPin } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Globe,
    title: "전 세계 쇼핑",
    description: "미국, 일본, 유럽 등 전 세계 온라인 쇼핑몰에서 구매 대행",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Truck,
    title: "안전한 배송",
    description: "전문 포장과 보험 적용으로 안전하게 배송",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "구매 보장",
    description: "100% 정품 보장과 구매 안전 서비스 제공",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: CreditCard,
    title: "간편 결제",
    description: "다양한 결제 수단과 투명한 수수료 정책",
    color: "from-orange-500 to-red-500",
  },
];

const countries = [
  { name: "미국", flag: "🇺🇸", popular: ["Amazon", "Nike", "Apple"] },
  { name: "일본", flag: "🇯🇵", popular: ["Rakuten", "Yahoo", "Uniqlo"] },
  { name: "독일", flag: "🇩🇪", popular: ["Zalando", "Otto", "MediaMarkt"] },
  { name: "영국", flag: "🇬🇧", popular: ["ASOS", "Next", "Selfridges"] },
];

// 고정된 별빛 위치 배열 (SSR 하이드레이션 오류 방지)
const starPositions = [
  { left: 15.2, top: 25.8, duration: 4.2, delay: 0.5 },
  { left: 78.3, top: 12.4, duration: 3.8, delay: 1.2 },
  { left: 45.7, top: 67.9, duration: 5.1, delay: 0.8 },
  { left: 92.1, top: 34.6, duration: 3.5, delay: 1.8 },
  { left: 23.4, top: 89.2, duration: 4.7, delay: 0.3 },
  { left: 67.8, top: 8.1, duration: 3.9, delay: 1.5 },
  { left: 8.9, top: 56.3, duration: 4.4, delay: 0.9 },
  { left: 85.6, top: 78.7, duration: 3.6, delay: 1.1 },
  { left: 34.2, top: 19.5, duration: 5.0, delay: 0.7 },
  { left: 56.7, top: 43.8, duration: 4.1, delay: 1.4 },
  { left: 12.3, top: 72.1, duration: 3.7, delay: 0.6 },
  { left: 89.4, top: 15.9, duration: 4.8, delay: 1.7 },
  { left: 41.8, top: 91.3, duration: 3.4, delay: 0.4 },
  { left: 73.5, top: 28.7, duration: 4.6, delay: 1.3 },
  { left: 19.7, top: 64.2, duration: 3.8, delay: 1.0 },
  { left: 96.1, top: 52.4, duration: 4.3, delay: 0.2 },
  { left: 27.9, top: 6.8, duration: 5.2, delay: 1.6 },
  { left: 62.4, top: 85.1, duration: 3.3, delay: 0.1 },
  { left: 5.6, top: 37.9, duration: 4.9, delay: 1.9 },
  { left: 81.2, top: 61.5, duration: 3.2, delay: 0.0 },
];

export default function GlobalShoppingSection() {
  return (
    <section className="w-full py-20 px-4 sm:px-6 md:px-8 lg:px-10 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        {starPositions.map((star, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-2 bg-white/10 text-white border-white/20"
          >
            <Globe className="w-4 h-4 mr-2" />
            GLOBAL SHOPPING
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-white">
            전 세계가 당신의
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              쇼핑몰입니다
            </span>
          </h2>

          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            해외 직구의 모든 복잡함을 해결해드립니다
            <br />
            원하는 상품을 간편하게 주문하고 안전하게 받아보세요
          </p>
        </motion.div>

        {/* 서비스 특징 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105 h-full">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 인기 국가 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            인기 구매 대행 국가
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {countries.map((country, index) => (
              <motion.div
                key={country.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {country.flag}
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    {country.name}
                  </h4>
                  <div className="space-y-1">
                    {country.popular.map((site) => (
                      <div key={site} className="text-white/60 text-sm">
                        {site}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 이용 방법 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-8">
            이용 방법은 간단해요
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                step: "01",
                title: "상품 주문",
                desc: "원하는 상품을 주문해주세요",
                icon: MapPin,
              },
              {
                step: "02",
                title: "견적 확인",
                desc: "상품가격 + 배송비 + 수수료 확인",
                icon: CreditCard,
              },
              {
                step: "03",
                title: "안전 배송",
                desc: "검수 후 안전하게 포장하여 배송",
                icon: Clock,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-cyan-300 font-bold text-sm mb-2">
                    STEP {item.step}
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-white/70 text-sm">{item.desc}</p>
                </div>

                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            viewport={{ once: true }}
          >
            <Link href="/products">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                지금 시작하기
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
