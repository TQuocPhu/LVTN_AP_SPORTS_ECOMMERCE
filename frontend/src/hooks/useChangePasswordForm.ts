'use client';

import { useState, FormEvent } from 'react';
import { ChangePasswordRequest, UserProfile } from '@/types/profile';
import { isApiError } from '@/services/api-client';

interface UseChangePasswordFormParams {
  profile?: UserProfile | null;
  onChangePassword: (data: ChangePasswordRequest) => Promise<unknown>;
}

/**
 * Custom Hook quản lý toàn bộ trạng thái và nghiệp vụ của Form Thay Đổi Mật Khẩu (ChangePasswordTab).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Không sử dụng useState / useEffect trong Component ChangePasswordTab.
 * - Phát hiện tài khoản Google OAuth2 (isGoogleAccount) để vô hiệu hóa chức năng đổi mật khẩu.
 */
export function useChangePasswordForm({
  profile,
  onChangePassword,
}: UseChangePasswordFormParams) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGoogleAccount = Boolean(profile?.googleAccount || profile?.googleId);

  const handleOldPasswordChange = (value: string) => {
    setOldPassword(value);
    if (fieldErrors.oldPassword) {
      setFieldErrors((p) => ({ ...p, oldPassword: '' }));
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (fieldErrors.newPassword) {
      setFieldErrors((p) => ({ ...p, newPassword: '' }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (fieldErrors.confirmPassword) {
      setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
    }
  };

  const toggleShowOld = () => setShowOld((prev) => !prev);
  const toggleShowNew = () => setShowNew((prev) => !prev);
  const toggleShowConfirm = () => setShowConfirm((prev) => !prev);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isGoogleAccount) return;

    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Xác nhận mật khẩu mới không khớp.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await onChangePassword({ oldPassword, newPassword, confirmPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      if (isApiError(err) && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasInput = Boolean(
    oldPassword.trim() && newPassword.trim() && confirmPassword.trim()
  );

  return {
    oldPassword,
    newPassword,
    confirmPassword,
    fieldErrors,
    showOld,
    showNew,
    showConfirm,
    isSubmitting,
    isGoogleAccount,
    hasInput,
    handleOldPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    toggleShowOld,
    toggleShowNew,
    toggleShowConfirm,
    handleSubmit,
  };
}
