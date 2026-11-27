'use client';

import { useEffect, useRef } from 'react';
import { useNotificationContext } from '@/context/NotificationContext';

interface UseRealtimeReportSyncOptions {
  enabled?: boolean;
  debounceMs?: number;
  pollIntervalMs?: number;
}

/**
 * Custom Hook đồng bộ dữ liệu thời gian thực (Real-time) cho Dashboard và các trang Báo cáo:
 * 1. Lắng nghe WebSocket qua NotificationContext (khi có đơn mới, cập nhật trạng thái, thanh toán VNPay, biến động kho...).
 * 2. Lắng nghe sự kiện đồng bộ nội bộ (inventory_updated, order_updated) và chuyển tab trình duyệt (visibilitychange).
 * 3. Tự động làm mới nền định kỳ (mặc định 30 giây khi tab đang mở) với cơ chế debounce chống gọi API dồn dập.
 */
export function useRealtimeReportSync(
  onSync: () => void | Promise<void>,
  options?: UseRealtimeReportSyncOptions
) {
  const enabled = options?.enabled ?? true;
  const debounceMs = options?.debounceMs ?? 800;
  const pollIntervalMs = options?.pollIntervalMs ?? 30000;

  const { notifications } = useNotificationContext();
  const onSyncRef = useRef(onSync);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestNotifIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  const scheduleSync = () => {
    if (!enabled) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onSyncRef.current();
    }, debounceMs);
  };

  // 1. Kích hoạt đồng bộ tức thì khi có thông báo WebSocket mới
  useEffect(() => {
    if (!enabled || !notifications || notifications.length === 0) return;
    const latest = notifications[0];
    const latestKey = latest.id ?? `${latest.actionType}-${latest.createdAt}`;
    if (latestNotifIdRef.current !== null && latestNotifIdRef.current !== latestKey) {
      scheduleSync();
    }
    latestNotifIdRef.current = latestKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, enabled]);

  // 2. Lắng nghe sự kiện cửa sổ, chuyển tab và polling nền khi tab đang hiển thị
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleWindowSync = () => scheduleSync();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        scheduleSync();
      }
    };

    window.addEventListener('inventory_updated', handleWindowSync);
    window.addEventListener('order_updated', handleWindowSync);
    document.addEventListener('visibilitychange', handleVisibility);

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        onSyncRef.current();
      }
    }, pollIntervalMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('inventory_updated', handleWindowSync);
      window.removeEventListener('order_updated', handleWindowSync);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, debounceMs, pollIntervalMs]);
}
