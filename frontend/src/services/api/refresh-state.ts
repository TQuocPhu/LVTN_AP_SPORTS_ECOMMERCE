/**
 * State quản lý silent refresh được lưu trên window thay vì module-level variable.
 * Lý do: Trong dev mode, Next.js HMR re-evaluate module nhiều lần khi có thay đổi,
 * khiến biến module bị reset về giá trị khởi tạo trong khi request đang chạy.
 * Lưu trên window giúp state tồn tại qua các HMR reload → không bị race condition.
 */
declare global {
  interface Window {
    __apiIsRefreshing__: boolean;
    __apiRefreshSubscribers__: ((success: boolean) => void)[];
  }
}

export function getIsRefreshing(): boolean {
  if (typeof window === 'undefined') return false;
  return window.__apiIsRefreshing__ ?? false;
}

export function setIsRefreshing(value: boolean): void {
  if (typeof window === 'undefined') return;
  window.__apiIsRefreshing__ = value;
}

export function getRefreshSubscribers(): ((success: boolean) => void)[] {
  if (typeof window === 'undefined') return [];
  if (!Array.isArray(window.__apiRefreshSubscribers__)) {
    window.__apiRefreshSubscribers__ = [];
  }
  return window.__apiRefreshSubscribers__;
}

export function subscribeTokenRefresh(): Promise<boolean> {
  return new Promise((resolve) => {
    // Safety timeout (10s) để ngăn đơ/treo trang UI trong mọi trường hợp
    const timer = setTimeout(() => {
      resolve(false);
    }, 10000);

    getRefreshSubscribers().push((success: boolean) => {
      clearTimeout(timer);
      resolve(success);
    });
  });
}

export function onRefreshed(success: boolean): void {
  const subscribers = getRefreshSubscribers();
  subscribers.forEach((cb) => cb(success));
  if (typeof window !== 'undefined') {
    window.__apiRefreshSubscribers__ = [];
  }
}
