import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export const useLoginForm = () => {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleQuickLogin = useCallback(() => {
    setEmail('customer@apsports.com');
    setPassword('123456');
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      Alert.alert('Thành công', 'Đăng nhập thành công vào AP Sports!', [
        {
          text: 'Tiếp tục',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        'Đăng nhập thất bại',
        err?.response?.data?.message || err?.message || 'Email hoặc mật khẩu không chính xác.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, login, navigation]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    isSubmitting,
    handleQuickLogin,
    handleLogin,
  };
};
