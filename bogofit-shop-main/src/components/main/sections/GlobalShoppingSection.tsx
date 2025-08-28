"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Truck, Shield, CreditCard, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import { services } from "@/contents/GlobalShopping/services";
import { starPositions } from "@/contents/GlobalShopping/starPositions";

// services 아이콘 매핑
const iconMap = { Globe, Truck, Shield, CreditCard };

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
                  {iconMap[service.icon as keyof typeof iconMap] &&
                    React.createElement(
                      iconMap[service.icon as keyof typeof iconMap],
                      { className: "w-6 h-6 text-white" }
                    )}
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
