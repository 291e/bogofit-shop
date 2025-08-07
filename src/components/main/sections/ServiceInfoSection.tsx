"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Shield,
  Clock,
  Calculator,
  Package,
  HeadphonesIcon,
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "무료배송",
    description: "모든 주문 무료배송",
    detail: "항공 특송으로 빠르고 안전하게",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "안전 보장",
    description: "100% 정품 보장",
    detail: "가품 발견 시 100% 환불",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Calculator,
    title: "투명한 수수료",
    description: "숨겨진 비용 없음",
    detail: "상품가 + 배송비 + 수수료 10%",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: Package,
    title: "안전 포장",
    description: "전문 포장 서비스",
    detail: "파손 방지 특수 포장재 사용",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Clock,
    title: "실시간 추적",
    description: "배송 현황 실시간 확인",
    detail: "SMS, 카카오톡 알림 서비스",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: HeadphonesIcon,
    title: "24시간 고객지원",
    description: "언제든 문의 가능",
    detail: "카카오톡, 전화, 이메일 지원",
    color: "from-indigo-500 to-blue-500",
  },
];

const shippingInfo = [
  { country: "미국", time: "7-10일", fee: "1kg당 $8" },
  { country: "일본", time: "5-7일", fee: "1kg당 $6" },
  { country: "독일", time: "10-14일", fee: "1kg당 $10" },
  { country: "영국", time: "10-14일", fee: "1kg당 $9" },
];

export default function ServiceInfoSection() {
  return (
    <section className="w-full py-20 px-4 sm:px-6 md:px-8 lg:px-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
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
            <Shield className="w-4 h-4 mr-2 text-blue-500" />
            RELIABLE SERVICE
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            믿을 수 있는 서비스
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            안전하고 빠른 해외구매 대행 서비스로 전 세계 쇼핑을 경험하세요
          </p>
        </motion.div>

        {/* 서비스 특징 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-100 relative overflow-hidden h-full">
                {/* 배경 장식 */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.color} opacity-10 rounded-full -translate-y-10 translate-x-10`}
                />

                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-2 font-medium">
                    {feature.description}
                  </p>
                  <p className="text-gray-500 text-sm">{feature.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 배송 정보 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white text-center">
              국가별 배송 정보
            </h3>
            <p className="text-blue-100 text-center mt-2">
              투명한 배송비와 예상 소요시간을 확인하세요
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {shippingInfo.map((info, index) => (
                <motion.div
                  key={info.country}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="text-3xl mb-3">
                    {info.country === "미국" && "🇺🇸"}
                    {info.country === "일본" && "🇯🇵"}
                    {info.country === "독일" && "🇩🇪"}
                    {info.country === "영국" && "🇬🇧"}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {info.country}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">배송기간:</span>
                      <span className="font-semibold text-blue-600">
                        {info.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">배송비:</span>
                      <span className="font-semibold text-green-600">
                        {info.fee}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100"
            >
              <h4 className="text-lg font-bold text-blue-900 mb-3 text-center">
                🎉 무료배송 혜택
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>모든 상품 무료배송 서비스</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>주문 금액에 관계없이 배송비 0원</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>안전한 포장과 빠른 배송</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>배송 보험 가입으로 안전한 배송</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
