'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Custom Hook xử lý toàn bộ trạng thái và nghiệp vụ của Form Đăng Ký Tài Khoản (RegisterForm).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Tách biệt hoàn toàn useState khỏi Component RegisterForm.
 */
export function useRegisterForm() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!formData.name.trim()) {
      setFormError('Họ và tên không được để trống.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email không được để trống.');
      return;
    }
    if (formData.password.length < 8 || formData.password.length > 100) {
      setFormError('Mật khẩu phải từ 8 đến 100 ký tự.');
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!passwordRegex.test(formData.password)) {
      setFormError('Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      const res = await register(formData);
      setSuccessMessage(
        res.message ||
          'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.'
      );

      setTimeout(() => {
        router.push('/login');
      }, 3500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Đăng ký không thành công. Vui lòng thử lại.';
      setFormError(msg);
    }
  };

  const hasInput = Boolean(
    formData.name.trim() &&
      formData.email.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim()
  );

  return {
    formData,
    loading,
    showPassword,
    showConfirmPassword,
    formError,
    successMessage,
    hasInput,
    handleChange,
    toggleShowPassword,
    toggleShowConfirmPassword,
    handleSubmit,
  };
}
