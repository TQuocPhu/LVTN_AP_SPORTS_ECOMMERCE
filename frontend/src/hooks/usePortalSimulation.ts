import { useState, useEffect, useRef, useCallback } from 'react';
import { AdminOrderDetail } from '@/types/admin-order';
import { STORE_LOCATION_CONSTANTS } from '@/constants/location-constants';
import {
  broadcastLogisticsProgress,
  saveSimState,
  loadSimState,
  clearSimState,
} from '@/utils/logistics-sync';

// Tính toán khoảng cách thực tế (Haversine Formula) theo tọa độ GPS điểm đến của từng đơn hàng
function calculateOrderDistanceKm(destLat?: number | null, destLng?: number | null): number {
  if (!destLat || !destLng) return 171.9; // Fallback chỉ khi chưa có GPS
  const lat1 = STORE_LOCATION_CONSTANTS.STORE_GPS_LATITUDE;
  const lon1 = STORE_LOCATION_CONSTANTS.STORE_GPS_LONGITUDE;
  const lat2 = destLat;
  const lon2 = destLng;

  const R = 6371; // Bán kính trái đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = Math.round(R * c * 10) / 10;
  return dist > 0 ? dist : 15;
}

export function usePortalSimulation(orders: AdminOrderDetail[], defaultStatus: string = 'shipping') {
  const [simProgressMap, setSimProgressMap] = useState<Record<number, number>>({});
  const [activeSimId, setActiveSimId] = useState<number | null>(null);
  const timerRefs = useRef<Record<number, NodeJS.Timeout>>({});

  // Restore saved simulation progress on load / reload dynamically for each order
  useEffect(() => {
    if (orders.length === 0) return;

    orders.forEach((order) => {
      const distanceKm = calculateOrderDistanceKm(order.gpsLatitude, order.gpsLongitude);
      const saved = loadSimState(order.id, distanceKm);
      if (saved) {
        setSimProgressMap((prev) => ({ ...prev, [order.id]: saved.currentProgress }));
        broadcastLogisticsProgress({
          orderId: order.id,
          orderCode: order.orderCode,
          trackingCode: order.trackingCode,
          progressPercentage: saved.currentProgress,
          status: defaultStatus,
        });
      }
    });
  }, [orders, defaultStatus]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach((t) => clearInterval(t));
    };
  }, []);

  const startSimulation = useCallback(
    (order: AdminOrderDetail, isFast: boolean) => {
      const orderId = order.id;
      if (timerRefs.current[orderId]) {
        clearInterval(timerRefs.current[orderId]);
      }

      setActiveSimId(orderId);
      let current = simProgressMap[orderId] ?? 0;
      if (current >= 100) {
        current = 0;
      }

      // Dynamic distance calculated specifically for this order
      const distanceKm = calculateOrderDistanceKm(order.gpsLatitude, order.gpsLongitude);
      const remainingSteps = Math.max(1, 100 - current);
      const intervalMs = isFast
        ? Math.max(50, Math.round(10000 / remainingSteps))
        : 500; // 500ms smooth step interval for UI simulation

      saveSimState({
        orderId,
        mode: isFast ? 'fast_10s' : 'real_60kmh',
        startTime: Date.now() - (current / 100) * (distanceKm * 60 * 1000),
        startProgress: current,
        distanceKm,
        currentProgress: current,
        lastUpdated: Date.now(),
      });

      const timer = setInterval(() => {
        current = Math.min(100, current + 1);
        setSimProgressMap((prev) => ({ ...prev, [orderId]: current }));

        saveSimState({
          orderId,
          mode: isFast ? 'fast_10s' : 'real_60kmh',
          startTime: Date.now() - (current / 100) * (distanceKm * 60 * 1000),
          startProgress: current,
          distanceKm,
          currentProgress: current,
          lastUpdated: Date.now(),
        });

        broadcastLogisticsProgress({
          orderId: order.id,
          orderCode: order.orderCode,
          trackingCode: order.trackingCode,
          progressPercentage: current,
          status: defaultStatus,
        });

        if (current >= 100) {
          clearInterval(timerRefs.current[orderId]);
          setActiveSimId(null);
        }
      }, intervalMs);

      timerRefs.current[orderId] = timer;
    },
    [simProgressMap, defaultStatus]
  );

  const resetSimulation = useCallback(
    (order: AdminOrderDetail) => {
      if (timerRefs.current[order.id]) {
        clearInterval(timerRefs.current[order.id]);
      }
      clearSimState(order.id);
      setActiveSimId(null);
      setSimProgressMap((prev) => ({ ...prev, [order.id]: 0 }));

      broadcastLogisticsProgress({
        orderId: order.id,
        orderCode: order.orderCode,
        trackingCode: order.trackingCode,
        progressPercentage: 0,
        status: defaultStatus,
      });
    },
    [defaultStatus]
  );

  return {
    simProgressMap,
    activeSimId,
    startSimulation,
    resetSimulation,
  };
}
