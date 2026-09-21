package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.customer.CreateContactRequest;
import com.web.ap_sports.dto.response.customer.ContactResponse;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.service.customer.CustomerContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/contacts")
@RequiredArgsConstructor
public class CustomerContactController {

    private final CustomerContactService customerContactService;

    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> createContact(
            @Valid @RequestBody CreateContactRequest request) {
        ContactResponse response = customerContactService.createContact(request);
        return ResponseEntity.ok(ApiResponse.success("Gửi thông tin liên hệ thành công. Ban quản trị sẽ phản hồi qua email của bạn sớm nhất.", response));
    }
}
