'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { profileController } from '@/controllers/profile-controller';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile';
import { useAuth } from '@/hooks/useAuth';
import { isApiError } from '@/services/api-client';
import { toast } from 'sonner';

export type ProfileActiveTab = 'overview' | 'info' | 'password' | 'addresses';

/**
 * Custom Hook quản lý Hồ sơ cá nhân và điều hướng Tab trên trang Tài khoản (AccountPageShell).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Tập trung toàn bộ useState / useEffect tại tầng Hook, giúp AccountPageShell thuần UI.
 * - Kiểm tra chặn kép ở tầng FE đối với tài khoản Google OAuth2 (không cho đổi tên, không cho đổi ảnh, không cho đổi mật khẩu).
 */
export function useProfile() {
  const router = useRouter();
  const { user, refetchUser, logout } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileActiveTab>('overview');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const openLogoutModal = useCallback(() => setIsLogoutModalOpen(true), []);
  const closeLogoutModal = useCallback(() => setIsLogoutModalOpen(false), []);

  /**
   * Đăng xuất mượt mà: đóng ngay Modal để tránh đơ giao diện, gọi API logout và điều hướng về trang chủ.
   */
  const handleLogout = useCallback(async () => {
    setIsLogoutModalOpen(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    await logout();
    router.replace('/');
    router.refresh();
  }, [logout, router]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await profileController.getProfile();
      if (res && res.data) {
        setProfile(res.data);
        if (res.data.avatar) {
          setAvatarPreview(res.data.avatar);
        }
      }
    } catch (err) {
      if (!(isApiError(err) && err.status === 401)) {
        console.error('Lỗi lấy hồ sơ cá nhân:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isGoogleAccount = Boolean(
    profile?.googleAccount ||
      profile?.googleId ||
      user?.googleAccount ||
      user?.googleId
  );

  const updateProfile = async (data: UpdateProfileRequest) => {
    // Kiểm tra tại tầng FE: Nếu là tài khoản Google, giữ nguyên Họ và tên gốc từ Google, chỉ cho phép đổi SĐT và Địa chỉ
    const currentName = profile?.name || user?.name || data.name;
    if (
      isGoogleAccount &&
      data.name &&
      currentName &&
      data.name.trim() !== currentName.trim()
    ) {
      toast.error(
        'Tài khoản đăng nhập bằng Google không được phép thay đổi họ và tên.'
      );
      throw new Error(
        'Tài khoản đăng nhập bằng Google không được phép thay đổi họ và tên.'
      );
    }

    const sanitizedPayload: UpdateProfileRequest = {
      ...data,
      name: isGoogleAccount ? currentName : data.name,
    };

    try {
      setLoading(true);
      const res = await profileController.updateProfile(sanitizedPayload);
      if (res && res.data) {
        setProfile(res.data);
      }
      await refetchUser();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    // Chặn ngay tại tầng FE nếu tài khoản là tài khoản Google
    if (isGoogleAccount) {
      toast.error(
        'Tài khoản đăng nhập bằng Google sử dụng ảnh đồng bộ từ Google, không thể tải ảnh mới.'
      );
      return;
    }

    // 1. Instant Preview local bằng FileReader (hiện lên NGAY trước khi upload xong)
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 2. Upload lên Cloudinary
    try {
      setLoading(true);
      const res = await profileController.uploadAvatar(file);
      if (res && res.data) {
        setProfile(res.data);
        if (res.data.avatar) {
          // Cập nhật preview về URL Cloudinary thực sau khi upload xong
          setAvatarPreview(res.data.avatar);
        }
      }

      // 3. Đồng bộ user trong AuthContext → Navbar tự re-render với avatar mới ngay lập tức
      await refetchUser();

      return res;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    // Chặn ngay tại tầng FE nếu tài khoản là tài khoản Google
    if (isGoogleAccount) {
      toast.error(
        'Tài khoản đăng nhập bằng Google không sử dụng mật khẩu riêng nên không thể đổi mật khẩu.'
      );
      return;
    }

    try {
      setLoading(true);
      return await profileController.changePassword(data);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    avatarPreview,
    activeTab,
    setActiveTab,
    isLogoutModalOpen,
    openLogoutModal,
    closeLogoutModal,
    handleLogout,
    updateProfile,
    uploadAvatar,
    changePassword,
    refetchProfile: fetchProfile,
  };
}
