import { apiClient } from '@/services/api/client';
import { ApiResponse } from '@/types/auth';
import {
  ImportRequest,
  ImportRequestFilterParams,
  CreateImportRequestPayload,
  ApproveImportRequestPayload,
  RejectImportRequestPayload,
  PageResponse,
} from '@/types/import-request';

/**
 * Controller tầng Frontend phụ trách giao tiếp API cho Yêu Cầu Nhập Kho
 * Không xử lý trực tiếp UI, chỉ thực hiện fetch và chuẩn hóa dữ liệu
 */
export const importRequestController = {
  /**
   * Lấy danh sách yêu cầu nhập kho có phân trang và bộ lọc
   */
  async getImportRequests(params: ImportRequestFilterParams = {}): Promise<PageResponse<ImportRequest>> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (typeof params.page === 'number') searchParams.append('page', params.page.toString());
    if (typeof params.size === 'number') searchParams.append('size', params.size.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortDir) searchParams.append('sortDir', params.sortDir);

    const queryString = searchParams.toString();
    const endpoint = `/warehouse/import-requests${queryString ? `?${queryString}` : ''}`;

    const res = await apiClient.get<ApiResponse<PageResponse<ImportRequest>>>(endpoint);
    return res.data;
  },

  /**
   * Lấy số lượng yêu cầu nhập kho đang chờ phê duyệt (PENDING)
   */
  async getPendingCount(): Promise<number> {
    const res = await apiClient.get<ApiResponse<number>>('/warehouse/import-requests/pending-count', {
      suppressErrorToast: true,
    });
    return res.data ?? 0;
  },

  /**
   * Lấy thông tin chi tiết một yêu cầu nhập kho
   */
  async getImportRequestById(id: number): Promise<ImportRequest> {
    const res = await apiClient.get<ApiResponse<ImportRequest>>(`/warehouse/import-requests/${id}`);
    return res.data;
  },

  /**
   * Tạo yêu cầu nhập kho mới
   */
  async createImportRequest(payload: CreateImportRequestPayload): Promise<ImportRequest> {
    const res = await apiClient.post<ApiResponse<ImportRequest>>('/warehouse/import-requests', payload, {
      showSuccessToast: false,
      suppressErrorToast: true,
    });
    return res.data;
  },

  /**
   * Quản lý kho phê duyệt và chốt số lượng thực nhập
   */
  async approveImportRequest(id: number, payload: ApproveImportRequestPayload): Promise<ImportRequest> {
    const res = await apiClient.put<ApiResponse<ImportRequest>>(`/warehouse/import-requests/${id}/approve`, payload, {
      showSuccessToast: false,
      suppressErrorToast: true,
    });
    return res.data;
  },

  /**
   * Quản lý kho từ chối yêu cầu nhập kho kèm lý do
   */
  async rejectImportRequest(id: number, payload: RejectImportRequestPayload): Promise<ImportRequest> {
    const res = await apiClient.put<ApiResponse<ImportRequest>>(`/warehouse/import-requests/${id}/reject`, payload, {
      showSuccessToast: false,
      suppressErrorToast: true,
    });
    return res.data;
  },
};
