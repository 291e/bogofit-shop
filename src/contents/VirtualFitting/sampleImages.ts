export interface SampleImage {
  id: string;
  src: string;
  alt: string;
  category?: string;
}

// 사람 이미지 샘플 (hero/image1~8.png)
export const humanSamples: SampleImage[] = [
  {
    id: "human-2",
    src: "/images/human/image2.jpg",
    alt: "모델 이미지 1",
  },
  {
    id: "human-3",
    src: "/images/human/image3.jpg",
    alt: "모델 이미지 2",
  },
  {
    id: "human-4",
    src: "/images/human/image4.jpg",
    alt: "모델 이미지 3",
  },
  {
    id: "human-5",
    src: "/images/human/image5.jpg",
    alt: "모델 이미지 4",
  },
  {
    id: "human-6",
    src: "/images/human/image6.jpg",
    alt: "모델 이미지 5",
  },
  {
    id: "human-7",
    src: "/images/human/image7.jpg",
    alt: "모델 이미지 6",
  },
  {
    id: "human-8",
    src: "/images/human/image8.jpg",
    alt: "모델 이미지 7",
  },
];

// 상의 이미지 샘플 (실제 제품 이미지 예시)
export const garmentSamples: SampleImage[] = [
  {
    id: "garment-1",
    src: "/images/top/shirt01.jpg",
    alt: "상의 샘플 1",
    category: "상의",
  },
  {
    id: "garment-2",
    src: "/images/top/shirt02.jpg",
    alt: "아우터 샘플 1",
    category: "아우터",
  },
  {
    id: "garment-3",
    src: "/images/top/shirt03.jpg",
    alt: "원피스 샘플 1",
    category: "원피스",
  },
  {
    id: "garment-4",
    src: "/images/top/shirt04.jpg",
    alt: "원피스 샘플 1",
    category: "원피스",
  },
  {
    id: "garment-5",
    src: "/images/top/shirt05.jpg",
    alt: "원피스 샘플 1",
    category: "원피스",
  },
];

// 하의 이미지 샘플
export const lowerSamples: SampleImage[] = [
  {
    id: "lower-1",
    src: "/images/bottom/bottom001.png",
    alt: "하의 샘플 1",
    category: "하의",
  },
  {
    id: "lower-2",
    src: "/images/bottom/bottom002.png",
    alt: "하의 샘플 2",
    category: "하의",
  },
  {
    id: "lower-3",
    src: "/images/bottom/bottom003.png",
    alt: "하의 샘플 3",
    category: "하의",
  },
  {
    id: "lower-4",
    src: "/images/bottom/bottom004.png",
    alt: "하의 샘플 4",
    category: "하의",
  },
  {
    id: "lower-5",
    src: "/images/bottom/bottom005.png",
    alt: "하의 샘플 5",
    category: "하의",
  },
];

// 배경 이미지 샘플 (bg/bg1~6.jpg)
export const backgroundSamples: SampleImage[] = [
  {
    id: "bg-1",
    src: "/images/bg/background_001.png",
    alt: "배경 이미지 1",
  },
  {
    id: "bg-2",
    src: "/images/bg/background_002.png",
    alt: "배경 이미지 2",
  },
  {
    id: "bg-3",
    src: "/images/bg/background_003.png",
    alt: "배경 이미지 3",
  },
  {
    id: "bg-4",
    src: "/images/bg/background_004.png",
    alt: "배경 이미지 4",
  },
  {
    id: "bg-5",
    src: "/images/bg/background_005.png",
    alt: "배경 이미지 5",
  },
];
