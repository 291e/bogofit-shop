// 상품 등록 폼에서 사용할 데이터들

export const productCategories = ["상의", "하의", "원피스", "아우터"];

export const productBadges = [
  "BEST",
  "NEW",
  "SALE",
  "HOT",
  "PREMIUM",
  "LIMITED",
];

// 세부 카테고리 데이터
export const subCategoryMap: Record<
  string,
  Array<{ name: string; keyword: string; image: string }>
> = {
  상의: [
    { name: "후드", keyword: "후드", image: "/images/categories/hood.jpg" },
    {
      name: "맨투맨",
      keyword: "맨투맨",
      image: "/images/categories/sweatshirt.jpg",
    },
    { name: "니트", keyword: "니트", image: "/images/categories/knit.jpg" },
    { name: "셔츠", keyword: "셔츠", image: "/images/categories/shirt.jpg" },
    {
      name: "긴소매티셔츠",
      keyword: "긴소매",
      image: "/images/categories/longsleeve.jpg",
    },
    {
      name: "블라우스",
      keyword: "블라우스",
      image: "/images/categories/blouse.jpg",
    },
    { name: "조끼", keyword: "조끼", image: "/images/categories/vest.jpg" },
    {
      name: "반소매티셔츠",
      keyword: "반소매",
      image: "/images/categories/shortsleeve.jpg",
    },
    {
      name: "민소매",
      keyword: "민소매",
      image: "/images/categories/sleeveless.jpg",
    },
    {
      name: "티셔츠",
      keyword: "티셔츠",
      image: "/images/categories/tshirt.jpg",
    },
  ],
  하의: [
    {
      name: "청바지",
      keyword: "청바지",
      image: "/images/categories/jeans.jpg",
    },
    {
      name: "면바지",
      keyword: "면바지",
      image: "/images/categories/cotton-pants.jpg",
    },
    {
      name: "슬랙스",
      keyword: "슬랙스",
      image: "/images/categories/slacks.jpg",
    },
    {
      name: "조거팬츠",
      keyword: "조거",
      image: "/images/categories/jogger.jpg",
    },
    {
      name: "반바지",
      keyword: "반바지",
      image: "/images/categories/shorts.jpg",
    },
    {
      name: "레깅스",
      keyword: "레깅스",
      image: "/images/categories/leggings.jpg",
    },
    {
      name: "스커트",
      keyword: "스커트",
      image: "/images/categories/skirt.jpg",
    },
    {
      name: "트레이닝팬츠",
      keyword: "트레이닝",
      image: "/images/categories/training.jpg",
    },
  ],
  아우터: [
    { name: "코트", keyword: "코트", image: "/images/categories/coat.jpg" },
    { name: "자켓", keyword: "자켓", image: "/images/categories/jacket.jpg" },
    { name: "패딩", keyword: "패딩", image: "/images/categories/padding.jpg" },
    { name: "점퍼", keyword: "점퍼", image: "/images/categories/jumper.jpg" },
    {
      name: "가디건",
      keyword: "가디건",
      image: "/images/categories/cardigan.jpg",
    },
    { name: "집업", keyword: "집업", image: "/images/categories/zipup.jpg" },
    {
      name: "블레이저",
      keyword: "블레이저",
      image: "/images/categories/blazer.jpg",
    },
    {
      name: "트렌치코트",
      keyword: "트렌치",
      image: "/images/categories/trench.jpg",
    },
  ],
  원피스: [
    {
      name: "미니원피스",
      keyword: "미니",
      image: "/images/categories/mini-dress.jpg",
    },
    {
      name: "미디원피스",
      keyword: "미디",
      image: "/images/categories/midi-dress.jpg",
    },
    {
      name: "맥시원피스",
      keyword: "맥시",
      image: "/images/categories/maxi-dress.jpg",
    },
    {
      name: "셔츠원피스",
      keyword: "셔츠원피스",
      image: "/images/categories/shirt-dress.jpg",
    },
    {
      name: "니트원피스",
      keyword: "니트원피스",
      image: "/images/categories/knit-dress.jpg",
    },
    { name: "튜닉", keyword: "튜닉", image: "/images/categories/tunic.jpg" },
  ],
};
