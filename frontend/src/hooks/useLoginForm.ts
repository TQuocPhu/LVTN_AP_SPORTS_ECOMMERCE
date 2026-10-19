'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook nghiệp vụ xử lý Form Đăng Nhập Khách Hàng (LoginForm).
 * Tuân thủ nghiêm ngặt 7-Layer Architecture:
 * - Toàn bộ State (formData, showPassword, isSubmitting, error, success, notice) được quản lý tại đây.
 * - Loại bỏ hoàn toàn useState / useEffect trong Component LoginForm.
 * - Tách biệt cờ isSubmitting (thực hiện submit) khỏi authLoading toàn cục,
 *   giải quyết triệt để lỗi nút Đăng Nhập bị quay vòng vòng khi chuyển từ trang đặt lại mật khẩu sang.
 */
export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Nhận diện lý do chuyển hướng từ các luồng khác (ví dụ vừa đặt lại mật khẩu thành công)
  const reason = searchParams.get('reason');

  const noticeMessage = useMemo(() => {
    if (reason === 'password_reset_success') {
      return 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới của bạn.';
    }
    if (reason === 'account_activated') {
      return 'Tài khoản đã được kích hoạt thành công! Vui lòng đăng nhập để tiếp tục.';
    }
    return null;
  }, [reason]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!formData.email.trim()) {
      setFormError('Email không được để trống.');
      return;
    }
    if (!formData.password) {
      setFormError('Mật khẩu không được để trống.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(formData);
      setSuccessMessage(res.message || 'Đăng nhập thành công!');

      // Chuyển hướng sau khi cập nhật AuthContext
      setTimeout(() => {
        window.location.href = '/';
      }, 800);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa kích hoạt.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasInput = Boolean(formData.email.trim() && formData.password.trim());

  return {
    formData,
    showPassword,
    isSubmitting,
    formError,
    successMessage,
    noticeMessage,
    hasInput,
    handleChange,
    toggleShowPassword,
    handleSubmit,
  };
}
