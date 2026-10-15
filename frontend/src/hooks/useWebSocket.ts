import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { apiClient } from '@/services/api/client';
import { ApiResponse } from '@/types/auth';

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

export function useWebSocket() {
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const clientRef = useRef<Client | null>(null);
  const isConnectingRef = useRef(false);

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

        stompClient.subscribe('/user/queue/notifications', (message: IMessage) => {
          if (!message.body) return;
          try {
            const raw: any = JSON.parse(message.body);
            const newNotification: NotificationPayload = {
              ...raw,
              isRead: raw.isRead === true || raw.read === true,
            };
            setNotifications((prev) => {
              if (prev.some((n) => n.id === newNotification.id)) return prev;
              return [newNotification, ...prev].slice(0, 50);
            });
            setUnreadCount((prev) => prev + 1);
          } catch (e) {
            console.error('Lỗi parse JSON thông báo:', e);
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

    // Kiểm tra ban đầu khi mount
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
  }, [fetchInitialData, connect, disconnect]);

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
