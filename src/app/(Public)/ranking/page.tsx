import { Metadata } from "next";
import { RankingPageClient } from "./RankingPageClient";

export const metadata: Metadata = {
    title: "베스트 리뷰 랭킹 - BOGOFIT",
    description: "고객들이 가장 높게 평가한 베스트 리뷰 상품들을 만나보세요!",
};

export default function RankingPage() {
    return <RankingPageClient />;
}

