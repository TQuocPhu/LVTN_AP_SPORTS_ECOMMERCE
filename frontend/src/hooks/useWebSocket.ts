import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { apiClient } from '@/services/api/client';
import { ApiResponse } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface NotificationPayload {
  id: number;
  userId: number;
  senderId?: number;
  senderName?: string;
  senderAvatar?: string;
  senderRole?: string;
  isRead: boolean;
  readAt?: string;
  targetUrl?: string;
  title?: string;
  message?: string;
  actionType: string;
  payload: string;
  createdAt: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const BASE_WS_URL = BASE_URL.replace('/api/v1', '/ws');

/**
 * Phát âm thanh thông báo nhẹ nhàng qua Web Audio API không phụ thuộc file mp3 ngoài
 */
function playNotificationSound(type: 'support' | 'warning' = 'support') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'support') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Nốt D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.09); // Nốt A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // Nốt A4
      osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.12); // Nốt F4
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Bỏ qua nếu trình duyệt chặn audio
  }
}

export function useWebSocket() {
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const clientRef = useRef<Client | null>(null);
  const isConnectingRef = useRef(false);

  // Bộ chống spam (Throttling) và chống lặp ID (Deduplication)
  const seenNotificationIdsRef = useRef<Set<number>>(new Set());
  const lastPopupTimeRef = useRef<Record<string, number>>({});

  const shouldThrottlePopup = useCallback((key: string, cooldownMs = 30000): boolean => {
    const now = Date.now();
    const lastTime = lastPopupTimeRef.current[key] || 0;
    if (now - lastTime < cooldownMs) {
      return true; // Đang trong thời gian throttle -> bỏ qua popup
    }
    lastPopupTimeRef.current[key] = now;
    return false;
  }, []);

  /** Tải dữ liệu ban đầu qua apiClient (tự động Silent Refresh nếu accessToken hết hạn) */
  const fetchInitialData = useCallback(async (): Promise<boolean> => {
    try {
      const [countRes, listRes] = await Promise.all([
        apiClient.get<ApiResponse<number>>('/notifications/unread-count', { suppressErrorToast: true }),
        apiClient.get<ApiResponse<{ content: NotificationPayload[] }>>('/notifications?page=0&size=20', { suppressErrorToast: true }),
      ]);

      if (countRes && typeof countRes.data === 'number') {
        setUnreadCount(countRes.data);
      }

      if (listRes?.data?.content) {
        const normalized = listRes.data.content.map((n: any) => ({
          ...n,
          isRead: n.isRead === true || n.read === true,
        }));
        setNotifications(normalized);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    isConnectingRef.current = false;
    const currentClient = clientRef.current;
    clientRef.current = null;
    if (currentClient) {
      try {
        await currentClient.deactivate();
      } catch {
        // bỏ qua lỗi nếu socket đã đóng trước đó
      }
    }
    setClient(null);
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (clientRef.current?.active || isConnectingRef.current) return;
    isConnectingRef.current = true;

    const stompClient = new Client({
      // SockJS tự gửi cookie HttpOnly (credentials: 'include') khi handshake -> backend xác thực
      webSocketFactory: () => new SockJS(BASE_WS_URL),
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 5000,
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') console.log('[STOMP]', str);
      },
      onConnect: () => {
        isConnectingRef.current = false;
        setIsConnected(true);
        fetchInitialData(); // Resync dữ liệu thông báo sau khi (re)connect

        // 1. Kênh thông báo cá nhân hóa của người dùng
        stompClient.subscribe('/user/queue/notifications', (message: IMessage) => {
          if (!message.body) return;
          try {
            const raw: any = JSON.parse(message.body);
            const newNotification: NotificationPayload = {
              ...raw,
              isRead: raw.isRead === true || raw.read === true,
            };

            // Chống trùng lặp theo ID thông báo
            if (seenNotificationIdsRef.current.has(newNotification.id)) return;
            seenNotificationIdsRef.current.add(newNotification.id);

            setNotifications((prev) => {
              if (prev.some((n) => n.id === newNotification.id)) return prev;
              return [newNotification, ...prev].slice(0, 50);
            });
            setUnreadCount((prev) => prev + 1);

            // Bắn popup thông báo thời gian thực cho Ca tư vấn trực tuyến (Support Chat)
            if (newNotification.actionType === 'NEW_SUPPORT_REQUEST') {
              let convId = 'general';
              let customerName = 'Khách hàng';
              try {
                if (newNotification.payload) {
                  const p = JSON.parse(newNotification.payload);
                  if (p.conversationId) convId = String(p.conversationId);
                  if (p.customerName) customerName = p.customerName;
                }
              } catch {}

              // Kích hoạt sự kiện toàn cục để Sidebar và danh sách ca chat tự refetch
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('support_queue_updated'));
              }

              // Throttle 30s chống spam nhiều popup cho cùng 1 ca
              if (!shouldThrottlePopup(`support_${convId}`, 30000)) {
                playNotificationSound('support');
                toast.info(`🎧 Yêu Cầu Tư Vấn: ${customerName}`, {
                  description: newNotification.message || 'Khách hàng đang chờ chuyên viên kết nối tư vấn trực tiếp.',
                  duration: 8000,
                  action: {
                    label: 'Vào Chat',
                    onClick: () => {
                      if (typeof window !== 'undefined') {
                        window.location.href = newNotification.targetUrl || '/admin/support-chat';
                      }
                    },
                  },
                });
              }
            }

            // Bắn popup thông báo thời gian thực cho Cảnh báo kho (Low inventory / Out of stock)
            if (newNotification.actionType === 'LOW_INVENTORY' || newNotification.actionType === 'OUT_OF_STOCK') {
              let variantKey = 'stock_alert';
              try {
                if (newNotification.payload) {
                  const p = JSON.parse(newNotification.payload);
                  if (p.variantId) variantKey = `variant_${p.variantId}`;
                }
              } catch {}

              // Kích hoạt sự kiện toàn cục để Sidebar kho tự refetch
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('inventory_updated'));
              }

              // Throttle 30s chống spam nhiều popup
              if (!shouldThrottlePopup(variantKey, 30000)) {
                playNotificationSound('warning');
                const isOutOfStock = newNotification.actionType === 'OUT_OF_STOCK';
                toast.warning(isOutOfStock ? '🚨 Hết Hàng Trong Kho!' : '📦 Cảnh Báo Tồn Kho Thấp!', {
                  description: newNotification.message || 'Sản phẩm trong kho đã chạm ngưỡng cảnh báo, cần nhập thêm hàng.',
                  duration: 8000,
                  action: {
                    label: 'Kiểm Tra Kho',
                    onClick: () => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/admin/inventory';
                      }
                    },
                  },
                });
              }
            }
          

// Bắn popup thông báo thời gian thực & tooltip nổi cho Quản lý kho: Yêu cầu nhập kho mới
            if (newNotification.actionType === 'IMPORT_REQUEST_CREATED') {
              let requestCode = 'Mới';
              let productName = 'Sản phẩm mới';
              let senderName = 'Nhân viên';
              let totalQty = 0;
              try {
                if (newNotification.payload) {
                  const p = JSON.parse(newNotification.payload);
                  if (p.requestCode) requestCode = p.requestCode;
                  if (p.productName) productName = p.productName;
                  if (p.senderName) senderName = p.senderName;
                  if (p.totalQuantity) totalQty = p.totalQuantity;
                }
              } catch {}

              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('import_requests_updated'));
              }

              playNotificationSound('support');
              toast.info(`📦 Yêu Cầu Nhập Kho: ${requestCode}`, {
                description: `${senderName} vừa gửi yêu cầu nhập kho cho "${productName}" (${totalQty > 0 ? `${totalQty} cái` : 'Chờ kiểm đếm'}).`,
                duration: 10000,
                action: {
                  label: 'Xem & Duyệt',
                  onClick: () => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/admin/inventory/requests';
                    }
                  },
                },
              });
            }

            // Bắn popup thông báo thời gian thực khi Yêu cầu nhập kho được duyệt
            if (newNotification.actionType === 'IMPORT_REQUEST_APPROVED') {
              let requestCode = '';
              try {
                if (newNotification.payload) {
                  const p = JSON.parse(newNotification.payload);
                  if (p.requestCode) requestCode = p.requestCode;
                }
              } catch {}

              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('import_requests_updated'));
              }

              playNotificationSound('support');
              toast.success(`✅ Yêu Cầu Nhập Kho Đã Được Duyệt: ${requestCode}`, {
                description: newNotification.message || 'Quản lý kho đã hoàn tất kiểm đếm và ghi nhận hàng vào kho.',
                duration: 8000,
                action: {
                  label: 'Xem Chi Tiết',
                  onClick: () => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/admin/inventory/requests';
                    }
                  },
                },
              });
            }

            // Bắn popup thông báo thời gian thực khi Yêu cầu nhập kho bị từ chối
            if (newNotification.actionType === 'IMPORT_REQUEST_REJECTED') {
              let requestCode = '';
              try {
                if (newNotification.payload) {
                  const p = JSON.parse(newNotification.payload);
                  if (p.requestCode) requestCode = p.requestCode;
                }
              } catch {}

              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('import_requests_updated'));
              }

              playNotificationSound('warning');
              toast.error(`❌ Yêu Cầu Nhập Kho Bị Từ Chối: ${requestCode}`, {
                description: newNotification.message || 'Yêu cầu nhập kho đã bị từ chối bởi Quản lý kho.',
                duration: 8000,
                action: {
                  label: 'Kiểm Tra',
                  onClick: () => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/admin/inventory/requests';
                    }
                  },
                },
              });
            }
          } catch (e) {
            console.error('Lỗi parse JSON thông báo:', e);
          }
        });

        // 2. Kênh phát sóng hàng đợi hỗ trợ chung cho Quản trị viên & Nhân viên trực ca
        stompClient.subscribe('/topic/support-queue', (frame: IMessage) => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('support_queue_updated'));
          }
        });
      },
      onStompError: (frame) => {
        const errMsg = frame.headers['message'] || '';
        // Bỏ qua cảnh báo nếu là session closed do unmount / handshake cleanup từ Strict Mode
        if (errMsg.includes('Session closed')) {
          return;
        }
        console.warn('[STOMP] Thông báo từ broker:', errMsg);
        // Không tự động gọi lại connect() tại đây vì thư viện STOMPjs đã có reconnectDelay tự động quản lý
      },
      onWebSocketClose: () => {
        isConnectingRef.current = false;
        setIsConnected(false);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;
    setClient(stompClient);
  }, [fetchInitialData]);

  // Quản lý vòng đời kết nối:
  // 1. Kiểm tra phiên 1 lần khi mount -> Nếu hợp lệ thì connect WebSocket
  // 2. Lắng nghe event auth:login và auth:logout từ AuthContext / AdminAuthContext
  // 3. Resync khi chuyển tab trở lại (visibilitychange)
  useEffect(() => {
    let cancelled = false;

    // Không gọi API thông báo và không kết nối WebSocket nếu chưa đăng nhập
    if (!user) {
      disconnect();
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const checkAndConnect = async () => {
      if (clientRef.current?.active) return;
      const hasSession = await fetchInitialData();
      if (cancelled) return;
      if (hasSession) {
        connect();
      } else if (clientRef.current) {
        disconnect();
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    // Kiểm tra ban đầu khi mount hoặc khi user đăng nhập
    checkAndConnect();

    // Tự động kết nối ngay khi người dùng đăng nhập thành công
    const handleLogin = () => {
      checkAndConnect();
    };

    // Tự động ngắt kết nối và dọn sạch state khi đăng xuất
    const handleLogout = () => {
      disconnect();
      setNotifications([]);
      setUnreadCount(0);
    };

    // Kiểm tra và kết nối lại khi người dùng quay lại tab (nếu chưa kết nối)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !clientRef.current?.active) {
        checkAndConnect();
      }
    };

    window.addEventListener('auth:login', handleLogin);
    window.addEventListener('auth:logout', handleLogout);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener('auth:login', handleLogin);
      window.removeEventListener('auth:logout', handleLogout);
      document.removeEventListener('visibilitychange', handleVisibility);
      disconnect();
    };
  }, [user, fetchInitialData, connect, disconnect]);

  const markAsRead = async (id: number) => {
    try {
      await apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`, {}, { suppressErrorToast: true });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Lỗi khi đánh dấu đã đọc:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch<ApiResponse<void>>('/notifications/read-all', {}, { suppressErrorToast: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', e);
    }
  };

  return {
    client,
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
