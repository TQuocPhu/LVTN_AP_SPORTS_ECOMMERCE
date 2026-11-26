'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom Hook quản lý trạng thái xuất file Excel (.xlsx) bất đồng bộ cho các bảng quản trị.
 * Hỗ trợ hiển thị trạng thái đang tải (isExporting), cảnh báo nếu đạt ngưỡng tối đa 5.000 dòng.
 */
export function useExcelExport() {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const runExport = useCallback(
    async (
      exportTask: () => Promise<number | void>,
      successMessage = 'Đã xuất file Excel (.xlsx) thành công!'
    ) => {
      if (isExporting) return;
      setIsExporting(true);
      try {
        const exportedCount = await exportTask();
        if (typeof exportedCount === 'number' && exportedCount >= 5000) {
          toast.warning(
            'Dữ liệu đạt giới hạn tối đa 5.000 dòng/lần xuất. Hãy thu hẹp bộ lọc ngày để xuất đầy đủ hơn.'
          );
        } else {
          toast.success(successMessage);
        }
      } catch (err) {
        console.error('Lỗi khi xuất file Excel:', err);
        toast.error('Không thể xuất file Excel. Vui lòng thử lại.');
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting]
  );

  return {
    isExporting,
    runExport,
  };
}
