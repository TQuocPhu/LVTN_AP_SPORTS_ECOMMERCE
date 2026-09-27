const LOGISTICS_CHANNEL_NAME = 'ap_sports_logistics_sync';

export interface LogisticsSyncPayload {
  orderId?: number;
  orderCode?: string;
  trackingCode?: string;
  progressPercentage: number;
  status?: string;
}

export interface PersistedSimState {
  orderId: number;
  mode: 'real_60kmh' | 'fast_10s' | 'idle';
  startTime: number;
  startProgress: number;
  distanceKm: number;
  currentProgress: number;
  lastUpdated: number;
}

/**
 * Tính toán % tiến trình xe di chuyển DỰA TRÊN THỜI GIAN THỰC Đã Trôi Qua từ Backend Timestamp
 * Mặc định 0% (Tại Kho AP Sports) ngoại trừ khi đơn hàng đã hoàn tất (100%) hoặc có tin nhắn broadcast tiến trình
 */
export function calculateRealTimeProgress(
  orderStatus?: string,
  updatedAtStr?: string,
  distanceKm: number = 171.9
): number {
  const status = orderStatus?.toLowerCase() || '';

  if (status === 'delivered' || status === 'completed') {
    return 100;
  }

  if (status !== 'shipping' && status !== 'shipped') {
    return 0; // pending, confirmed, processing, cancelled -> 0% (Kho AP Sports)
  }

  // Nếu chưa có mốc thời gian xuất phát hoặc vừa chuyển trạng thái, mặc định 0% tại Kho AP Sports
  if (!updatedAtStr) {
    return 0;
  }

  try {
    const lastUpdateMs = new Date(updatedAtStr).getTime();
    if (isNaN(lastUpdateMs)) return 0;

    const elapsedSeconds = Math.max(0, (Date.now() - lastUpdateMs) / 1000);
    const validDist = distanceKm > 0 ? distanceKm : 171.9;

    // Nếu vừa mới chuyển trạng thái trong vòng 5 giây gần đây, bắt đầu từ 0%
    if (elapsedSeconds < 5) {
      return 0;
    }

    if (status === 'shipped') {
      const totalLegSeconds = validDist * 12; // ~20% chặng đường
      const progress = Math.min(20, Math.round((elapsedSeconds / totalLegSeconds) * 20 * 10) / 10);
      return progress;
    }

    if (status === 'shipping') {
      // Tốc độ 60 km/h = 1 km / 1 phút = 60 giây / 1 km
      const totalSecondsForRoute = validDist * 60;
      const progressAdded = (elapsedSeconds / totalSecondsForRoute) * 100;
      const totalProgress = Math.min(100, Math.round(progressAdded * 10) / 10);
      return totalProgress;
    }

    return 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Lưu trạng thái mô phỏng xe tải vào LocalStorage
 */
export function saveSimState(state: PersistedSimState) {
  if (typeof window === 'undefined') return;
  try {
    const key = `ap_sim_state_${state.orderId}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving sim state:', e);
  }
}

/**
 * Đọc trạng thái mô phỏng xe tải
 */
export function loadSimState(orderId: number, distanceKm: number = 50): PersistedSimState | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = `ap_sim_state_${orderId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const state: PersistedSimState = JSON.parse(raw);
    const validDist = state.distanceKm || distanceKm || 50;

    if (state.mode === 'real_60kmh' && state.startTime) {
      const elapsedSeconds = (Date.now() - state.startTime) / 1000;
      const totalSecondsNeeded = validDist * 60;
      const addedProgress = (elapsedSeconds / totalSecondsNeeded) * 100;
      const calculatedProgress = Math.min(100, Math.round((state.startProgress + addedProgress) * 10) / 10);

      const updatedState: PersistedSimState = {
        ...state,
        currentProgress: calculatedProgress,
        lastUpdated: Date.now(),
      };

      if (calculatedProgress >= 100) {
        updatedState.mode = 'idle';
      }

      saveSimState(updatedState);
      return updatedState;
    }

    return state;
  } catch (e) {
    return null;
  }
}

/**
 * Xóa trạng thái mô phỏng
 */
export function clearSimState(orderId: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`ap_sim_state_${orderId}`);
  } catch (e) {}
}

/**
 * Phát tin nhắn Broadcast tiến trình di chuyển xe tải real-time cho tất cả các Tab
 */
export function broadcastLogisticsProgress(payload: LogisticsSyncPayload) {
  if (typeof window === 'undefined') return;
  try {
    const channel = new BroadcastChannel(LOGISTICS_CHANNEL_NAME);
    channel.postMessage(payload);
    channel.close();
  } catch (e) {
    localStorage.setItem(
      'ap_logistics_sync_event',
      JSON.stringify({ ...payload, _t: Date.now() })
    );
  }
}

/**
 * Lắng nghe tiến trình xe tải real-time từ bất kỳ Portal nào
 */
export function subscribeLogisticsProgress(
  callback: (payload: LogisticsSyncPayload) => void
) {
  if (typeof window === 'undefined') return () => {};

  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(LOGISTICS_CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data) {
        callback(event.data);
      }
    };
  } catch (e) {}

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'ap_logistics_sync_event' && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        callback(data);
      } catch {}
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    channel?.close();
    window.removeEventListener('storage', handleStorage);
  };
}
