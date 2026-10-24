'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authController } from '@/controllers/auth-controller';

/**
 * Khai báo kiểu toàn cục cho đối tượng Google Identity Services (GIS) trên trình duyệt.
 */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

/**
 * Hook nghiệp vụ xử lý Form Đăng Nhập Khách Hàng (LoginForm).
 * Tuân thủ nghiêm ngặt 7-Layer Architecture:
 * - Toàn bộ State (formData, showPassword, isSubmitting, isGoogleLoading, error, success, notice)
 *   và lifecycle (useEffect nạp Google Identity Services SDK) được quản lý hoàn toàn tại đây.
 * - Loại bỏ hoàn toàn useState / useEffect trong Component LoginForm.
 */
export function useLoginForm() {
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();

  // Nhận diện lý do chuyển hướng từ các luồng khác (ví dụ vừa đặt lại mật khẩu thành công)
  const reason = searchParams.get('reason');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

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
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Ref gắn vào thẻ div nơi Google Identity Services render nút chuẩn
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  /**
   * Xử lý callback nhận ID Token (credential) từ Google Identity Services
   * và gửi xuống Backend để xác thực + cấp cặp khóa AT/RT xoay vòng.
   */
  const handleGoogleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      if (!response?.credential) {
        setFormError('Không nhận được mã xác thực từ Google. Vui lòng thử lại.');
        return;
      }

      setFormError(null);
      setSuccessMessage(null);

      try {
        setIsGoogleLoading(true);
        const res = await loginWithGoogle(response.credential);
        setSuccessMessage(res.message || 'Đăng nhập bằng Google thành công!');

        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 700);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.';
        setFormError(msg);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [loginWithGoogle, callbackUrl]
  );

  /**
   * Nạp Google Identity Services SDK (https://accounts.google.com/gsi/client)
   * và khởi tạo nút "Đăng nhập bằng Google" chuẩn của Google.
   */
  useEffect(() => {
    let isMounted = true;

    const initGoogleButton = async () => {
      // 1. Lấy Google Client ID từ biến môi trường CUSTOMER_ID hoặc gọi API Backend dự phòng
      let clientId =
        process.env.CUSTOMER_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

      if (!clientId) {
        try {
          const res = await authController.getGoogleClientId();
          if (res?.data?.clientId) {
            clientId = res.data.clientId;
          }
        } catch {
          // Bỏ qua nếu không lấy được từ backend
        }
      }

      if (!isMounted || !clientId || ! window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const containerWidth = googleButtonRef.current.offsetWidth || 360;
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: Math.min(Math.max(containerWidth, 260), 400),
        locale: 'vi',
      });
    };

    // Kiểm tra xem script GIS đã tồn tại trên trang chưa
    const existingScript = document.getElementById('google-gsi-client-script') as HTMLScriptElement | null;
    if (window.google?.accounts?.id) {
      initGoogleButton();
    } else if (existingScript) {
      existingScript.addEventListener('load', initGoogleButton);
      return () => {
        isMounted = false;
        existingScript.removeEventListener('load', initGoogleButton);
      };
    } else {
      const script = document.createElement('script');
      script.id = 'google-gsi-client-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleButton();
      };
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
    };
  }, [handleGoogleCredentialResponse]);

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
        window.location.href = callbackUrl;
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
    isGoogleLoading,
    googleButtonRef,
    formError,
    successMessage,
    noticeMessage,
    hasInput,
    handleChange,
    toggleShowPassword,
    handleSubmit,
  };
}
