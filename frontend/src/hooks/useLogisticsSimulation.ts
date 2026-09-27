import { useState, useEffect, useCallback, useRef } from 'react';
import { OrderStatus } from '@/types/order';

interface UseLogisticsSimulationParams {
  currentStatus: string;
  distanceKm?: number | null;
  onUpdateStatus: (newStatus: OrderStatus, note?: string) => Promise<void>;
  onProgressChange?: (progress: number) => void;
}

export function useLogisticsSimulation({
  currentStatus,
  distanceKm = 20,
  onUpdateStatus,
  onProgressChange,
}: UseLogisticsSimulationParams) {
  const [simProgress, setSimProgress] = useState<number>(() => {
    switch (currentStatus?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 100;
      default:
        return 0;
    }
  });

  const [simulationMode, setSimulationMode] = useState<'idle' | 'real_60kmh' | 'fast_10s'>('idle');
  const [noteText, setNoteText] = useState<string>('');
  const onProgressChangeRef = useRef(onProgressChange);

  // Keep ref up to date
  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  // Safely defer notifying parent component to avoid React setState in render warning!
  const safeNotifyProgress = useCallback((val: number) => {
    setTimeout(() => {
      onProgressChangeRef.current?.(val);
    }, 0);
  }, []);

  // Sync initial progress when currentStatus changes
  useEffect(() => {
    let target = 0;
    switch (currentStatus?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        target = 100;
        break;
      default:
        target = 0;
    }
    setSimProgress(target);
    safeNotifyProgress(target);
  }, [currentStatus, safeNotifyProgress]);

  // Handle Physics 60 km/h and Fast 10s Demo Timers
  useEffect(() => {
    if (simulationMode === 'idle') return;

    // Calculate step interval based on physics math:
    // Speed = 60 km/h = 1 km / 1 min = 1 km / 60 sec.
    // For 100% total progress across dist (km):
    // Real 60 km/h mode: 1% progress interval = dist (km) * 600 ms (e.g. 10 km = 6,000 ms = 6 seconds per 1%)
    // Fast 10s mode: 100ms per 1% step (completes 100% in 10s)
    const validDist = distanceKm && distanceKm > 0 ? distanceKm : 20;
    const realSpeedIntervalMs = Math.max(100, Math.round(validDist * 600));
    const intervalMs = simulationMode === 'fast_10s' ? 100 : realSpeedIntervalMs;

    const timer = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          setSimulationMode('idle');
          safeNotifyProgress(100);
          return 100;
        }
        const next = prev + 1;
        safeNotifyProgress(next);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simulationMode, distanceKm, safeNotifyProgress]);

  const handleSliderChange = useCallback(
    (val: number) => {
      setSimProgress(val);
      safeNotifyProgress(val);
    },
    [safeNotifyProgress]
  );

  const startRealSpeedSimulation = useCallback(() => {
    setSimulationMode('real_60kmh');
  }, []);

  const startFastDemoSimulation = useCallback(() => {
    setSimulationMode('fast_10s');
  }, []);

  const stopSimulation = useCallback(() => {
    setSimulationMode('idle');
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulationMode('idle');
    setSimProgress(0);
    safeNotifyProgress(0);
  }, [safeNotifyProgress]);

  const handleStatusClick = useCallback(
    async (status: OrderStatus, customNote?: string) => {
      setSimulationMode('idle');
      await onUpdateStatus(status, customNote || noteText);
      setNoteText('');
    },
    [onUpdateStatus, noteText]
  );

  const getStatusStepIndex = useCallback((status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'shipping':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 0;
    }
  }, []);

  const stepIdx = getStatusStepIndex(currentStatus);
  const isShippingActive =
    currentStatus?.toLowerCase() === 'shipped' || currentStatus?.toLowerCase() === 'shipping';

  // Math calculated real-time variables
  const validDist = distanceKm && distanceKm > 0 ? distanceKm : 20;
  const remainingDistKm = Math.max(0, Math.round(validDist * (1 - simProgress / 100) * 10) / 10);
  const remainingTimeMins = Math.ceil((remainingDistKm / 60) * 60);

  return {
    simProgress,
    simulationMode,
    isSimulating: simulationMode !== 'idle',
    isShippingActive,
    noteText,
    setNoteText,
    stepIdx,
    remainingDistKm,
    remainingTimeMins,
    currentSpeedKmh: 60,
    handleSliderChange,
    startRealSpeedSimulation,
    startFastDemoSimulation,
    stopSimulation,
    resetSimulation,
    handleStatusClick,
  };
}
