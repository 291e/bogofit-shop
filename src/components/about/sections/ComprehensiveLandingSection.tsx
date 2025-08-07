"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ComprehensiveLandingSection() {
  const painPoints = [
    "사진이랑 실제 핏이 달라요",
    "모델이랑 체형이 너무 달라요",
    "사이즈는 맞는데 핏이 이상해요",
    "후기 보고 샀는데도 실패했어요",
    "반품하려다가 그냥 포기했어요",
    "핏이 애매해서 옷장에 넣어놨어요",
  ];

  const features = [
    {
      icon: "🪄",
      title: "AI 가상피팅",
      description:
        "하이브리드 구조로 정확도 향상\n옷의 변화, 각도 등 움직임에 따라\n핏 자동 조정",
    },
    {
      icon: "🎬",
      title: "동영상 패션 룩",
      description:
        "AI 및 영상처리 기술 활용\n패션 아이템 가상 착용\n스타일링 시각적으로 표현",
    },
    {
      icon: "✨",
      title: "스타일 추천",
      description:
        "과거 데이터 분석 후\nAI를 통한 최적의 코디 추천\nTPO에 맞는 스타일 제안",
    },
    {
      icon: "📦",
      title: "쇼핑 연동",
      description:
        "유사 브랜드 제품 비교\n가상 피팅 후 가까운\n오프라인 매장 연동",
    },
    {
      icon: "🧥",
      title: "아이템 피팅",
      description:
        "안경, 선글라스,가방 등\n다양한 아이템 피팅 제공\n자연스러운 착용 모습 구현",
    },
    {
      icon: "🔗",
      title: "소셜 인터랙션",
      description:
        "나만의 스타일 공유 가능\n스타일 배틀을 통한 코디 공유\nAI 챗봇 기능 제공",
    },
  ];

  const reviews = [
    {
      title: "가상 피팅 후기.zip",
      subtitle: "실제로 입은 듯한 리얼 피팅",
      content:
        "모자랑 선글라스까지 가상으로 써볼 수 있는 게 제일 좋았어요! 얼굴형이랑 잘 어울리는지도 보이니까 진짜 현실감 있네요 영상이 자연스럽고 움직일 때 각도별로 다르게 보여서 신기했어요",
    },
    {
      title: "AI 스타일 추천 후기.zip",
      subtitle: "나만의 스타일 챗봇",
      content:
        "AI가 추천한 조합 생각보다 너무 잘 어울려서 깜짝 놀랐어요 똑같은 스타일만 입었는데 챗봇 덕분에 다른 조합 시도하게 됐어요 상황이나 계절 입력하니까 AI가 추천해줘서 옷 고르는 시간 줄었어요",
    },
    {
      title: "쇼핑 고민 해결 후기.zip",
      subtitle: "'살까 말까' 고민 줄이는 경험",
      content:
        "사기 전에 미리 입어본 느낌! 덕분에 충동구매 줄었어요 어떤 색이 어울릴지 고민했는데 피팅으로 비교해보고 쉽게 결정했어요 이제 옷 살 때 무조건 보고핏 먼저 켜고 봐요",
    },
    {
      title: "스타일 공유 후기.zip",
      subtitle: "나만의 스타일, 공개하는 재미",
      content:
        "코디 공유하고 댓글 받으니까 패션 SNS 느낌도 있어서 좋아요 내 피팅샷도 올릴 수 있고 다른 사람 보면서 영감도 많이 받아요 보고핏 덕분에 처음으로 내 스타일을 자랑하고 싶다는 생각이 들었어요",
    },
  ];

  const techFeatures = [
    {
      title: "포즈 추정 & 핏 추정",
      description:
        "AI 기반 신체 포즈 추정 기술 적용\n\n옷의 변화, 각도, 움직임에 따라\n핏 자동 조정",
    },
    {
      title: "정밀한 의류 특성 표현",
      description:
        "옷의 질감, 그림자, 세부 텍스쳐\n유지\n\n색상, 재질 등을 실제처럼 시각화\n\n셔츠, 바지, 원피스 등\n동시 피팅 가능",
    },
    {
      title: "착용감 반영 기술",
      description:
        "늘어남, 접힘, 길이 조정 등 반영\n\n실제 입었을 때와\n유사한 피팅 경험 제공\n\n사용자의 신체를 분석하여\n정확한 핏 구현",
    },
    {
      title: "패션 아이템 피팅",
      description:
        "모자, 선글라스, 가방 등\n모든 액세서리 가상 피팅 가능\n\n사용자의 신체를 분석하여\n아이템 위치 구현",
    },
  ];

  return (
    <div className="w-full line-seed-kr">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#ff2acabd] to-[#ffa8e8] overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-widest">
              BOGOFIT
            </h1>
            <p className="text-lg text-white font-bold mb-8">
              입어보기 전에, 먼저 경험하다.
            </p>
          </motion.div>

          {/* Floating Comments */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative hidden md:block"
          >
            <div className="absolute -top-14 left-1/4 transform -translate-x-1/2">
              <div className="bg-white rounded-full px-4 py-2 shadow-lg">
                <span className="text-sm text-gray-800">
                  입어보니까 안 어울리는데 환불은 번거롭고...
                </span>
              </div>
              <div className="text-4xl ml-8 mt-2">🤔</div>
            </div>

            <div className="absolute top-16 right-1/4 transform translate-x-1/2">
              <div className="bg-white rounded-full px-4 py-2 shadow-lg">
                <span className="text-sm text-gray-800">
                  내 체형에 어울리는 스타일이 뭔지 모르겠어요
                </span>
              </div>
              <div className="text-4xl mr-8 mt-2">😔</div>
            </div>

            <div className="absolute top-32 left-1/6">
              <div className="bg-white rounded-full px-4 py-2 shadow-lg">
                <span className="text-sm text-gray-800">
                  사이즈는 잘 맞는데, 핏이 이상해서 안 입어요
                </span>
              </div>
              <div className="text-4xl ml-8 mt-2">😅</div>
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white leading-relaxed">
              입어보지 않아도, 알 수 있게.
              <br />
              보고핏이 해냅니다.
            </h2>
          </motion.div>

          {/* Mobile Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="w-80 h-96 mx-auto flex items-center justify-center">
              <Image
                src="/about/bogofitApp.png"
                alt="bogoFit"
                width={320}
                height={384}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="bg-gradient-to-b from-[#ffa8e8] to-[#ffc698] py-20 pt-0">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#ef0080] mb-8 leading-tight">
              모델 핏 말고 내 핏,
              <br />
              보고핏으로 시작하자!
            </h2>

            <div className="bg-white rounded-full px-8 py-4 inline-block mb-8">
              <span className="text-xl font-bold text-black">
                이런 경험 있으시죠?
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-16"
          >
            {painPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-full px-6 py-3 shadow-lg"
              >
                <span className="text-black text-center block">{point}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-xl font-bold text-black mb-8">
              온라인 쇼핑 반품 사유 1위는?
            </h3>

            <div className="flex justify-center gap-2 text-5xl font-black">
              <span className="w-20 h-20 bg-[#fdf3e7] rounded-full flex items-center justify-center text-[#1a1a40]">
                핏
              </span>
              <span className="w-20 h-20 bg-[#ffdada] rounded-full flex items-center justify-center text-[#e5484d]">
                불
              </span>
              <span className="w-20 h-20 bg-[#ffdada] rounded-full flex items-center justify-center text-[#e5484d]">
                일
              </span>
              <span className="w-20 h-20 bg-[#ffdada] rounded-full flex items-center justify-center text-[#e5484d]">
                치
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Answer Section */}
      <section className="bg-gradient-to-b from-[#ffc698] to-[#ff9c9c] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#ef0080] leading-tight">
              경험하지 못한
              <br />
              쇼핑의 정답
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-100 rounded-2xl p-6 text-center"
              >
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-[#30366f] mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#30366f] whitespace-pre-line leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* User Reviews Section */}
      <section className="bg-gradient-to-b from-[#ff9c9c] to-[#ffb1f5] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#ef0080] mb-4">
              보고핏 사용기.ZIP
            </h2>
            <p className="text-black">보고핏 어땠냐고요? 직접 물어봤어요</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-100 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">📁</div>
                  <div>
                    <h3 className="font-bold text-[#1e2672]">{review.title}</h3>
                    <p className="text-sm text-black">{review.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-[#30366f] leading-relaxed">
                  {review.content}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="bg-gradient-to-b from-[#ffb0f4] to-[#ffdfd8] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#673030] mb-8">
              한눈에 보고핏
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {techFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 text-center"
              >
                <h3 className="text-lg font-bold text-black mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm text-black whitespace-pre-line leading-relaxed">
                  {feature.description}
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  (자료 사진, GIF 첨부)
                </p>
                <div className="flex justify-center gap-1 mt-4">
                  {[0, 1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className={`w-3 h-3 rounded-full ${
                        dot === index ? "bg-[#e352b7]" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-[#ffded9] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-black mb-8 flex flex-col items-center">
              <span className="text-[#D39090] text-2xl">
                지금까지의 쇼핑이 아닌,{" "}
              </span>
              <span className="text-[#E153B7]">지금부터의 쇼핑</span>
            </h2>

            <div className="w-80 h-96 mx-auto mb-8 flex items-center justify-center">
              <Image
                src="/about/bogofitApp.png"
                alt="bogoFit"
                width={320}
                height={384}
              />
            </div>

            <p className="text-[#e153b7] font-bold text-xl mb-8 leading-relaxed">
              피팅의 경계를 넘어
              <br />
              새로운 쇼핑을 경험하세요
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
