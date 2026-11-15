import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/api.config';

export interface OrderRealtimeEvent {
  orderId?: number;
  orderCode?: string;
  status?: string;
  userId?: number;
  updatedAt?: string;
}

type OrderRealtimeListener = (event: OrderRealtimeEvent) => void;

const listeners = new Set<OrderRealtimeListener>();
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let isConnecting = false;
let buffer = '';

/**
 * Chuyển đổi BASE_URL (http/https) sang URL WebSocket thuần (/ws) cho Mobile App
 */
function getWebSocketUrl(): string {
  const base = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${base.replace(/^http/, 'ws')}/ws`;
}

function sendFrame(command: string, headers: Record<string, string>, body = '') {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  const headerLines = Object.entries(headers)
    .map(([k, v]) => `${k}:${v}`)
    .join('\n');
  const frame = `${command}\n${headerLines}\n\n${body}\0`;
  socket.send(frame);
}

function cleanupTimers() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function handleIncomingData(chunk: string) {
  buffer += chunk;
  const frames = buffer.split('\0');
  buffer = frames.pop() ?? '';

  for (const rawFrame of frames) {
    const trimmed = rawFrame.replace(/^\n+/, '');
    if (!trimmed) continue; // heartbeat LF

    const headerEndIdx = trimmed.indexOf('\n\n');
    if (headerEndIdx === -1) continue;

    const headerPart = trimmed.slice(0, headerEndIdx);
    const bodyPart = trimmed.slice(headerEndIdx + 2);
    const lines = headerPart.split('\n');
    const command = lines[0]?.trim();

    if (command === 'CONNECTED') {
      sendFrame('SUBSCRIBE', {
        id: 'sub-mobile-orders',
        destination: '/topic/orders',
      });
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send('\n');
        }
      }, 10000);
    } else if (command === 'MESSAGE') {
      try {
        const parsed: OrderRealtimeEvent = bodyPart ? JSON.parse(bodyPart) : {};
        listeners.forEach((cb) => cb(parsed));
      } catch {
        listeners.forEach((cb) => cb({}));
      }
    }
  }
}

async function ensureConnected() {
  if (listeners.size === 0) return;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }
  if (isConnecting) return;

  isConnecting = true;
  try {
    const token = await SecureStore.getItemAsync(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    if (!token || listeners.size === 0) {
      isConnecting = false;
      return;
    }

    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);
    socket = ws;
    buffer = '';

    ws.onopen = () => {
      isConnecting = false;
      sendFrame('CONNECT', {
        Authorization: `Bearer ${token}`,
        'accept-version': '1.2',
        'heart-beat': '10000,10000',
      });
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        handleIncomingData(event.data);
      }
    };

    ws.onerror = () => {
      // Lỗi sẽ được xử lý tự động qua onclose và reconnectTimer
    };

    ws.onclose = () => {
      isConnecting = false;
      if (socket === ws) {
        socket = null;
      }
      cleanupTimers();
      if (listeners.size > 0) {
        reconnectTimer = setTimeout(() => {
          ensureConnected();
        }, 5000);
      }
    };
  } catch {
    isConnecting = false;
  }
}

/**
 * Đăng ký lắng nghe sự kiện thay đổi trạng thái đơn hàng thời gian thực qua WebSocket (/topic/orders)
 */
export function subscribeOrderRealtime(listener: OrderRealtimeListener): () => void {
  listeners.add(listener);
  ensureConnected();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      cleanupTimers();
      if (socket) {
        try {
          sendFrame('DISCONNECT', {});
          socket.close();
        } catch {
          // Bỏ qua lỗi khi đóng socket
        }
        socket = null;
      }
    }
  };
}
