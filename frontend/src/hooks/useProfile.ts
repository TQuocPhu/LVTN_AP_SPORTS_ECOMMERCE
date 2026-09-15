'use client';

import { useState, useEffect, useCallback } from 'react';
import { profileController } from '@/controllers/profile-controller';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile';
import { useAuth } from '@/hooks/useAuth';

export function useProfile() {
  const { refetchUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
      console.error('Lỗi lấy hồ sơ cá nhân:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      setLoading(true);
      const res = await profileController.updateProfile(data);
      if (res && res.data) {
        setProfile(res.data);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
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
    updateProfile,
    uploadAvatar,
    changePassword,
    refetchProfile: fetchProfile,
  };
}
