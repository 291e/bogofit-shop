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
  {
    id: "human-9",
    src: "/images/human/image9.jpg",
    alt: "모델 이미지 8",
  },
  {
    id: "human-10",
    src: "/images/human/image10.jpg",
    alt: "모델 이미지 9",
  },
  {
    id: "human-11",
    src: "/images/human/image11.jpg",
    alt: "모델 이미지 10",
  },
  {
    id: "human-12",
    src: "/images/human/image12.jpg",
    alt: "모델 이미지 11",
  },
  {
    id: "human-13",
    src: "/images/human/image13.jpg",
    alt: "모델 이미지 12",
  },
  {
    id: "human-14",
    src: "/images/human/image14.jpg",
    alt: "모델 이미지 13",
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
  {
    id: "garment-6",
    src: "/images/top/shirt06.jpg",
    alt: "원피스 샘플 1",
    category: "원피스",
  },
  {
    id: "garment-7",
    src: "/images/top/shirt07.jpg",
    alt: "원피스 샘플 1",
    category: "원피스",
  },
  {
    id: "garment-8",
    src: "/images/top/shirt08.jpg",
    alt: "원피스 샘플 1",
    category: "원피스",
  },
  {
    id: "garment-9",
    src: "/images/top/shirt09.jpg",
    alt: "원피스 샘플 1",
    category: "원피스",
  },
  {
    id: "garment-10",
    src: "/images/top/shirt10.jpg",
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
  {
    id: "lower-6",
    src: "/images/bottom/bottom006.png",
    alt: "하의 샘플 6",
    category: "하의",
  },
  {
    id: "lower-7",
    src: "/images/bottom/bottom007.png",
    alt: "하의 샘플 7",
    category: "하의",
  },
  {
    id: "lower-8",
    src: "/images/bottom/bottom008.png",
    alt: "하의 샘플 8",
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

// 아이템 이미지 샘플 (item/image1~3.jpg) - V2 전용
export const itemSamples: SampleImage[] = [
  {
    id: "item-1",
    src: "/item/image1.jpg",
    alt: "아이템 샘플 1",
  },
  {
    id: "item-2",
    src: "/item/image2.jpg",
    alt: "아이템 샘플 2",
  },
  {
    id: "item-3",
    src: "/item/image3.jpg",
    alt: "아이템 샘플 3",
  },
  {
    id: "item-4",
    src: "/item/image4.jpg",
    alt: "아이템 샘플 4",
  },
  {
    id: "item-5",
    src: "/item/image5.jpg",
    alt: "아이템 샘플 5",
  },

];

// 헤어 이미지 샘플 (hair/hair_1~7.png) - Hair Solution 전용
export const hairSamples: SampleImage[] = [
  {
    id: "hair-1",
    src: "/hair/hair_1.png",
    alt: "헤어 샘플 1",
  },
  {
    id: "hair-2",
    src: "/hair/hair_2.png",
    alt: "헤어 샘플 2",
  },
  {
    id: "hair-3",
    src: "/hair/hair_3.png",
    alt: "헤어 샘플 3",
  },
  {
    id: "hair-4",
    src: "/hair/hair_4.png",
    alt: "헤어 샘플 4",
  },
  {
    id: "hair-5",
    src: "/hair/hair_5.png",
    alt: "헤어 샘플 5",
  },
  {
    id: "hair-6",
    src: "/hair/hair_6.png",
    alt: "헤어 샘플 6",
  },
  {
    id: "hair-7",
    src: "/hair/hair_7.png",
    alt: "헤어 샘플 7",
  },
];


export const hairColorSamples: SampleImage[] = [
  {
    id: "hair-color-1",
    src: "/hairColor/Image1.jpg",
    alt: "헤어 컬러 샘플 1",
  },
  {
    id: "hair-color-2",
    src: "/hairColor/Image2.jpg",
    alt: "헤어 컬러 샘플 2",
  },
  {
    id: "hair-color-3",
    src: "/hairColor/Image3.jpg",
    alt: "헤어 컬러 샘플 3",
  },
  {
    id: "hair-color-4",
    src: "/hairColor/Image4.jpg",
    alt: "헤어 컬러 샘플 4",
  },
  {
    id: "hair-color-5",
    src: "/hairColor/Image5.jpg",
    alt: "헤어 컬러 샘플 5",
  },
  {
    id: "hair-color-6",
    src: "/hairColor/Image6.jpg",
    alt: "헤어 컬러 샘플 6",
  },
  {
    id: "hair-color-7",
    src: "/hairColor/Image7.jpg",
    alt: "헤어 컬러 샘플 7",
  },
  {
    id: "hair-color-8",
    src: "/hairColor/Image8.jpg",
    alt: "헤어 컬러 샘플 8",
  },
  {
    id: "hair-color-9",
    src: "/hairColor/Image9.jpg",
    alt: "헤어 컬러 샘플 9",
  },
  {
    id: "hair-color-10",
    src: "/hairColor/Image10.jpg",
    alt: "헤어 컬러 샘플 10",
  },
  {
    id: "hair-color-11",
    src: "/hairColor/Image11.jpg",
    alt: "헤어 컬러 샘플 11",
  },
  {
    id: "hair-color-12",
    src: "/hairColor/Image12.jpg",
    alt: "헤어 컬러 샘플 12",
  },
  {
    id: "hair-color-13",
    src: "/hairColor/Image13.jpg",
    alt: "헤어 컬러 샘플 13",
  },
  {
    id: "hair-color-14",
    src: "/hairColor/Image14.jpg",
    alt: "헤어 컬러 샘플 14",
  },
  {
    id: "hair-color-15",
    src: "/hairColor/Image15.jpg",
    alt: "헤어 컬러 샘플 15",
  },
  {
    id: "hair-color-16",
    src: "/hairColor/Image16.jpg",
    alt: "헤어 컬러 샘플 16",
  },
];

