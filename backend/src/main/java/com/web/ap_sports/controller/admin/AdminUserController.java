package com.web.ap_sports.controller.admin;

import com.web.ap_sports.dto.request.admin.CreateStaffRequest;
import com.web.ap_sports.dto.request.admin.UpdateUserStatusRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.admin.UserAdminResponse;
import com.web.ap_sports.dto.response.admin.UserDetailAdminResponse;
import com.web.ap_sports.service.admin.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN') or hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * Lấy danh sách tài khoản người dùng có phân trang, tìm kiếm từ khóa và lọc đa tiêu chí.
     * Tài khoản ADMIN luôn đứng ở vị trí đầu tiên.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserAdminResponse>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "ALL") String role,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDir,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        Page<UserAdminResponse> userPage = adminUserService.getUsers(keyword, role, status, sortBy, sortDir, page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tài khoản người dùng thành công!", userPage));
    }

    /**
     * Lấy thông tin chi tiết cá nhân và danh sách địa chỉ giao hàng của một tài khoản.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailAdminResponse>> getUserDetail(@PathVariable Long id) {
        UserDetailAdminResponse detail = adminUserService.getUserDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin chi tiết tài khoản thành công!", detail));
    }

    /**
     * Cập nhật trạng thái tài khoản (active, banned, pending, deleted).
     * Xóa activationToken khi kích hoạt tài khoản pending -> active.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserAdminResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        UserAdminResponse updatedUser = adminUserService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái tài khoản thành công!", updatedUser));
    }

    /**
     * Tạo mới tài khoản Nhân viên (STAFF hoặc WAREHOUSE_MANAGER) với mật khẩu mặc định.
     */
    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<UserAdminResponse>> createStaffAccount(
            @Valid @RequestBody CreateStaffRequest request
    ) {
        UserAdminResponse createdStaff = adminUserService.createStaffAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tạo mới tài khoản nhân viên thành công!", createdStaff));
    }
}
