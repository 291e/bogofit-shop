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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bogofit.s3.ap-northeast-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bogofit-images.s3.ap-northeast-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.wunderstory.co.kr",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wunderstory.co.kr",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.klingai.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "ec2-15-164-186-97.ap-northeast-2.compute.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
