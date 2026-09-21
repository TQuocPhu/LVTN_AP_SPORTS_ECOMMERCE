import { apiClient, ApiResponse } from '@/services/api-client';
import { Contact, CreateContactRequest, ReplyContactRequest, ContactStatus } from '@/types/contact';
import { PaginatedResponse } from '@/types/product';

export const contactController = {

  /**
   * Khách hàng gửi form liên hệ mới (Công khai).
   */
  async submitContact(data: CreateContactRequest): Promise<ApiResponse<Contact>> {
    return apiClient.post<ApiResponse<Contact>>('/customer/contacts', data);
  },

  /**
   * Admin/Staff lấy danh sách liên hệ khách hàng phân trang & tìm kiếm.
   */
  async getContacts(
    keyword?: string,
    status?: ContactStatus | string,
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDir: 'ASC' | 'DESC' = 'DESC'
  ): Promise<ApiResponse<PaginatedResponse<Contact>>> {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);

    return apiClient.get<ApiResponse<PaginatedResponse<Contact>>>(
      `/staff/contacts?${params.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Admin/Staff lấy chi tiết 1 liên hệ theo ID.
   */
  async getContactById(id: number): Promise<ApiResponse<Contact>> {
    return apiClient.get<ApiResponse<Contact>>(`/staff/contacts/${id}`);
  },

  /**
   * Admin/Staff gửi phản hồi liên hệ và tự động phát email cho khách hàng.
   */
  async replyContact(id: number, data: ReplyContactRequest): Promise<ApiResponse<Contact>> {
    return apiClient.post<ApiResponse<Contact>>(`/staff/contacts/${id}/reply`, data);
  },
};
