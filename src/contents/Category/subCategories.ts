// 세부 카테고리 데이터
export const subCategoryMap: Record<
  string,
  Array<{ nameKey: string; keyword: string }>
> = {
  top: [
    { nameKey: "product.subcategory.all", keyword: "" },
    { nameKey: "product.subcategory.hoodie", keyword: "후드" },
    { nameKey: "product.subcategory.sweatshirt", keyword: "맨투맨" },
    { nameKey: "product.subcategory.knit", keyword: "니트" },
    { nameKey: "product.subcategory.shirt", keyword: "셔츠" },
    { nameKey: "product.subcategory.longSleeveT", keyword: "긴소매" },
    { nameKey: "product.subcategory.blouse", keyword: "블라우스" },
    { nameKey: "product.subcategory.vest", keyword: "조끼" },
    { nameKey: "product.subcategory.shortSleeveT", keyword: "반소매" },
    { nameKey: "product.subcategory.sleeveless", keyword: "민소매" },
    { nameKey: "product.subcategory.tshirt", keyword: "티셔츠" },
  ],
  bottom: [
    { nameKey: "product.subcategory.all", keyword: "" },
    { nameKey: "product.subcategory.jeans", keyword: "청바지" },
    { nameKey: "product.subcategory.chinos", keyword: "면바지" },
    { nameKey: "product.subcategory.slacks", keyword: "슬랙스" },
    { nameKey: "product.subcategory.joggers", keyword: "조거" },
    { nameKey: "product.subcategory.shorts", keyword: "반바지" },
    { nameKey: "product.subcategory.leggings", keyword: "레깅스" },
    { nameKey: "product.subcategory.skirt", keyword: "스커트" },
    { nameKey: "product.subcategory.trainingPants", keyword: "트레이닝" },
  ],
  outer: [
    { nameKey: "product.subcategory.all", keyword: "" },
    { nameKey: "product.subcategory.coat", keyword: "코트" },
    { nameKey: "product.subcategory.jacket", keyword: "자켓" },
    { nameKey: "product.subcategory.puffer", keyword: "패딩" },
    { nameKey: "product.subcategory.jumper", keyword: "점퍼" },
    { nameKey: "product.subcategory.cardigan", keyword: "가디건" },
    { nameKey: "product.subcategory.zipup", keyword: "집업" },
    { nameKey: "product.subcategory.blazer", keyword: "블레이저" },
    { nameKey: "product.subcategory.trenchCoat", keyword: "트렌치" },
  ],
  onepiece: [
    { nameKey: "product.subcategory.all", keyword: "" },
    { nameKey: "product.subcategory.miniDress", keyword: "미니" },
    { nameKey: "product.subcategory.midiDress", keyword: "미디" },
    { nameKey: "product.subcategory.maxiDress", keyword: "맥시" },
    { nameKey: "product.subcategory.shirtDress", keyword: "셔츠원피스" },
    { nameKey: "product.subcategory.knitDress", keyword: "니트원피스" },
    { nameKey: "product.subcategory.tunic", keyword: "튜닉" },
  ],
};

// 카테고리 한글명은 API 검색용으로 유지
export const categoryMap: Record<string, string> = {
  top: "상의",
  bottom: "하의",
  outer: "아우터",
  onepiece: "원피스",
};
