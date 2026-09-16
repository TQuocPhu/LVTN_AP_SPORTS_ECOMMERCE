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
  title: "AP Sports - Trang Thiết Bị Thể Thao Nguyên Bản Chuyên Nghiệp",
  description:
    "Hệ thống mua sắm trang thiết bị, dụng cụ thể thao cao cấp chính hãng 100%.",
  keywords: [
    "AP Sports",
    "Đồ thể thao",
    "Giày bóng đá",
    "Vợt cầu lông",
    "Bóng rổ",
    "Dụng cụ Gym",
  ],
  icons: {
    icon: "/images/ap-sports_fav.png",
    shortcut: "/images/ap-sports_fav.png",
    apple: "/images/ap-sports_fav.png",
  },
  authors: [{ name: "AP Sports Team" }],
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
    title: "AP Sports - Trang Thiết Bị Thể Thao Nguyên Bản Chuyên Nghiệp",
    description:
      "Hệ thống mua sắm trang thiết bị, dụng cụ thể thao cao cấp chính hãng 100%.",
    url: "http://localhost:3000",
    siteName: "AP Sports Storefront",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AP Sports - Trang Thiết Bị Thể Thao Nguyên Bản Chuyên Nghiệp",
    description:
      "Hệ thống mua sắm trang thiết bị, dụng cụ thể thao cao cấp chính hãng 100%.",
  },
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/components/providers/ToastProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="icon"
          href="/images/ap-sports_fav.png"
          type="image/png"
          sizes="any"
        />
        <link
          rel="shortcut icon"
          href="/images/ap-sports_fav.png"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/images/ap-sports_fav.png" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-950 text-slate-100 transition-colors duration-300"
      >
        <ThemeProvider>
          {/* Global Auth State Provider – chia sẻ user state toàn app */}
          <AuthProvider>
            {/* Top-Right Sonner Toast Notification Container */}
            <ToastProvider />

            {/* Master Shell Navbar Header */}
            <Navbar />

            {/* Main Application Page Content */}
            <div className="flex-1 flex flex-col">{children}</div>

            {/* Master Shell Footer */}
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
