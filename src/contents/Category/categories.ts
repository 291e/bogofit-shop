interface Category {
  id: number;
  name: string;
  image: string;
  href: string;
  special?: boolean;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "상의",
    image:
      "https://cf.image-farm.s.zigzag.kr/original/cms/2024/09/04/202409040247084988_028942.png",
    href: "/category/top",
  },
  {
    id: 2,
    name: "하의",
    image:
      "https://cf.image-farm.s.zigzag.kr/original/cms/2024/09/04/202409040247329301_046515.png",
    href: "/category/bottom",
  },
  {
    id: 3,
    name: "원피스",
    image:
      "https://cf.image-farm.s.zigzag.kr/original/cms/2024/09/04/202409040248027653_082406.png",
    href: "/category/dress",
  },
  {
    id: 4,
    name: "아우터",
    image:
      "https://cf.image-farm.s.zigzag.kr/original/cms/2024/09/04/202409040249159875_072097.png",
    href: "/category/outer",
  },
];
