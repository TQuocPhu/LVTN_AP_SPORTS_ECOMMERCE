import { useState, useEffect, useCallback } from 'react';
import { customerAiController } from '@/controllers/customer-ai-controller';
import { AiReviewSummaryResponse } from '@/types/ai';

/**
 * Custom Hook quản lý tính năng AI Review Sentiment & Summary (Agent 4)
 * Chỉ gọi API khi người dùng chủ động bấm xem tóm tắt AI (on-demand) để tránh vượt hạn mức API.
 */
export function useReviewAiSummary(productId?: number) {
  const [summary, setSummary] = useState<AiReviewSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  // Reset state khi chuyển sang sản phẩm khác (không tự động gọi API)
  useEffect(() => {
    setSummary(null);
    setError(null);
    setHasRequested(false);
  }, [productId]);

  const fetchSummary = useCallback(async () => {
    if (!productId || productId <= 0) return;
    setIsLoading(true);
    setError(null);
    setHasRequested(true);
    try {
      const res = await customerAiController.getReviewSummary(productId);
      if (res?.data) {
        setSummary(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tải tóm tắt đánh giá AI.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  return {
    summary,
    isLoading,
    error,
    hasRequested,
    refreshSummary: fetchSummary,
  };
}
