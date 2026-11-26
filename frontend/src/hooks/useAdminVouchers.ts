import { useState, useEffect, useCallback, useRef } from "react";
import { voucherController } from "@/controllers/voucher-controller";
import {
  Voucher,
  AdminVoucherDetail,
  VoucherFilterParams,
  VoucherFormData,
  PageResponse,
} from "@/types/voucher";
import { toast } from "sonner";
import { useExcelExport } from "@/hooks/useExcelExport";
import { downloadStyledExcelWorkbook } from "@/utils/excelExportBuilder";

/**
 * Custom Hook quản lý toàn bộ trạng thái, bộ lọc tìm kiếm, sắp xếp đa tiêu chí và các action CRUD cho Admin Voucher Management.
 * Tuân thủ nghiêm ngặt quy tắc Tầng 3 (Hooks), không viết logic xử lý dữ liệu vào Page hay Components.
 * Sử dụng thư viện 'sonner' cho thông báo toast.
 */
export function useAdminVouchers() {
  // Trạng thái bộ lọc
  const [filters, setFilters] = useState<VoucherFilterParams>({
    keyword: "",
    type: "ALL",
    status: "ALL",
    categoryScope: "ALL",
    sortBy: "createdAt",
    sortDir: "DESC",
    page: 0,
    size: 10,
  });

  // Debounce 400ms cho từ khóa tìm kiếm mã giảm giá
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>(filters.keyword || "");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(filters.keyword || "");
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  // Quản lý AbortController để hủy request cũ khi thay đổi từ khóa / bộ lọc
  const abortControllerRef = useRef<AbortController | null>(null);

  // Trạng thái dữ liệu phân trang từ API
  const [pageData, setPageData] = useState<PageResponse<Voucher>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: true,
  });

  // Trạng thái UI
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);
  const [voucherDetail, setVoucherDetail] = useState<AdminVoucherDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Tải danh sách voucher từ server theo các tham số bộ lọc hiện tại (Hỗ trợ Debounce 400ms & AbortSignal).
   */
  const fetchVouchers = useCallback(async () => {
    // 1. Hủy request đang bay trước đó để chống Race Condition
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const queryParams: VoucherFilterParams = {
        ...filters,
        keyword: debouncedKeyword.trim() || undefined,
      };
      const res = await voucherController.getAdminVouchers(queryParams, {
        signal: controller.signal,
      });
      if (res && res.data) {
        setPageData(res.data);
      }
    } catch (error: any) {
      if (
        controller.signal.aborted ||
        (error instanceof Error && (error.name === 'AbortError' || error.name === 'CanceledError'))
      ) {
        return; // Bỏ qua lỗi hủy request
      }
      console.error("Lỗi khi tải danh sách voucher:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedKeyword,
    filters.type,
    filters.status,
    filters.categoryScope,
    filters.sortBy,
    filters.sortDir,
    filters.page,
    filters.size,
  ]);

  // Tự động tải lại danh sách khi filters thay đổi (Kèm cleanup hủy request khi unmount)
  useEffect(() => {
    fetchVouchers();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchVouchers]);

  /**
   * Thay đổi từ khóa tìm kiếm (Tự động reset về trang 0).
   */
  const handleKeywordChange = (keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword, page: 0 }));
  };

  /**
   * Thay đổi loại voucher (FIXED, PERCENT, FREESHIP).
   */
  const handleTypeChange = (type: string) => {
    setFilters((prev) => ({ ...prev, type, page: 0 }));
  };

  /**
   * Thay đổi trạng thái (active, scheduled, expired, disabled).
   */
  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 0 }));
  };

  /**
   * Thay đổi phạm vi phân loại (ALL, FREESHIP, FASHION...).
   */
  const handleCategoryScopeChange = (categoryScope: string) => {
    setFilters((prev) => ({ ...prev, categoryScope, page: 0 }));
  };

  /**
   * Thay đổi tiêu chí sắp xếp (sortBy & sortDir).
   */
  const handleSortChange = (
    sortBy: "createdAt" | "expiresAt" | "usedCount" | "value" | "code" | "name",
    sortDir?: "ASC" | "DESC",
  ) => {
    setFilters((prev) => {
      const newDir =
        sortDir ??
        (prev.sortBy === sortBy && prev.sortDir === "DESC" ? "ASC" : "DESC");
      return { ...prev, sortBy, sortDir: newDir };
    });
  };

  /**
   * Chuyển trang.
   */
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  /**
   * Mở modal thêm mới voucher.
   */
  const handleOpenCreateModal = () => {
    setEditingVoucher(null);
    setIsFormModalOpen(true);
  };

  /**
   * Mở modal xem chi tiết toàn diện mã giảm giá và lịch sử đơn hàng áp dụng.
   */
  const handleOpenDetailModal = async (voucher: Voucher) => {
    setViewingVoucher(voucher);
    setVoucherDetail(null);
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    try {
      const res = await voucherController.getAdminVoucherDetail(voucher.id);
      if (res && res.data) {
        setVoucherDetail(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết voucher:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  /**
   * Mở modal chỉnh sửa voucher (Đóng modal xem chi tiết nếu đang mở).
   */
  const handleOpenEditModal = (voucher: Voucher) => {
    setIsDetailModalOpen(false);
    setEditingVoucher(voucher);
    setIsFormModalOpen(true);
  };

  /**
   * Mở modal xác nhận xóa voucher.
   */
  const handleOpenDeleteModal = (voucher: Voucher) => {
    setDeletingVoucher(voucher);
    setIsDeleteModalOpen(true);
  };

  /**
   * Đóng tất cả modal.
   */
  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsDetailModalOpen(false);
    setEditingVoucher(null);
    setDeletingVoucher(null);
    setViewingVoucher(null);
    setVoucherDetail(null);
  };

  /**
   * Xử lý Submit Form (Tạo mới hoặc Cập nhật).
   */
  const handleSubmitForm = async (formData: VoucherFormData) => {
    setIsSubmitting(true);
    try {
      if (editingVoucher) {
        await voucherController.updateVoucher(editingVoucher.id, formData);
      } else {
        await voucherController.createVoucher(formData);
      }
      handleCloseModals();
      fetchVouchers();
    } catch (error: any) {
      console.error("Lỗi khi lưu voucher:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Bật / Tắt trạng thái kích hoạt của voucher.
   */
  const handleToggleStatus = async (voucher: Voucher) => {
    try {
      const res = await voucherController.toggleVoucherStatus(voucher.id);
      if (res) {
        fetchVouchers();
      }
    } catch (error: any) {
      console.error("Lỗi khi đổi trạng thái mã giảm giá:", error);
    }
  };

  /**
   * Xử lý Xóa voucher.
   */
  const handleDeleteConfirm = async () => {
    if (!deletingVoucher) return;
    setIsSubmitting(true);
    try {
      await voucherController.deleteVoucher(deletingVoucher.id);
      handleCloseModals();
      fetchVouchers();
    } catch (error: any) {
      console.error("Lỗi khi xóa mã giảm giá:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { isExporting, runExport } = useExcelExport();

  /**
   * Xuất toàn bộ mã giảm giá khớp bộ lọc hiện tại (không phân trang, tối đa 5.000 dòng) ra file Excel (.xlsx).
   */
  const handleExportExcel = useCallback(() => {
    runExport(async () => {
      const res = await voucherController.exportAdminVouchers(filters);
      const rows = res.data || [];
      const dateStr = new Date().toISOString().slice(0, 10);
      await downloadStyledExcelWorkbook(`Danh_Sach_Ma_Giam_Gia_${dateStr}.xlsx`, [
        {
          sheetName: 'Ma giam gia',
          title: 'DANH SÁCH MÃ GIẢM GIÁ / VOUCHER (THEO BỘ LỌC)',
          filterSummary: `Loại: ${filters.type || 'Tất cả'} | Trạng thái: ${filters.status || 'Tất cả'} | Từ khóa: ${filters.keyword || 'Tất cả'}`,
          columns: [
            { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, i) => i + 1 },
            { header: 'Mã Voucher', key: 'code', type: 'text' },
            { header: 'Mô tả', key: 'description', type: 'text', width: 32 },
            { header: 'Loại giảm', key: 'discountType', type: 'text' },
            { header: 'Giá trị giảm', key: 'discountValue', type: 'number' },
            { header: 'Giảm tối đa', key: 'maxDiscountAmount', type: 'currency' },
            { header: 'Đơn tối thiểu', key: 'minOrderValue', type: 'currency' },
            { header: 'Đã dùng', key: 'usedCount', type: 'number' },
            { header: 'Giới hạn lượt', key: 'usageLimit', type: 'number' },
            { header: 'Ngày bắt đầu', key: 'startDate', type: 'date' },
            { header: 'Ngày kết thúc', key: 'endDate', type: 'date' },
            { header: 'Kích hoạt', key: 'isActive', type: 'text', valueGetter: (v) => (v.isActive ? 'Đang bật' : 'Đã tắt') },
          ],
          rows,
        },
      ]);
      return rows.length;
    });
  }, [filters, runExport]);

  return {
    filters,
    pageData,
    isLoading,
    isFormModalOpen,
    isDeleteModalOpen,
    isDetailModalOpen,
    editingVoucher,
    deletingVoucher,
    viewingVoucher,
    voucherDetail,
    isLoadingDetail,
    isSubmitting,
    handleKeywordChange,
    handleTypeChange,
    handleStatusChange,
    handleCategoryScopeChange,
    handleSortChange,
    handlePageChange,
    handleOpenCreateModal,
    handleOpenDetailModal,
    handleOpenEditModal,
    handleOpenDeleteModal,
    handleCloseModals,
    handleSubmitForm,
    handleToggleStatus,
    handleDeleteConfirm,
    isExporting,
    handleExportExcel,
    refresh: fetchVouchers,
  };
}
