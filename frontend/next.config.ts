import type { NextConfig } from "next";

/**
 * Cấu hình Next.js cho hệ thống AP Sports Storefront & Admin.
 * - Map biến môi trường `CUSTOMER_ID` (Google OAuth2 Client ID) xuống Client (KHÔNG map `CUSTOMER_SECRET_CODE` để bảo mật).
 * - Cho phép hiển thị ảnh từ Cloudinary, Unsplash và Google Avatar CDN (`lh3.googleusercontent.com`).
 */
const nextConfig: NextConfig = {
  env: {
    CUSTOMER_ID: process.env.CUSTOMER_ID || "",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
