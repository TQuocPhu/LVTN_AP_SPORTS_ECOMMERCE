'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useNotificationContext } from '@/context/NotificationContext';

/**
 * Custom Hook quản lý toàn bộ trạng thái và tương tác của Navbar Master Shell.
 * Tuân thủ Layer Architecture: Tách biệt hoàn toàn UI trong Component và Logic trong Hook.
 */
export function useNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { wishlistCount } = useWishlist();
  const { unreadCount } = useNotificationContext();
  const { totalItems, isMiniCartOpen, openMiniCart, closeMiniCart } = useCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Không hiển thị Navbar trang bán hàng khi ở các route quản trị /admin hoặc demo /demo
  const isHidden = Boolean(pathname?.startsWith('/admin') || pathname?.startsWith('/demo'));

  // Khóa cuộn trang khi menu mobile mở
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Đóng menu mobile khi người dùng chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Phím Esc để đóng menu mobile hoặc modal đăng xuất
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsLogoutModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Xử lý đăng xuất mượt mà (không gây treo/đơ giao diện):
   * 1. Đóng ngay Modal xác nhận đăng xuất, Dropdown và Menu di động, giải phóng khóa cuộn body.
   * 2. Gọi `logout()` để xóa user trong AuthContext, tắt Google GIS auto-select và thu hồi Cookie tại Backend.
   * 3. Nếu đang đứng ở trang yêu cầu đăng nhập (/profile, /orders, /checkout...) thì chuyển hướng về trang chủ.
   */
  const handleLogout = useCallback(async () => {
    setIsLogoutModalOpen(false);
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    await logout();

    const isProtectedRoute = [
      '/profile',
      '/account',
      '/orders',
      '/checkout',
      '/notifications',
    ].some((path) => pathname?.startsWith(path));

    if (isProtectedRoute) {
      router.replace('/');
    }
    router.refresh();
  }, [logout, pathname, router]);

  const openMobileMenu = useCallback(() => setIsMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((prev) => !prev), []);

  const openUserDropdown = useCallback(() => setIsUserDropdownOpen(true), []);
  const closeUserDropdown = useCallback(() => setIsUserDropdownOpen(false), []);

  const openAboutDropdown = useCallback(() => setIsAboutDropdownOpen(true), []);
  const closeAboutDropdown = useCallback(() => setIsAboutDropdownOpen(false), []);

  const openLogoutModal = useCallback(() => {
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsLogoutModalOpen(true);
  }, []);
  const closeLogoutModal = useCallback(() => setIsLogoutModalOpen(false), []);

  return {
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
    toggleMobileMenu,
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
  };
}
