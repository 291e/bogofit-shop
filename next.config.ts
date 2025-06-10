import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/graphql",
        destination: "https://api.bogofit.kr/graphql",
      },
    ];
  },
  images: {
    domains: [
      "bogofit.s3.ap-northeast-2.amazonaws.com",
      // 필요시 다른 CDN이나 이미지 도메인 추가
    ],
  },
};

export default nextConfig;
