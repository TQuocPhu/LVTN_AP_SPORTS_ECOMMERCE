'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authController } from '@/controllers/auth-controller';

/**
 * Custom Hook quản lý state và business logic riêng biệt cho tính năng Đặt Lại Mật Khẩu.
 * Tuân thủ Clean Architecture: Tách biệt hoàn toàn Logic khỏi Component UI.
 */
export function useResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !token) {
      setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu thông tin token/email.');
      return;
    }

    if (!formData.newPassword) {
      setError('Mật khẩu mới không được để trống.');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Mật khẩu mới phải chứa ít nhất 8 ký tự.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError('Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 chữ số.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không trùng khớp.');
      return;
    }

    try {
      setLoading(true);
      const res = await authController.resetPassword({
        email,
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage(res.message || 'Đặt lại mật khẩu thành công!');

      // Tự động chuyển hướng về trang đăng nhập sau 1.5 giây
      setTimeout(() => {
        window.location.href = '/login?reason=password_reset_success';
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đặt lại mật khẩu không thành công.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    token,
    formData,
    handleChange,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    error,
    successMessage,
    submitResetPassword,
  };
}
