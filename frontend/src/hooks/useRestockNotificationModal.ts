'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { restockNotificationController } from '@/controllers/restock-notification-controller';
import { toast } from 'sonner';

interface UseRestockNotificationModalParams {
  variantId?: number;
  productId?: number;
  productName?: string;
  variantName?: string;
}

export function useRestockNotificationModal({
  variantId,
  productId,
  productName,
  variantName,
}: UseRestockNotificationModalParams = {}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customEmail, setCustomEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  // Điền email mặc định từ user
  useEffect(() => {
    if (user?.email && !customEmail) {
      setCustomEmail(user.email);
    }
  }, [user?.email, customEmail]);

  // Kiểm tra trạng thái đã đăng ký chưa
  const checkSubscription = useCallback(async (vId?: number) => {
    const targetVariantId = vId || variantId;
    if (!targetVariantId || !user) {
      setIsSubscribed(false);
      return;
    }

    try {
      setChecking(true);
      const res = await restockNotificationController.checkSubscription(targetVariantId);
      if (res && res.data) {
        setIsSubscribed(Boolean(res.data.subscribed));
      }
    } catch {
      setIsSubscribed(false);
    } finally {
      setChecking(false);
    }
  }, [variantId, user]);

  useEffect(() => {
    if (variantId && user) {
      checkSubscription(variantId);
    } else {
      setIsSubscribed(false);
    }
  }, [variantId, user, checkSubscription]);

  const openModal = useCallback(() => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để đăng ký nhận thông báo khi có hàng!', {
        action: {
          label: 'Đăng nhập',
          onClick: () => {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          },
        },
      });
      return;
    }
    setIsOpen(true);
  }, [user]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleRegister = useCallback(async () => {
    if (!variantId) {
      toast.error('Vui lòng chọn biến thể sản phẩm cần nhận thông báo');
      return;
    }

    if (!user) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    try {
      setLoading(true);
      const res = await restockNotificationController.register({
        variantId,
        customEmail: customEmail.trim() || user.email,
      });

      if (res && res.status === 200) {
        setIsSubscribed(true);
        toast.success(res.message || 'Đăng ký nhận thông báo hàng về kho thành công!');
        closeModal();
      } else {
        toast.error(res.message || 'Không thể đăng ký nhận thông báo');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi gửi yêu cầu nhận tin');
    } finally {
      setLoading(false);
    }
  }, [variantId, user, customEmail, closeModal]);

  const handleCancel = useCallback(async () => {
    if (!variantId || !user) return;

    try {
      setLoading(true);
      const res = await restockNotificationController.cancel(variantId);
      if (res && res.status === 200) {
        setIsSubscribed(false);
        toast.success('Đã hủy nhận thông báo cho biến thể này');
        closeModal();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi khi hủy nhận tin');
    } finally {
      setLoading(false);
    }
  }, [variantId, user, closeModal]);

  return {
    isOpen,
    isSubscribed,
    loading,
    checking,
    customEmail,
    setCustomEmail,
    userEmail: user?.email || '',
    isAuthenticated: Boolean(user),
    openModal,
    closeModal,
    handleRegister,
    handleCancel,
    checkSubscription,
  };
}
