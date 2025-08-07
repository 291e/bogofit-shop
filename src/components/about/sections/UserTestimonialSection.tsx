"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function UserTestimonialSection() {
  const testimonials = [
    {
      id: 1,
      text: "이젠 쇼핑 전에\n시뮬 돌리는 게 국룰임ㅋㅋ",
      user: "사용자1",
    },
    {
      id: 2,
      text: "영상으로 미리 입어보니까\n쇼핑 실패 확실히 줄었어요!",
      user: "사용자2",
    },
    {
      id: 3,
      text: "입어보지 않고 실패 없는 쇼핑\n… 솔직히 좀 소름!",
      user: "사용자3",
    },
    {
      id: 4,
      text: "핏이 생각보다\n정확해서 놀랐어요.",
      user: "사용자4",
    },
    {
      id: 5,
      text: "AI가 코디해줬는데\n나보다 감각 있음.. 뭐야?",
      user: "사용자5",
    },
    {
      id: 6,
      text: "살까 말까 고민될 때\nAI가 입혀주면 답 나옴~",
      user: "사용자6",
    },
  ];

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
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-pink-50 via-pink-100 to-indigo-200 overflow-hidden line-seed-kr">
      {/* Background decorative circle */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[340px] h-[184px] bg-gradient-radial from-white to-transparent opacity-30 rounded-full"></div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl lg:text-6xl font-black text-[#30366f] leading-tight mb-6">
            사용자들의
            <br />
            솔직 후기
          </h2>
          <p className="text-lg text-[#30366f] max-w-2xl mx-auto">
            보고핏, 어떤지 궁금하셨죠?
            <br />
            처음 써본 분들의 솔직한 느낌, 그대로 담았어요!
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              className="flex flex-col items-center"
            >
              {/* User Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 bg-[#30366f] rounded-full flex items-center justify-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full relative overflow-hidden">
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-9 h-9 bg-[#ef81ae] rounded-full"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-[#ef81ae] rounded-t-full"></div>
                  </div>
                </div>
              </div>

              {/* Testimonial Card */}
              <div className="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full">
                <p className="text-black text-center font-bold text-lg leading-relaxed whitespace-pre-line">
                  {testimonial.text}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-xl font-bold text-[#30366f] mb-8">
            복잡한 설정 없이,
            <br />
            1분이면 스타일 완성!
          </h3>

          {/* Mobile Mockup Images */}
          <div className="flex justify-center gap-4 mb-8">
            <Image
              src="/about/bogofitClick2.png"
              alt="bogoFit"
              width={320}
              height={384}
            />
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#ef81ae] text-white px-12 py-4 rounded-lg font-bold text-xl shadow-lg hover:bg-[#e570a0] transition-colors cursor-pointer"
          >
            사용 방법 보러 가기
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
