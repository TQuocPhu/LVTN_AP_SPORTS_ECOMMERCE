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
import NavbarSearchBar from "./NavbarSearchBar";

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
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <>
      <header className="ap-navbar sticky top-0 z-40 w-full border-b shadow-xl transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-20 flex items-center justify-between">
          {/* 1. Logo */}
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
              <span className="brand-title text-2xl font-black tracking-wider uppercase">
                AP SPORTS
              </span>
              <span className="text-[11px] font-bold text-orange-500 uppercase tracking-widest -mt-1">
                FLEXIBLE STORE
              </span>
            </div>
          </Link>

          {/* 2. Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { href: "/", label: "Trang Chủ" },
              { href: "/products", label: "Sản Phẩm" },
              { href: "/about", label: "Giới Thiệu" },
              { href: "/contact", label: "Liên Hệ" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold transition-colors py-2 nav-link ${
                  pathname === link.href
                    ? "text-orange-500"
                    : "hover:text-orange-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 3. Right Side: Search, Theme, Cart, User */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Bar */}
            <div className="hidden sm:block">
              <NavbarSearchBar />
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="nav-icon-btn p-2.5 rounded-xl border transition-colors shadow"
              title={
                theme === "dark"
                  ? "Đang ở chế độ Tối (Dark Mode)"
                  : "Đang ở chế độ Sáng (Light Mode)"
              }
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5 fill-amber-400/20 text-amber-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500 fill-amber-400" />
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="nav-icon-btn relative p-2.5 rounded-xl border transition-colors group"
              title="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-current shadow-md">
                2
              </span>
            </button>

            {/* User Account Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setIsUserDropdownOpen(true)}
              onMouseLeave={() => setIsUserDropdownOpen(false)}
            >
              <button className="nav-icon-btn flex items-center space-x-2.5 p-1.5 pl-2.5 pr-3 rounded-xl border transition-colors">
                {user ? (
                  <div className="flex items-center space-x-2">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={user.name || "Avatar"}
                        className="w-7 h-7 rounded-full object-cover border border-orange-500/40 shadow-sm"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-bold text-xs">
                        {(user.name || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-bold max-w-[140px] truncate">
                      {user.name || user.email}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <User className="w-5 h-5 text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                      Tài Khoản
                    </span>
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute top-full right-0 pt-2 w-56 z-50 animate-fade-in">
                  <div className="nav-dropdown border rounded-2xl shadow-2xl p-2 space-y-1">
                    {user ? (
                      <>
                        <div className="px-3 py-2 border-b mb-1" style={{ borderColor: "var(--nav-border)" }}>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Đã đăng nhập với tư cách</p>
                          <p className="text-sm font-bold text-orange-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:text-orange-400 transition-colors"
                          style={{ color: "var(--nav-text)" }}
                        >
                          <UserCheck className="w-4 h-4 opacity-60" />
                          <span>Tài khoản cá nhân</span>
                        </Link>
                        <Link
                          href="/profile/orders"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:text-orange-400 transition-colors"
                          style={{ color: "var(--nav-text)" }}
                        >
                          <PackageCheck className="w-4 h-4 opacity-60" />
                          <span>Đơn hàng của tôi</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:text-orange-400 transition-colors"
                          style={{ color: "var(--nav-text)" }}
                        >
                          <Heart className="w-4 h-4 opacity-60" />
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
                      <>
                        <Link
                          href="/login"
                          className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold hover:text-orange-400 transition-colors"
                          style={{ color: "var(--nav-text)" }}
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

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="nav-icon-btn md:hidden p-2.5 rounded-xl border"
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
          <div className="md:hidden border-b px-4 pt-2 pb-6 space-y-3 transition-colors" style={{ backgroundColor: "var(--nav-dropdown-bg)", borderColor: "var(--nav-border)" }}>
            {[
              { href: "/", label: "Trang Chủ" },
              { href: "/products", label: "Sản Phẩm" },
              { href: "/about", label: "Giới Thiệu" },
              { href: "/contact", label: "Liên Hệ" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-bold py-2 hover:text-orange-400 transition-colors"
                style={{ color: "var(--nav-text)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Mini Cart Drawer */}
      <MiniCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
