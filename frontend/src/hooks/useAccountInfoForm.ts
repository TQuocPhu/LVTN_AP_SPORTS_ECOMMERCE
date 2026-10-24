'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { UserProfile, UpdateProfileRequest } from '@/types/profile';
import { ApiError } from '@/services/api-client';

interface UseAccountInfoFormParams {
  profile: UserProfile | null;
  avatarPreview: string | null;
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<unknown>;
  onUploadAvatar: (file: File) => Promise<unknown>;
}

/**
 * Custom Hook quản lý toàn bộ trạng thái và nghiệp vụ của Form Thông Tin Tài Khoản (AccountInfoTab).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Tách biệt hoàn toàn useState / useEffect khỏi Component AccountInfoTab.
 * - Hỗ trợ phân biệt tài khoản liên kết Google (isGoogleAccount):
 *   + Không cho phép tải ảnh đại diện mới.
 *   + Không cho phép thay đổi Họ và tên (đồng bộ từ Google).
 *   + Chỉ cho phép cập nhật Số điện thoại và Địa chỉ liên hệ.
 */
export function useAccountInfoForm({
  profile,
  avatarPreview,
  onUpdateProfile,
  onUploadAvatar,
}: UseAccountInfoFormParams) {
  const [name, setName] = useState(profile?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Kiểm tra tài khoản có phải là tài khoản đăng nhập bằng Google OAuth2 hay không
  const isGoogleAccount = Boolean(profile?.googleAccount || profile?.googleId);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhoneNumber(profile.phoneNumber || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

  const handleNameChange = (value: string) => {
    if (isGoogleAccount) return;
    setName(value);
    if (fieldErrors.name) {
      setFieldErrors((p) => ({ ...p, name: '' }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (fieldErrors.phoneNumber) {
      setFieldErrors((p) => ({ ...p, phoneNumber: '' }));
    }
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    if (fieldErrors.address) {
      setFieldErrors((p) => ({ ...p, address: '' }));
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isGoogleAccount) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      await onUploadAvatar(file);
    } catch (err) {
      console.error('Lỗi upload avatar:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Tài khoản thường bắt buộc kiểm tra Họ và tên; tài khoản Google giữ nguyên tên từ Google
    if (!isGoogleAccount && (!name || !name.trim())) {
      newErrors.name = 'Họ và tên không được để trống';
    }

    const phoneTrimmed = phoneNumber.trim();
    if (phoneTrimmed && !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phoneTrimmed)) {
      newErrors.phoneNumber =
        'Số điện thoại không hợp lệ (Ví dụ hợp lệ: 0912345678)';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});

    try {
      setIsUpdating(true);
      await onUpdateProfile({
        name: isGoogleAccount ? (profile?.name || name.trim()) : name.trim(),
        phoneNumber: phoneTrimmed,
        address: address.trim(),
      });
    } catch (err: unknown) {
      const fieldErrs =
        (err as ApiError)?.fieldErrors ||
        ((err as Record<string, unknown>)?.data as Record<string, string>);
      if (fieldErrs && typeof fieldErrs === 'object') {
        setFieldErrors(fieldErrs);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanged = Boolean(
    profile &&
      ((!isGoogleAccount && name.trim() !== (profile.name || '').trim()) ||
        phoneNumber.trim() !== (profile.phoneNumber || '').trim() ||
        address.trim() !== (profile.address || '').trim())
  );

  const displayAvatar = avatarPreview || profile?.avatar || null;

  return {
    name,
    phoneNumber,
    address,
    fieldErrors,
    isUpdating,
    isUploading,
    isGoogleAccount,
    hasChanged,
    displayAvatar,
    handleNameChange,
    handlePhoneChange,
    handleAddressChange,
    handleAvatarChange,
    handleSubmit,
  };
}
