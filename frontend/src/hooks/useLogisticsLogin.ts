import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoLogisticsAuth } from '@/hooks/useDemoLogisticsAuth';

export function useLogisticsLogin() {
  const router = useRouter();
  const { user, loading, login } = useDemoLogisticsAuth();

  const getLogisticsTargetPath = useCallback((role?: string) => {
    if (role === 'GHN_STATION') return '/demo/ghn-station';
    if (role === 'GHN_SHIPPER') return '/demo/shipper-app';
    return '/demo';
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    const hasReason =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('reason');
    if (!hasReason) {
      router.replace(getLogisticsTargetPath(user.roleName));
    }
  }, [loading, user, router, getLogisticsTargetPath]);

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
        router.replace(getLogisticsTargetPath(res.data.roleName));
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
