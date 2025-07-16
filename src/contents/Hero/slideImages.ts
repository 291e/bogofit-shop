export interface HeroBannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  alt: string;
  discount?: string;
  backgroundColor: string;
  textColor: string;
  priority?: boolean; // 첫 번째 이미지 우선 로딩
}

export const heroBannerSlides: HeroBannerSlide[] = [
  {
    id: 1,
    title: "신상품 런칭 기념",
    subtitle: "보고핏 여름 컬렉션",
    description: "시원하고 편안한 운동복으로 완벽한 여름을 준비하세요",
    buttonText: "지금 쇼핑하기",
    buttonLink: "/products?badge=NEW",
    image: "/hero/image1.png",
    alt: "보고핏 여름 컬렉션 신상품",
    discount: "최대 50%",
    backgroundColor:
      "bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600",
    textColor: "text-white",
    priority: true,
  },
  {
    id: 2,
    title: "타임세일 진행중",
    subtitle: "베스트셀러 특가전",
    description: "인기 상품들을 특별가로 만나보세요",
    buttonText: "특가 상품 보기",
    buttonLink: "/products?badge=SALE",
    image: "/hero/image2.png",
    alt: "베스트셀러 특가전 상품",
    discount: "50% OFF",
    backgroundColor: "bg-gradient-to-br from-red-200 via-red-400 to-pink-600",
    textColor: "text-white",
  },
  {
    id: 3,
    title: "멤버십 혜택",
    subtitle: "무료배송 + 적립금",
    description: "회원가입하고 다양한 혜택을 받아보세요",
    buttonText: "회원가입하기",
    buttonLink: "/register",
    image: "/hero/image3.png",
    alt: "멤버십 혜택 안내",
    backgroundColor:
      "bg-gradient-to-br from-green-500 via-green-600 to-teal-600",
    textColor: "text-white",
  },
  {
    id: 4,
    title: "트렌드 룩북",
    subtitle: "스타일링 가이드",
    description: "이번 시즌 트렌드 아이템으로 완성하는 퍼펙트 룩",
    buttonText: "룩북 보기",
    buttonLink: "/category/lookbook",
    image: "/hero/image4.png",
    alt: "트렌드 룩북 스타일링",
    backgroundColor:
      "bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600",
    textColor: "text-white",
  },
  {
    id: 5,
    title: "브랜드 스토리",
    subtitle: "보고핏의 철학",
    description: "건강한 라이프스타일을 위한 프리미엄 스포츠웨어",
    buttonText: "브랜드 알아보기",
    buttonLink: "/about",
    image: "/hero/image5.png",
    alt: "보고핏 브랜드 스토리",
    backgroundColor: "bg-gradient-to-br from-gray-700 via-gray-800 to-black",
    textColor: "text-white",
  },
];

// 이미지 프리로드용 별도 배열
export const heroImageUrls = heroBannerSlides.map((slide) => slide.image);
