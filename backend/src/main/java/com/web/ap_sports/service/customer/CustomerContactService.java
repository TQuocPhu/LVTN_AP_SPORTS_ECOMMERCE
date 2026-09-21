package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.CreateContactRequest;
import com.web.ap_sports.dto.response.customer.ContactResponse;

public interface CustomerContactService {

    /**
     * Tiếp nhận và khởi tạo liên hệ thắc mắc mới từ Khách hàng công khai.
     *
     * @param request DTO chứa name, email, phone, message
     * @return ContactResponse DTO chứa phiếu liên hệ đã khởi tạo
     */
    ContactResponse createContact(CreateContactRequest request);
}
