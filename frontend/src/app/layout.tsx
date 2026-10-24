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
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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
import ChatbotWidgetUI from "@/components/common/chatbot/ChatbotWidgetUI";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link
          rel="icon"
          href="/favicon.ico"
          sizes="any"
        />
        <link
          rel="shortcut icon"
          href="/favicon.ico"
        />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col text-slate-100 transition-colors duration-300"
      >
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <CartProvider>
                <WishlistProvider>
                  {/* Top-Right Sonner Toast Notification Container */}
                  <ToastProvider />

                  {/* Slot hiển thị Thanh thông tin đầu trang (ClientTopBar) nằm phía trên Header Logo Navbar, dính sticky cùng Navbar */}
                  <div id="client-top-bar-slot" className="w-full shrink-0 sticky top-0 z-[45]" />

                  {/* Master Shell Navbar Header */}
                  <Navbar />

                  {/* Main Application Page Content */}
                  <div className="flex-1 flex flex-col">{children}</div>

                  {/* Master Shell Footer */}
                  <Footer />

                  {/* Floating AI Chatbot Assistant Widget */}
                  <ChatbotWidgetUI />
                </WishlistProvider>
              </CartProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
