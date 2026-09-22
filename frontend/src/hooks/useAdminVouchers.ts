import { useState, useEffect, useCallback } from "react";
import { voucherController } from "@/controllers/voucher-controller";
import {
  Voucher,
  VoucherFilterParams,
  VoucherFormData,
  PageResponse,
} from "@/types/voucher";
import { toast } from "sonner";

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
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Tải danh sách voucher từ server theo các tham số bộ lọc hiện tại.
   */
  const fetchVouchers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await voucherController.getAdminVouchers(filters);
      if (res && res.data) {
        setPageData(res.data);
      }
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách voucher:", error);
      // toast.error(error.message || 'Không thể tải danh sách mã giảm giá!');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Tự động tải lại danh sách khi filters thay đổi
  useEffect(() => {
    fetchVouchers();
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
   * Mở modal chỉnh sửa voucher.
   */
  const handleOpenEditModal = (voucher: Voucher) => {
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
    setEditingVoucher(null);
    setDeletingVoucher(null);
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

  return {
    filters,
    pageData,
    isLoading,
    isFormModalOpen,
    isDeleteModalOpen,
    editingVoucher,
    deletingVoucher,
    isSubmitting,
    handleKeywordChange,
    handleTypeChange,
    handleStatusChange,
    handleCategoryScopeChange,
    handleSortChange,
    handlePageChange,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleOpenDeleteModal,
    handleCloseModals,
    handleSubmitForm,
    handleToggleStatus,
    handleDeleteConfirm,
    refresh: fetchVouchers,
  };
}
