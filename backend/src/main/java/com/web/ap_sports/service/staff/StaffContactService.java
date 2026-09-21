package com.web.ap_sports.service.staff;

import com.web.ap_sports.dto.request.staff.ReplyContactRequest;
import com.web.ap_sports.dto.response.customer.ContactResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StaffContactService {

    /**
     * Lấy danh sách liên hệ khách hàng phân trang theo từ khóa và trạng thái.
     *
     * @param keyword  Từ khóa tìm kiếm
     * @param status   Trạng thái (pending, replied)
     * @param pageable Phân trang
     * @return Trang ContactResponse
     */
    Page<ContactResponse> getAllContacts(String keyword, String status, Pageable pageable);

    /**
     * Lấy chi tiết liên hệ khách hàng theo ID.
     *
     * @param id ID của liên hệ
     * @return ContactResponse
     */
    ContactResponse getContactById(Long id);

    /**
     * Phản hồi thắc mắc/liên hệ của Khách hàng bằng RichText HTML và tự động gửi Email.
     *
     * @param id        ID liên hệ
     * @param request   Nội dung phản hồi (replyMessage)
     * @param userEmail Email của Nhân viên/Admin phản hồi
     * @return ContactResponse đã cập nhật
     */
    ContactResponse replyContact(Long id, ReplyContactRequest request, String userEmail);
}
