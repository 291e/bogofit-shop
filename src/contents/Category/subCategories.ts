// 세부 카테고리 데이터
export const subCategoryMap: Record<
  string,
  Array<{ name: string; keyword: string }>
> = {
  top: [
    { name: "모두", keyword: "" },
    { name: "후드", keyword: "후드" },
    { name: "맨투맨", keyword: "맨투맨" },
    { name: "니트", keyword: "니트" },
    { name: "셔츠", keyword: "셔츠" },
    { name: "긴소매티셔츠", keyword: "긴소매" },
    { name: "블라우스", keyword: "블라우스" },
    { name: "조끼", keyword: "조끼" },
    { name: "반소매티셔츠", keyword: "반소매" },
    { name: "민소매", keyword: "민소매" },
    { name: "티셔츠", keyword: "티셔츠" },
  ],
  bottom: [
    { name: "모두", keyword: "" },
    { name: "청바지", keyword: "청바지" },
    { name: "면바지", keyword: "면바지" },
    { name: "슬랙스", keyword: "슬랙스" },
    { name: "조거팬츠", keyword: "조거" },
    { name: "반바지", keyword: "반바지" },
    { name: "레깅스", keyword: "레깅스" },
    { name: "스커트", keyword: "스커트" },
    { name: "트레이닝팬츠", keyword: "트레이닝" },
  ],
  outer: [
    { name: "모두", keyword: "" },
    { name: "코트", keyword: "코트" },
    { name: "자켓", keyword: "자켓" },
    { name: "패딩", keyword: "패딩" },
    { name: "점퍼", keyword: "점퍼" },
    { name: "가디건", keyword: "가디건" },
    { name: "집업", keyword: "집업" },
    { name: "블레이저", keyword: "블레이저" },
    { name: "트렌치코트", keyword: "트렌치" },
  ],
  onepiece: [
    { name: "모두", keyword: "" },
    { name: "미니원피스", keyword: "미니" },
    { name: "미디원피스", keyword: "미디" },
    { name: "맥시원피스", keyword: "맥시" },
    { name: "셔츠원피스", keyword: "셔츠원피스" },
    { name: "니트원피스", keyword: "니트원피스" },
    { name: "튜닉", keyword: "튜닉" },
  ],
};

export const categoryMap: Record<string, string> = {
  top: "상의",
  bottom: "하의",
  outer: "아우터",
  onepiece: "원피스",
};
