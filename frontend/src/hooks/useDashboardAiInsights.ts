import { useState, useCallback } from 'react';
import { adminAiController } from '@/controllers/admin-ai-controller';
import { AiBusinessAdvisorResponse } from '@/types/ai';

/**
 * Custom Hook quản lý tính năng AI Executive Business Advisor (Agent 3) trên trang Dashboard
 */
export function useDashboardAiInsights() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AiBusinessAdvisorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminAiController.getBusinessInsights();
      if (res?.data) {
        setInsights(res.data);
      } else {
        setError('Không thể tải báo cáo cố vấn chiến lược từ AI.');
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi kết nối khi phân tích số liệu BI.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!insights) {
      fetchInsights();
    }
  }, [insights, fetchInsights]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    isOpen,
    isLoading,
    insights,
    error,
    handleOpen,
    handleClose,
    handleRefresh,
  };
}
