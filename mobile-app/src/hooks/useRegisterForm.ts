import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { authController } from '../controllers/auth-controller';

export const useRegisterForm = (onSuccess?: () => void) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = useCallback(async () => {
    setErrorMessage(null);

    // Validation chuẩn 100% như Frontend AP Sports
    if (!name.trim()) {
      setErrorMessage('Họ và tên không được để trống.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Địa chỉ Email không được để trống.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Định dạng Email không hợp lệ.');
      return;
    }
    if (password.length < 8 || password.length > 100) {
      setErrorMessage('Mật khẩu phải từ 8 đến 100 ký tự.');
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authController.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });

      const message =
        res.data && (res as any).message
          ? (res as any).message
          : 'Đăng ký tài khoản thành công! Vui lòng kiểm tra email kích hoạt tài khoản hoặc đăng nhập ngay.';

      Alert.alert('Thành Công', message, [
        {
          text: 'Đăng Nhập Ngay',
          onPress: () => {
            if (onSuccess) onSuccess();
          },
        },
      ]);
    } catch (err: any) {
      const serverMsg =
        err.response?.data?.message ||
        err.message ||
        'Đăng ký không thành công. Vui lòng thử lại.';
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, password, confirmPassword, onSuccess]);

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isSubmitting,
    errorMessage,
    setErrorMessage,
    handleRegister,
  };
};
