import { useState, useEffect, useCallback } from 'react';
import { customerAiController } from '@/controllers/customer-ai-controller';
import { AiReviewSummaryResponse } from '@/types/ai';

/**
 * Custom Hook quản lý tính năng AI Review Sentiment & Summary (Agent 4)
 * Tự động tải tóm tắt đánh giá sản phẩm khi hiển thị trên trang chi tiết sản phẩm.
 */
export function useReviewAiSummary(productId?: number) {
  const [summary, setSummary] = useState<AiReviewSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!productId || productId <= 0) return;
    setIsLoading(true);
    setError(null);
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

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refreshSummary: fetchSummary,
  };
}
