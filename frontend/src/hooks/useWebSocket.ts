import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getCookie } from '@/services/api-client';

export interface NotificationPayload {
  id: number;
  userId: number;
  senderId?: number;
  isRead: boolean;
  readAt?: string;
  targetUrl?: string;
  actionType: string;
  payload: string;
  createdAt: string;
}

export function useWebSocket() {
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const clientRef = useRef<Client | null>(null);
  const hasAttemptedConnectRef = useRef(false);

  // Fetch initial notifications and unread count
  const fetchInitialData = useCallback(async (token: string) => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const token = getCookie('accessToken');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [countRes, listRes] = await Promise.all([
        fetch(`${BASE_URL}/notifications/unread-count`, { headers }),
        fetch(`${BASE_URL}/notifications?page=0&size=20`, { headers })
      ]);

      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.data || 0);
      }

      if (listRes.ok) {
        const listData = await listRes.json();
        if (listData.data && listData.data.content) {
          setNotifications(listData.data.content);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải thông báo ban đầu:', error);
    }
  }, []);

  useEffect(() => {
    const token = getCookie('accessToken');
    
    if (!token) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setIsConnected(false);
        setNotifications([]);
        setUnreadCount(0);
      }
      return;
    }

    // Nếu đã kết nối rồi thì không làm gì thêm
    if (clientRef.current?.connected) return;

    fetchInitialData(token);

    const BASE_WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '/ws');
    
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(BASE_WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[STOMP]', str);
        }
      },
      reconnectDelay: 5000, // Tự động kết nối lại sau 5 giây nếu đứt
      onConnect: () => {
        console.log('[STOMP] Kết nối thành công');
        setIsConnected(true);

        // Sau khi kết nối, lấy lại dữ liệu mới nhất (resync)
        fetchInitialData(token);

        // Subscribe kênh cá nhân
        stompClient.subscribe('/user/queue/notifications', (message: IMessage) => {
          if (message.body) {
            try {
              const newNotification: NotificationPayload = JSON.parse(message.body);
              
              // Cập nhật state với thông báo mới (thêm vào đầu danh sách)
              setNotifications(prev => {
                // Tránh trùng lặp nếu trùng ID (hiếm khi xảy ra nhưng an toàn)
                if (prev.some(n => n.id === newNotification.id)) return prev;
                return [newNotification, ...prev].slice(0, 50); // Giữ tối đa 50 cái trên giao diện memory
              });
              
              // Tăng số lượng chưa đọc lên 1
              setUnreadCount(prev => prev + 1);

            } catch (e) {
              console.error('Lỗi parse JSON thông báo:', e);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('[STOMP] Broker báo lỗi: ' + frame.headers['message']);
        console.error('[STOMP] Chi tiết: ' + frame.body);
      },
      onWebSocketClose: () => {
        setIsConnected(false);
      }
    });

    stompClient.activate();
    clientRef.current = stompClient;
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [fetchInitialData]);

  // Lắng nghe sự kiện thay đổi cookie hoặc đăng nhập để re-trigger kết nối nếu cần
  useEffect(() => {
    const interval = setInterval(() => {
      const token = getCookie('accessToken');
      if (token && !clientRef.current) {
         // Nếu có token mà chưa có client (ví dụ vừa login xong), trigger lại state
         setIsConnected(prev => prev); // force re-evaluate?
         // Actually better to just refresh page or rely on page reload which happens on login in many apps.
         // In this app, we can just trigger a dummy state update to run the main useEffect again.
         setUnreadCount(prev => prev); 
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const token = getCookie('accessToken');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('Lỗi khi đánh dấu đã đọc:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const token = getCookie('accessToken');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
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
    markAllAsRead
  };
}
