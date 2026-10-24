"use client";

import Link from "next/link";
import Image from "next/image";
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
  X,
  Sun,
  Moon,
  Gift,
  Info,
  Home,
  Bell,
  Headphones,
  Sparkles,
} from "lucide-react";
import MiniCartDrawer from "./MiniCartDrawer";
import ConfirmLogoutModal from "@/components/ui/ConfirmLogoutModal";
import NavbarSearchBar from "./NavbarSearchBar";
import NotificationBell from "./NotificationBell";
import { useNavbar } from "@/hooks/useNavbar";

/**
 * Custom Hamburger Icon matching the 3 horizontal rounded pill bars style.
 */
function HamburgerPillIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2.5"
        y="3.8"
        width="19"
        height="3.6"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="2.1"
      />
      <rect
        x="2.5"
        y="10.2"
        width="19"
        height="3.6"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="2.1"
      />
      <rect
        x="2.5"
        y="16.6"
        width="19"
        height="3.6"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="2.1"
      />
    </svg>
  );
}

/**
 * Component Thanh Navigation Header Master Shell Navbar.
 * Tuân thủ Layer Architecture: Chỉ render UI thuần, toàn bộ trạng thái & logic nằm trong useNavbar hook.
 */
export default function Navbar() {
  const {
    pathname,
    isHidden,
    user,
    theme,
    toggleTheme,
    wishlistCount,
    unreadCount,
    totalItems,
    isMiniCartOpen,
    openMiniCart,
    closeMiniCart,
    isMobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    isUserDropdownOpen,
    openUserDropdown,
    closeUserDropdown,
    isAboutDropdownOpen,
    openAboutDropdown,
    closeAboutDropdown,
    isLogoutModalOpen,
    openLogoutModal,
    closeLogoutModal,
    handleLogout,
  } = useNavbar();

  // Không hiển thị Navbar trang bán hàng khi ở các route quản trị /admin hoặc demo /demo
  if (isHidden) {
    return null;
  }

  return (
    <>
      <header className="ap-navbar sticky top-0 lg:top-10 z-40 w-full border-b shadow-xl transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-20 flex items-center justify-between">
          {/* 1. Logo Thương Hiệu */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
              <Image
                src="/images/ap-sports_logo_no-back.png"
                alt="AP Sports Logo"
                width={64}
                height={64}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_12px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="brand-title text-xl sm:text-2xl font-black tracking-wider uppercase">
                AP SPORTS
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-orange-500 uppercase tracking-widest -mt-1 hidden xs:inline-block">
                FLEXIBLE STORE
              </span>
            </div>
          </Link>

          {/* 2. Nav Links (Chỉ hiển thị trên màn hình Desktop rộng >= 1280px) */}
          <nav className="hidden xl:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-bold transition-colors py-2 nav-link ${
                pathname === "/" ? "text-orange-500" : "hover:text-orange-400"
              }`}
            >
              Trang Chủ
            </Link>

            <Link
              href="/products"
              className={`text-sm font-bold transition-colors py-2 nav-link ${
                pathname === "/products" ? "text-orange-500" : "hover:text-orange-400"
              }`}
            >
              Sản Phẩm
            </Link>

            {/* Dropdown Giới Thiệu (Bao gồm Về AP Sports & Khuyến Mãi) */}
            <div
              className="relative py-2"
              onMouseEnter={openAboutDropdown}
              onMouseLeave={closeAboutDropdown}
            >
              <button
                className={`text-sm font-bold transition-colors py-2 flex items-center gap-1 nav-link cursor-pointer ${
                  pathname === "/about" || pathname === "/vouchers"
                    ? "text-orange-500"
                    : "hover:text-orange-400"
                }`}
              >
                <span>Giới Thiệu</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {/* Dropdown Submenu Giới Thiệu */}
              {isAboutDropdownOpen && (
                <div className="absolute top-full left-0 pt-2 w-56 z-50 animate-fade-in">
                  <div className="nav-dropdown border rounded-2xl shadow-2xl p-2 space-y-1">
                    <Link
                      href="/about"
                      onClick={closeAboutDropdown}
                      className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:text-orange-400 transition-colors"
                      style={{ color: "var(--nav-text)" }}
                    >
                      <Info className="w-4 h-4 text-orange-400" />
                      <span>Giới Thiệu AP Sports</span>
                    </Link>

                    <Link
                      href="/vouchers"
                      onClick={closeAboutDropdown}
                      className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:text-orange-400 transition-colors"
                      style={{ color: "var(--nav-text)" }}
                    >
                      <Gift className="w-4 h-4 text-amber-500" />
                      <span>Chương Trình Khuyến Mãi</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className={`text-sm font-bold transition-colors py-2 nav-link ${
                pathname === "/contact" ? "text-orange-500" : "hover:text-orange-400"
              }`}
            >
              Liên Hệ
            </Link>
          </nav>

          {/* 3. Phía Phải: Các Nút Thao Tác (Khi thu gọn dưới 1280px, các icon gom lại vào Hamburger Menu) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 md:space-x-4">
            {/* Search Bar (Desktop >= 1280px) */}
            <div className="hidden xl:block">
              <NavbarSearchBar />
            </div>

            {/* Theme Toggle Button (Desktop >= 1280px) */}
            <button
              onClick={toggleTheme}
              className="hidden xl:flex nav-icon-btn p-2.5 rounded-xl border transition-colors shadow cursor-pointer items-center justify-center"
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

            {/* Notification Bell (Desktop >= 1280px) */}
            <div className="hidden xl:block">
              <NotificationBell />
            </div>

            {/* Wishlist Icon (Desktop >= 1280px) */}
            <Link
              href="/wishlist"
              className="hidden xl:flex nav-icon-btn relative p-2.5 rounded-xl border transition-colors group items-center justify-center cursor-pointer"
              title="Danh sách yêu thích"
            >
              <Heart className="w-5 h-5 group-hover:text-rose-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-current shadow-md">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon (Luôn hiển thị trên mọi kích cỡ màn hình để khách dễ dàng xem giỏ hàng) */}
            <button
              onClick={openMiniCart}
              className="nav-icon-btn relative p-2.5 rounded-xl border transition-colors group cursor-pointer flex items-center justify-center"
              title="Giỏ hàng"
              aria-label="Xem giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-current shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account Dropdown (Desktop >= 1280px) */}
            <div
              className="hidden xl:block relative py-2"
              onMouseEnter={openUserDropdown}
              onMouseLeave={closeUserDropdown}
            >
              <button className="nav-icon-btn flex items-center space-x-2.5 p-1.5 pl-2.5 pr-3 rounded-xl border transition-colors cursor-pointer">
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
                    <span className="text-sm font-bold max-w-[130px] truncate">
                      {user.name || user.email}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <User className="w-5 h-5 text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Tài Khoản
                    </span>
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Dropdown Menu User */}
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
                          onClick={closeUserDropdown}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:text-orange-400 transition-colors"
                          style={{ color: "var(--nav-text)" }}
                        >
                          <UserCheck className="w-4 h-4 opacity-60" />
                          <span>Tài khoản cá nhân</span>
                        </Link>
                        <Link
                          href="/profile/orders"
                          onClick={closeUserDropdown}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:text-orange-400 transition-colors"
                          style={{ color: "var(--nav-text)" }}
                        >
                          <PackageCheck className="w-4 h-4 opacity-60" />
                          <span>Đơn hàng của tôi</span>
                        </Link>
                        <button
                          onClick={openLogoutModal}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={closeUserDropdown}
                          className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold hover:text-orange-400 transition-colors"
                          style={{ color: "var(--nav-text)" }}
                        >
                          <LogIn className="w-4 h-4 text-orange-400" />
                          <span>Đăng Nhập</span>
                        </Link>
                        <Link
                          href="/register"
                          onClick={closeUserDropdown}
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

            {/* Mobile / Tablet Hamburger Button (Icon 3 thanh bo tròn chuẩn chuyên nghiệp) */}
            <button
              onClick={openMobileMenu}
              className="nav-icon-btn xl:hidden p-2.5 rounded-xl border cursor-pointer hover:bg-orange-500/10 hover:border-orange-500/40 transition-colors flex items-center justify-center text-current"
              aria-label="Mở menu di động"
            >
              <HamburgerPillIcon className="w-5 h-5 text-current" />
            </button>
          </div>
        </div>
      </header>

      {/* 4. Overlay Backdrop khi mở menu Mobile */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 xl:hidden ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* 5. Mobile & Tablet Off-Canvas Drawer chuẩn chuyên nghiệp */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[88vw] sm:w-[380px] max-w-full z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out xl:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderLeft: "1px solid var(--nav-border)",
        }}
        aria-label="Menu điều hướng di động"
      >
        {/* 5.1. Header của Drawer */}
        <div
          className="h-20 px-5 flex items-center justify-between border-b shrink-0"
          style={{ borderColor: "var(--nav-border)" }}
        >
          <div className="flex items-center space-x-2.5">
            <Image
              src="/images/ap-sports_logo_no-back.png"
              alt="AP Sports Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
            />
            <div className="flex flex-col">
              <span className="brand-title text-lg font-black tracking-wider uppercase">
                AP SPORTS
              </span>
              <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest -mt-0.5">
                FLEXIBLE STORE
              </span>
            </div>
          </div>

          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-xl border transition-colors hover:bg-orange-500/10 hover:border-orange-500/40 text-slate-400 hover:text-orange-500 cursor-pointer"
            style={{ borderColor: "var(--nav-border)" }}
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5.2. Nội dung Drawer (Cuộn mượt mà) */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* 5.2.1. Thanh Tìm Kiếm Full-Width */}
          <div className="w-full">
            <NavbarSearchBar
              className="w-full"
              onSearchSubmit={closeMobileMenu}
            />
          </div>

          {/* 5.2.2. Khối Tài Khoản Người Dùng */}
          <div
            className="p-4 rounded-2xl border transition-colors"
            style={{
              backgroundColor: "var(--nav-dropdown-bg)",
              borderColor: "var(--nav-border)",
            }}
          >
            {user ? (
              <div className="space-y-3">
                <div
                  className="flex items-center space-x-3 pb-3 border-b"
                  style={{ borderColor: "var(--nav-border)" }}
                >
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name || "Avatar"}
                      className="w-11 h-11 rounded-full object-cover border-2 border-orange-500/60 shadow"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-orange-500/20 text-orange-500 border border-orange-500/50 flex items-center justify-center font-bold text-base">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-orange-500">
                      {user.name || "Khách hàng AP Sports"}
                    </p>
                    <p
                      className="text-xs truncate opacity-75"
                      style={{ color: "var(--nav-text)" }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2 p-2 rounded-xl text-xs font-semibold hover:bg-orange-500/10 transition-colors"
                    style={{ color: "var(--nav-text)" }}
                  >
                    <UserCheck className="w-4 h-4 text-orange-400" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>

                  <Link
                    href="/profile/orders"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2 p-2 rounded-xl text-xs font-semibold hover:bg-orange-500/10 transition-colors"
                    style={{ color: "var(--nav-text)" }}
                  >
                    <PackageCheck className="w-4 h-4 text-orange-400" />
                    <span>Đơn hàng</span>
                  </Link>
                </div>

                <button
                  onClick={openLogoutModal}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                    Tài khoản AP Sports
                  </p>
                  <p className="text-xs opacity-75 mt-0.5" style={{ color: "var(--nav-text)" }}>
                    Đăng nhập để theo dõi đơn hàng và nhận ưu đãi
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold border border-orange-500/40 text-orange-500 hover:bg-orange-500/10 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/20 transition-transform active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Đăng Ký</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 5.2.3. Danh Mục Điều Hướng Chính */}
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2 mb-2">
              Menu Điều Hướng
            </p>
            {[
              { href: "/", label: "Trang Chủ", icon: Home },
              { href: "/products", label: "Sản Phẩm Thể Thao", icon: ShoppingBag },
              { href: "/about", label: "Giới Thiệu AP Sports", icon: Info },
              { href: "/vouchers", label: "Chương Trình Khuyến Mãi", icon: Gift, badge: "Ưu Đãi" },
              { href: "/contact", label: "Liên Hệ Hỗ Trợ", icon: Headphones },
            ].map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "text-orange-500 bg-orange-500/10 border border-orange-500/30"
                      : "hover:bg-orange-500/5 hover:translate-x-1"
                  }`}
                  style={{ color: isActive ? "#ea580c" : "var(--nav-text)" }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : "opacity-60"}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* 5.2.4. Hàng Tiện Ích: Wishlist, Thông Báo & Chế Độ Sáng/Tối */}
          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2">
              Tiện Ích Nhanh
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Yêu thích */}
              <Link
                href="/wishlist"
                onClick={closeMobileMenu}
                className="flex items-center justify-center space-x-2 py-2.5 rounded-xl border transition-colors font-semibold text-xs"
                style={{
                  backgroundColor: "var(--nav-dropdown-bg)",
                  borderColor: "var(--nav-border)",
                  color: "var(--nav-text)",
                }}
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Yêu thích ({wishlistCount})</span>
              </Link>

              {/* Thông báo */}
              <Link
                href="/notifications"
                onClick={closeMobileMenu}
                className="flex items-center justify-center space-x-2 py-2.5 rounded-xl border transition-colors font-semibold text-xs relative"
                style={{
                  backgroundColor: "var(--nav-dropdown-bg)",
                  borderColor: "var(--nav-border)",
                  color: "var(--nav-text)",
                }}
              >
                <Bell className="w-4 h-4 text-orange-400" />
                <span>Thông báo</span>
                {unreadCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Chế độ Sáng / Tối */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl border transition-colors font-semibold text-xs cursor-pointer"
              style={{
                backgroundColor: "var(--nav-dropdown-bg)",
                borderColor: "var(--nav-border)",
                color: "var(--nav-text)",
              }}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Chuyển sang Chế độ Sáng</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span>Chuyển sang Chế độ Tối</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5.3. Footer của Drawer */}
        <div
          className="p-4 border-t shrink-0 text-center"
          style={{
            borderColor: "var(--nav-border)",
            backgroundColor: "var(--nav-dropdown-bg)",
          }}
        >
          <div className="flex items-center justify-center space-x-1.5 text-orange-500 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hotline: 1900 8888 (08:00 - 22:00)</span>
          </div>
          <p className="text-[10px] opacity-70 mt-1" style={{ color: "var(--text-muted)" }}>
            AP Sports © 2026 • 100% Chính Hãng Thể Thao
          </p>
        </div>
      </aside>

      {/* Mini Cart Drawer */}
      <MiniCartDrawer
        isOpen={isMiniCartOpen}
        onClose={closeMiniCart}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}
