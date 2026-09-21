package com.web.ap_sports.controller.staff;

import com.web.ap_sports.dto.request.staff.ReplyContactRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.ContactResponse;
import com.web.ap_sports.service.staff.StaffContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff/contacts")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('MANAGE_CONTACTS') or hasRole('ADMIN') or hasRole('STAFF')")
public class StaffContactController {

    private final StaffContactService staffContactService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ContactResponse>>> getAllContacts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ContactResponse> result = staffContactService.getAllContacts(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách liên hệ khách hàng thành công.", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> getContactById(@PathVariable Long id) {
        ContactResponse response = staffContactService.getContactById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết thông tin liên hệ thành công.", response));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<ApiResponse<ContactResponse>> replyContact(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody ReplyContactRequest request) {
        ContactResponse response = staffContactService.replyContact(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Phản hồi liên hệ và gửi email cho khách hàng thành công.", response));
    }
}
