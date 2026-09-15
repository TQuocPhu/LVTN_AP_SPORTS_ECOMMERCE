'use client';

import { useState } from 'react';
import { authController } from '@/controllers/auth-controller';

/**
 * Custom Hook quản lý state và business logic riêng biệt cho tính năng Quên Mật Khẩu.
 * Tuân thủ Clean Architecture: Tách biệt hoàn toàn Logic khỏi Component UI.
 */
export function useForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError(null);
  };

  const submitForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    try {
      setLoading(true);
      const res = await authController.forgotPassword(trimmedEmail);
      setSuccessMessage(res.message || 'Yêu cầu đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư email của bạn.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi yêu cầu đặt lại mật khẩu.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail: handleEmailChange,
    loading,
    error,
    successMessage,
    submitForgotPassword,
  };
}
