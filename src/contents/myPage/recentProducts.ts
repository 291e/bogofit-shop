export interface RecentProduct {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
}

export const recentProducts: RecentProduct[] = [
  {
    id: "1",
    title: "나이키 에어맥스 270",
    imageUrl: "/images/products/airmax270.jpg",
    price: 120000,
  },
  {
    id: "2",
    title: "아디다스 울트라부스트",
    imageUrl: "/images/products/ultraboost.jpg",
    price: 150000,
  },
  // ...더미 데이터 추가 가능
];
