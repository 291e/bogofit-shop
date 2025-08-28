// "use client";

// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";

// // Swiper imports
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import "swiper/css/effect-coverflow";
// // import { slideImages } from "@/contents/Hero/slideImages";
// import { Libre_Bodoni } from "next/font/google";

// const LibreBodoni = Libre_Bodoni({ subsets: ["latin"] });

// export default function HeroBanner() {
//   return (
//     <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
//       {/* 배경 이미지 */}
//       <div className="absolute inset-0">
//         <Image
//           src="/hero/bg.png"
//           alt="배경 이미지"
//           fill
//           className="object-cover"
//           priority
//         />
//       </div>

//       {/* 슬라이드 이미지들 */}
//       <div className="absolute inset-0 flex items-center justify-center z-10">
//         <div className="w-full max-w-7xl mx-auto px-4">
//           <Swiper
//             modules={[Autoplay]}
//             spaceBetween={30}
//             slidesPerView={1}
//             centeredSlides={true}
//             loop={true}
//             autoplay={{
//               delay: 4000,
//               disableOnInteraction: false,
//               pauseOnMouseEnter: true,
//             }}
//             breakpoints={{
//               320: {
//                 slidesPerView: 1,
//                 spaceBetween: 20,
//               },
//               640: {
//                 slidesPerView: 1.5,
//                 spaceBetween: 30,
//               },
//               768: {
//                 slidesPerView: 2,
//                 spaceBetween: 40,
//               },
//               1024: {
//                 slidesPerView: 2.5,
//                 spaceBetween: 50,
//               },
//               1280: {
//                 slidesPerView: 3,
//                 spaceBetween: 60,
//               },
//             }}
//             className="w-full h-[600px]"
//           >
//             {slideImages.map((image) => (
//               <SwiperSlide key={image.id}>
//                 <div className="relative w-full h-full group cursor-pointer">
//                   {/* 이미지 컨테이너 */}
//                   <div className="relative w-full h-full transition-all duration-300 group-hover:scale-105">
//                     <Image
//                       src={image.src}
//                       alt={image.alt}
//                       fill
//                       className="object-contain transition-transform duration-300 group-hover:scale-110"
//                       priority
//                     />
//                   </div>
//                 </div>
//               </SwiperSlide>
//             ))}
//           </Swiper>
//         </div>
//       </div>

//       {/* 메인 콘텐츠 */}
//       <div className="relative z-20 flex items-start justify-center h-full px-4 pb-18">
//         <div className="text-center text-white max-w-4xl mx-auto h-full flex flex-col justify-between">
//           <motion.h1
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="pt-16 text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 flex flex-col items-center "
//           >
//             <span className={`${LibreBodoni.className} drop-shadow-lg`}>
//               BOGOFIT SHOP
//             </span>
//           </motion.h1>

//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.6 }}
//             className="flex flex-col sm:flex-row gap-4 justify-center items-center"
//           >
//             <Button
//               variant="outline"
//               size="lg"
//               className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300 hover:scale-105"
//             >
//               <Link href="/products">상품 둘러보기</Link>
//             </Button>
//           </motion.div>
//         </div>
//       </div>

//       {/* 하단 스크롤 인디케이터 */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1, delay: 1 }}
//         className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20"
//       >
//         <motion.div
//           animate={{ y: [0, 10, 0] }}
//           transition={{ duration: 2, repeat: Infinity }}
//           className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
//         >
//           <div className="w-1 h-3 bg-white/70 rounded-full mt-2" />
//         </motion.div>
//       </motion.div>

//       {/* Swiper 스타일 커스터마이징 */}
//       <style jsx global>{`
//         .swiper-slide {
//           transition: all 0.3s ease !important;
//         }

//         .swiper-slide-active {
//           transform: scale(1.1) !important;
//         }

//         .swiper-slide-next,
//         .swiper-slide-prev {
//           transform: scale(0.9) !important;
//           opacity: 0.7 !important;
//         }
//       `}</style>
//     </section>
//   );
// }
