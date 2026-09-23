'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminProfileController } from '@/controllers/admin-profile-controller';
import { UserResponse } from '@/types/auth';
import { UpdateAdminProfileRequest, ChangeAdminPasswordRequest } from '@/types/admin-profile';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { isApiError } from '@/services/api-client';
import { toast } from 'sonner';

export type ProfileTabType = 'info' | 'password';

export function useAdminProfile() {
  const { refetchAdmin } = useAdminAuth();

  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTabType>('info');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminProfileController.getProfile();
      if (res && res.data) {
        setProfile(res.data);
        if (res.data.avatar) {
          setAvatarPreview(res.data.avatar);
        }
      }
    } catch (err) {
      if (!(isApiError(err) && err.status === 401)) {
        // toast.error('Lỗi khi tải thông tin hồ sơ tài khoản.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (data: UpdateAdminProfileRequest) => {
    try {
      setUpdating(true);
      const res = await adminProfileController.updateProfile(data);
      if (res && res.data) {
        setProfile(res.data);
        // toast.success(res.message || 'Cập nhật thông tin cá nhân thành công!');
        // Đồng bộ tức thì với AdminHeader
        await refetchAdmin();
      }
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thông tin thất bại.';
      // toast.error(msg);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    // 1. Kiểm tra dung lượng & loại file
    if (file.size > 5 * 1024 * 1024) {
      // toast.error('Kích thước file không vượt quá 5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      // toast.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP).');
      return;
    }

    // 2. Instant Preview local bằng FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 3. Upload lên Cloudinary
    try {
      setUpdating(true);
      const res = await adminProfileController.uploadAvatar(file);
      if (res && res.data) {
        setProfile(res.data);
        if (res.data.avatar) {
          setAvatarPreview(res.data.avatar);
        }
        // toast.success(res.message || 'Cập nhật ảnh đại diện thành công!');
        // Đồng bộ avatar tức thì với AdminHeader
        await refetchAdmin();
      }
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải ảnh đại diện thất bại.';
      // toast.error(msg);
      // Revert preview nếu upload thất bại
      if (profile?.avatar) {
        setAvatarPreview(profile.avatar);
      }
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const changePassword = async (data: ChangeAdminPasswordRequest) => {
    if (data.newPassword !== data.confirmPassword) {
      // toast.error('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    try {
      setUpdating(true);
      const res = await adminProfileController.changePassword(data);
      // toast.success(res.message || 'Đổi mật khẩu thành công!');
      await refetchAdmin();
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại.';
      // toast.error(msg);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    loading,
    updating,
    avatarPreview,
    activeTab,
    setActiveTab,
    updateProfile,
    uploadAvatar,
    changePassword,
    refetchProfile: fetchProfile,
  };
}
