import { apiClient, ApiResponse } from '@/services/api-client';
import {
  SupportReport,
  ProcessSupportReportRequest,
  RejectSupportReportRequest,
} from '@/types/support-chat';

/**
 * Controller xử lý các API Phê duyệt & Quản lý Báo Cáo Vi Phạm dành cho Ban Quản Trị (Admin).
 * Tuân thủ quy chuẩn Layer Architecture: component/hook -> controller -> apiClient -> backend API.
 */
export const adminSupportReportController = {
  /**
   * Lấy danh sách toàn bộ báo cáo vi phạm đang ở trạng thái chờ duyệt (PENDING).
   */
  async getPendingReports(): Promise<ApiResponse<SupportReport[]>> {
    return apiClient.get<ApiResponse<SupportReport[]>>(
      '/admin/support-reports/pending',
      { showSuccessToast: false, suppressErrorToast: true }
    );
  },

  /**
   * Lấy thông tin chi tiết báo cáo vi phạm đang chờ duyệt của một ca hỗ trợ cụ thể.
   * @param conversationId ID của ca hỗ trợ
   */
  async getPendingReportByConversation(
    conversationId: number
  ): Promise<ApiResponse<SupportReport>> {
    return apiClient.get<ApiResponse<SupportReport>>(
      `/admin/support-reports/conversation/${conversationId}`,
      { showSuccessToast: false, suppressErrorToast: true }
    );
  },

  /**
   * Phê duyệt báo cáo vi phạm: Chuyển trạng thái báo cáo sang PROCESSED,
   * tùy chọn khóa vĩnh viễn tài khoản khách hàng (chuyển sang UserStatus.banned),
   * đóng ca hỗ trợ và gửi thông báo hệ thống qua WebSocket.
   * @param reportId ID của báo cáo
   * @param data Dữ liệu xử phạt (banCustomer, adminNote)
   */
  async processReport(
    reportId: number,
    data: ProcessSupportReportRequest
  ): Promise<ApiResponse<SupportReport>> {
    return apiClient.post<ApiResponse<SupportReport>>(
      `/admin/support-reports/${reportId}/process`,
      data,
      { showSuccessToast: true, suppressErrorToast: false }
    );
  },

  /**
   * Bác bỏ báo cáo vi phạm: Chuyển trạng thái báo cáo sang REJECTED,
   * giữ nguyên tài khoản khách hàng, giải phóng cờ chờ duyệt để ca hỗ trợ tiếp tục hoặc đóng.
   * @param reportId ID của báo cáo
   * @param data Dữ liệu bác bỏ (adminNote)
   */
  async rejectReport(
    reportId: number,
    data: RejectSupportReportRequest
  ): Promise<ApiResponse<SupportReport>> {
    return apiClient.post<ApiResponse<SupportReport>>(
      `/admin/support-reports/${reportId}/reject`,
      data,
      { showSuccessToast: true, suppressErrorToast: false }
    );
  },
};

