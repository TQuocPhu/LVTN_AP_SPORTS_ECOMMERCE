import { useState, useEffect, useCallback, useMemo } from 'react';
import { userController } from '@/controllers/user-controller';
import {
  UserAccount,
  UserFilterParams,
  CreateStaffFormData,
  UserPageResponse,
  UserStatus,
} from '@/types/user-management';

/**
 * Custom Hook quản lý toàn bộ trạng thái, bộ lọc tìm kiếm, sắp xếp và các action CRUD cho Admin User Management.
 * Tuân thủ nghiêm ngặt quy tắc Tầng 3 (Hooks), không viết logic xử lý dữ liệu vào Page hay Components.
 */
export function useAdminUsers() {
  // Trạng thái bộ lọc
  const [filters, setFilters] = useState<UserFilterParams>({
    keyword: '',
    role: 'ALL',
    status: 'ALL',
    sortBy: 'createdAt',
    sortDir: 'DESC',
    page: 0,
    size: 10,
  });

  // Trạng thái dữ liệu phân trang từ API
  const [pageData, setPageData] = useState<UserPageResponse<UserAccount>>({
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCreateStaffModalOpen, setIsCreateStaffModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  /**
   * Tải danh sách người dùng từ server theo tham số bộ lọc.
   * QUY TẮC ĐẶC BIỆT: Tài khoản ADMIN luôn đứng ở vị trí đầu tiên (#1) trong danh sách hiển thị.
   */
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userController.getAdminUsers(filters);
      if (res && res.data) {
        const rawContent = res.data.content || [];
        
        // Pin Admin account to index 0 if present in list
        const adminUsers = rawContent.filter((u) => u.role === 'ADMIN');
        const nonAdminUsers = rawContent.filter((u) => u.role !== 'ADMIN');
        const sortedContent = [...adminUsers, ...nonAdminUsers];

        setPageData({
          ...res.data,
          content: sortedContent,
        });
      }
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Các hàm thay đổi bộ lọc
  const handleKeywordChange = (keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword, page: 0 }));
  };

  const handleRoleChange = (role: string) => {
    setFilters((prev) => ({ ...prev, role, page: 0 }));
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 0 }));
  };

  const handleSortChange = (
    sortBy: 'createdAt' | 'name' | 'email' | 'role' | 'status',
    sortDir?: 'ASC' | 'DESC'
  ) => {
    setFilters((prev) => {
      const newDir =
        sortDir ?? (prev.sortBy === sortBy && prev.sortDir === 'DESC' ? 'ASC' : 'DESC');
      return { ...prev, sortBy, sortDir: newDir };
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Mở modal xem chi tiết tài khoản (Load chi tiết kèm danh sách địa chỉ giao hàng)
  const handleOpenDetailModal = async (user: UserAccount) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await userController.getAdminUserDetail(user.id);
      if (res && res.data) {
        setSelectedUser(res.data);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải chi tiết tài khoản:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Mở modal tạo tài khoản nhân viên mới
  const handleOpenCreateStaffModal = () => {
    setIsCreateStaffModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsDetailModalOpen(false);
    setIsCreateStaffModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * Thay đổi trạng thái tài khoản (Kích hoạt / Khóa / Tạm dừng).
   * Không thể đổi trạng thái tài khoản ADMIN.
   */
  const handleStatusToggle = async (user: UserAccount, targetStatus: UserStatus) => {
    if (user.role === 'ADMIN') {
      return;
    }
    try {
      const res = await userController.updateUserStatus(user.id, targetStatus);
      if (res) {
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Lỗi khi đổi trạng thái tài khoản:', error);
    }
  };

  /**
   * Submit form tạo tài khoản Nhân viên mới.
   */
  const handleCreateStaffSubmit = async (formData: CreateStaffFormData) => {
    setIsSubmitting(true);
    try {
      const res = await userController.createStaffAccount(formData);
      if (res) {
        handleCloseModals();
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Lỗi khi tạo tài khoản nhân viên:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    filters,
    pageData,
    isLoading,
    isSubmitting,
    isDetailModalOpen,
    isCreateStaffModalOpen,
    selectedUser,
    detailLoading,
    handleKeywordChange,
    handleRoleChange,
    handleStatusChange,
    handleSortChange,
    handlePageChange,
    handleOpenDetailModal,
    handleOpenCreateStaffModal,
    handleCloseModals,
    handleStatusToggle,
    handleCreateStaffSubmit,
    refresh: fetchUsers,
  };
}
