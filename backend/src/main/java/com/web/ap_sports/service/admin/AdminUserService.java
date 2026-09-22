package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.request.admin.CreateStaffRequest;
import com.web.ap_sports.dto.request.admin.UpdateUserStatusRequest;
import com.web.ap_sports.dto.response.admin.UserAdminResponse;
import com.web.ap_sports.dto.response.admin.UserDetailAdminResponse;
import org.springframework.data.domain.Page;

public interface AdminUserService {
    Page<UserAdminResponse> getUsers(String keyword, String role, String status, String sortBy, String sortDir, int page, int size);
    UserDetailAdminResponse getUserDetail(Long id);
    UserAdminResponse updateUserStatus(Long id, UpdateUserStatusRequest request);
    UserAdminResponse createStaffAccount(CreateStaffRequest request);
}
