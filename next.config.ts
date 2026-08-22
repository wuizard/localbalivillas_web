import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sstaging-localbalivilla.s3-ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3-ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 82],
    deviceSizes: [375, 640, 1024, 1920],
    minimumCacheTTL: 31_536_000,
  },
};

export default nextConfig;
