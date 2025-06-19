import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  async rewrites() {
    return [
      {
        source: "/api/graphql",
        destination: "https://api.bogofit.kr/graphql",
      },
      {
        source: "/api/virtual-fitting/:path*",
        destination:
          "http://ec2-15-164-186-97.ap-northeast-2.compute.amazonaws.com:5001/:path*",
      },
    ];
  },
  images: {
    domains: [
      "bogofit.s3.ap-northeast-2.amazonaws.com",
      "www.wunderstory.co.kr",
      "wunderstory.co.kr",
      "cdn.klingai.com",
      "s3.amazonaws.com",
      "amazonaws.com",
      // AI 서버 도메인
      "ec2-15-164-186-97.ap-northeast-2.compute.amazonaws.com",
      // 필요시 다른 CDN이나 이미지 도메인 추가
    ],
  },
};

export default nextConfig;
