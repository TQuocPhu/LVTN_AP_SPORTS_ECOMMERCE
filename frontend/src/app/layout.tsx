import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LVTN Fullstack Platform - Next.js & Spring Boot 3",
  description: "Hệ thống Fullstack hiện đại sử dụng Next.js (App Router, TypeScript, Tailwind CSS) kết hợp Spring Boot 3.3.5 (Java 21, Gradle, Redis, WebSocket, Security).",
  keywords: ["Next.js", "Spring Boot 3", "Java 21", "TypeScript", "Tailwind CSS", "LVTN"],
  authors: [{ name: "LVTN Team" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "LVTN Fullstack Platform - Next.js & Spring Boot 3",
    description: "Hệ thống Fullstack hiện đại sử dụng Next.js (App Router) & Spring Boot 3 (Java 21).",
    url: "http://localhost:3000",
    siteName: "LVTN Workspace",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LVTN Fullstack Platform - Next.js & Spring Boot 3",
    description: "Hệ thống Fullstack hiện đại sử dụng Next.js (App Router) & Spring Boot 3 (Java 21).",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
