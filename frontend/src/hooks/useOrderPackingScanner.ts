'use client';

import { useState, useMemo, useCallback } from 'react';
import { AdminOrderDetail } from '@/types/admin-order';
import { warehouseFulfillmentController } from '@/controllers/warehouse-fulfillment-controller';
import { toast } from 'sonner';

interface UseOrderPackingScannerParams {
  order: AdminOrderDetail | null;
  onSuccess?: (updatedOrder: AdminOrderDetail) => void;
}

/**
 * Phát âm thanh bíp thông qua Web Audio API không phụ thuộc asset bên ngoài
 */
function playBeep(type: 'success' | 'error' = 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Nốt A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08); // Nốt D6
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // Nốt A3 trầm
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Bỏ qua nếu trình duyệt chặn audio autoplay
  }
}

export function useOrderPackingScanner({ order, onSuccess }: UseOrderPackingScannerParams) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scannedMap, setScannedMap] = useState<Record<number, number>>({});
  const [manualCode, setManualCode] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Tổng số lượng mặt hàng yêu cầu và đã quét
  const { totalRequired, totalScanned, isAllScanned, progressPercentage } = useMemo(() => {
    if (!order?.items || order.items.length === 0) {
      return { totalRequired: 0, totalScanned: 0, isAllScanned: false, progressPercentage: 0 };
    }

    let reqSum = 0;
    let scanSum = 0;
    let allDone = true;

    order.items.forEach((item) => {
      reqSum += item.quantity;
      const vId = item.variantId || item.productId;
      const currentScanned = scannedMap[vId] || 0;
      scanSum += Math.min(currentScanned, item.quantity);

      if (currentScanned < item.quantity) {
        allDone = false;
      }
    });

    const percent = reqSum > 0 ? Math.round((scanSum / reqSum) * 100) : 0;
    return {
      totalRequired: reqSum,
      totalScanned: scanSum,
      isAllScanned: allDone && reqSum > 0,
      progressPercentage: percent,
    };
  }, [order, scannedMap]);

  const openModal = useCallback(() => {
    setScannedMap({});
    setManualCode('');
    setIsCameraActive(false);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Xử lý quét hoặc gõ mã barcode/sku
  const handleScanCode = useCallback(
    (rawCode: string) => {
      const code = rawCode.trim();
      if (!code || !order?.items) return;

      const matchedItem = order.items.find(
        (it) =>
          (it.barcode && it.barcode.toLowerCase() === code.toLowerCase()) ||
          (it.sku && it.sku.toLowerCase() === code.toLowerCase())
      );

      if (!matchedItem) {
        playBeep('error');
        toast.error(`Mã vạch "${code}" không thuộc đơn hàng #${order.orderCode}!`);
        return;
      }

      const vId = matchedItem.variantId || matchedItem.productId;
      const current = scannedMap[vId] || 0;

      if (current >= matchedItem.quantity) {
        playBeep('error');
        toast.warning(
          `Sản phẩm "${matchedItem.productName}" đã quét đủ số lượng (${matchedItem.quantity}) rồi!`
        );
        return;
      }

      playBeep('success');
      setScannedMap((prev) => ({
        ...prev,
        [vId]: current + 1,
      }));
      setManualCode('');
      toast.success(
        `Đã quét: ${matchedItem.productName} (${current + 1}/${matchedItem.quantity})`
      );
    },
    [order, scannedMap]
  );

  const handleReset = useCallback(() => {
    setScannedMap({});
    toast.info('Đã xóa dữ liệu kiểm đếm, bạn có thể quét lại từ đầu.');
  }, []);

  // Gửi xác nhận kiểm đếm đủ 100%
  const handleSubmit = useCallback(async () => {
    if (!order) return;
    if (!isAllScanned) {
      toast.error('Vui lòng quét đủ 100% số lượng các mặt hàng trước khi xác nhận đóng gói!');
      return;
    }

    try {
      setLoading(true);
      const scannedList = order.items.map((it) => ({
        variantId: it.variantId || it.productId,
        barcode: it.barcode || it.sku || '',
        scannedQuantity: scannedMap[it.variantId || it.productId] || it.quantity,
      }));

      const res = await warehouseFulfillmentController.verifyOrderPack(order.id, {
        scannedItems: scannedList,
        note: note.trim() || undefined,
      });

      if (res && res.status === 200 && res.data) {
        toast.success(res.message || 'Kiểm đếm và đóng gói đơn hàng thành công!');
        closeModal();
        if (onSuccess) {
          onSuccess(res.data);
        }
      } else {
        toast.error(res.message || 'Không thể xác thực kiểm đếm đơn hàng');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi xác thực đóng gói');
    } finally {
      setLoading(false);
    }
  }, [order, isAllScanned, scannedMap, note, closeModal, onSuccess]);

  return {
    isOpen,
    openModal,
    closeModal,
    scannedMap,
    manualCode,
    setManualCode,
    isCameraActive,
    setIsCameraActive,
    note,
    setNote,
    loading,
    totalRequired,
    totalScanned,
    isAllScanned,
    progressPercentage,
    handleScanCode,
    handleReset,
    handleSubmit,
  };
}
