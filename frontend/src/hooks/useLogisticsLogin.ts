import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoLogisticsAuth } from '@/hooks/useDemoLogisticsAuth';

export function useLogisticsLogin() {
  const router = useRouter();
  const { login } = useDemoLogisticsAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await login({ email, password });
      if (res?.success || res?.data) {
        const role = res.data.roleName;
        if (role === 'GHN_STATION') {
          router.push('/demo/ghn-station');
        } else if (role === 'GHN_SHIPPER') {
          router.push('/demo/shipper-app');
        } else {
          router.push('/demo');
        }
      } else {
        setErrorMessage(res?.message || 'Đăng nhập không thành công.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    errorMessage,
    handleSubmit
  };
}
