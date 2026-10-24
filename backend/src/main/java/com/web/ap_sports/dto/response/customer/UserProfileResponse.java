package com.web.ap_sports.dto.response.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO trả về thông tin Hồ sơ cá nhân của Khách hàng.
 * Bao gồm cờ `googleAccount` và `googleId` để giao diện khóa các trường không được phép sửa
 * (Ảnh đại diện, Họ tên, Email, Mật khẩu) đối với tài khoản đăng nhập bằng Google.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String avatar;
    private String address;
    private String role;
    private String status;
    private String googleId;
    private boolean googleAccount;
    private LocalDateTime createdAt;
}
