"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  ShoppingBag,
  User,
  ChevronDown,
  LogOut,
  Heart,
  PackageCheck,
  UserCheck,
  LogIn,
  UserPlus,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import MiniCartDrawer from "./MiniCartDrawer";
import ConfirmLogoutModal from "@/components/ui/ConfirmLogoutModal";

import { useTheme } from "@/context/ThemeContext";

/**
 * Component Thanh Navigation Header Master Shell Navbar.
 * Đầy đủ Logo AP Sports, Link Sản phẩm trực tiếp, Cart Icon, User Avatar Dropdown và Mobile Responsive.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Không hiển thị Navbar trang bán hàng khi ở các route quản trị /admin
  // Đặt sau tất cả hooks để tuân thủ React Rules of Hooks
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    // Hard redirect – ép browser gửi HTTP request mới để middleware Edge bắt kiện
    window.location.href = "/";
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* 1. Phía Trái Cùng: Logo Thương Hiệu AP Sports (Bản nguyên không viền) */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <Image
                src="/images/ap-sports_logo_no-back.png"
                alt="AP Sports Logo"
                width={64}
                height={64}
                className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="brand-title text-2xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orange-400">
                AP SPORTS
              </span>
              <span className="text-[11px] font-bold text-orange-500 uppercase tracking-widest -mt-1">
                FLEXIBLE STORE
              </span>
            </div>
          </Link>

          {/* 2. Phần Giữa: Horizontal Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-bold text-slate-200 hover:text-orange-400 transition-colors py-2"
            >
              Trang Chủ
            </Link>

            <Link
              href="/products"
              className="text-sm font-bold text-slate-200 hover:text-orange-400 transition-colors py-2"
            >
              Sản Phẩm
            </Link>

            <Link
              href="/promotions"
              className="text-sm font-bold text-slate-200 hover:text-orange-400 transition-colors py-2"
            >
              Khuyến Mãi
            </Link>

            <Link
              href="/contact"
              className="text-sm font-bold text-slate-200 hover:text-orange-400 transition-colors py-2"
            >
              Liên Hệ
            </Link>
          </nav>

          {/* 3. Phía Phải: Theme Toggle, Cart Button & User Account Dropdown */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Nút Chuyển Đổi Giao Diện Sáng / Tối (Theme Toggle) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-orange-400 transition-colors shadow"
              title={
                theme === "dark"
                  ? "Đang ở chế độ Tối (Dark Mode)"
                  : "Đang ở chế độ Sáng (Light Mode)"
              }
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5 fill-amber-400/20" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
              )}
            </button>

            {/* Icon Giỏ Hàng (Mở Mini Cart Slide-over) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-orange-400 transition-colors group"
              title="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-md">
                2
              </span>
            </button>

            {/* Avatar / User Account Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setIsUserDropdownOpen(true)}
              onMouseLeave={() => setIsUserDropdownOpen(false)}
            >
              <button className="flex items-center space-x-2.5 p-1.5 pl-2.5 pr-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors">
                {user ? (
                  <div className="flex items-center space-x-2">
                    {user.avatar ? (
                      /* Avatar ảnh thực — cập nhật ngay lập tức qua AuthContext */
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={user.name || "Avatar"}
                        className="w-7 h-7 rounded-full object-cover border border-orange-500/40 shadow-sm"
                      />
                    ) : (
                      /* Fallback: chữ cái đầu khi chưa có avatar */
                      <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-bold text-xs">
                        {(user.name || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-bold max-w-[140px] truncate text-slate-100">
                      {user.name || user.email}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <User className="w-5 h-5 text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 hidden sm:inline">
                      Tài Khoản
                    </span>
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Account Dropdown Box (Wraps with top padding to bridge hover gap) */}
              {isUserDropdownOpen && (
                <div className="absolute top-full right-0 pt-2 w-56 z-50 animate-fade-in">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1">
                    {user ? (
                      // Menu khi ĐÃ ĐĂNG NHẬP
                      <>
                        <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                          <p className="text-xs text-slate-400">
                            Đã đăng nhập với tư cách
                          </p>
                          <p className="text-sm font-bold text-orange-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-orange-400 transition-colors"
                        >
                          <UserCheck className="w-4 h-4 text-slate-400" />
                          <span>Tài khoản cá nhân</span>
                        </Link>
                        <Link
                          href="/profile/orders"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-orange-400 transition-colors"
                        >
                          <PackageCheck className="w-4 h-4 text-slate-400" />
                          <span>Đơn hàng của tôi</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-orange-400 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          <span>Sản phẩm yêu thích</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            setIsLogoutModalOpen(true);
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </>
                    ) : (
                      // Menu khi CHƯA ĐĂNG NHẬP
                      <>
                        <Link
                          href="/login"
                          className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-orange-400 transition-colors"
                        >
                          <LogIn className="w-4 h-4 text-orange-400" />
                          <span>Đăng Nhập</span>
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 transition-colors border border-orange-500/30"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Đăng Ký</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* 4. Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-bold text-white py-2"
            >
              Trang Chủ
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-bold text-white py-2"
            >
              Sản Phẩm
            </Link>
            <Link
              href="/promotions"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-bold text-white py-2"
            >
              Khuyến Mãi
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-bold text-white py-2"
            >
              Liên Hệ
            </Link>
          </div>
        )}
      </header>

      {/* Slide-Over Mini Cart Drawer Component */}
      <MiniCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Modern Glassmorphic Logout Confirmation Modal */}
      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
