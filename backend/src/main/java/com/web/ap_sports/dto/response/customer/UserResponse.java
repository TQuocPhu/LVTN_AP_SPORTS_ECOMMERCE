package com.web.ap_sports.dto.response.customer;

import com.web.ap_sports.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO an toàn trả về thông tin Người dùng cho Frontend (TUYỆT ĐỐI KHÔNG CHỨA PASSWORD).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private UserStatus status;
    private String phoneNumber;
    private String avatar;
    private String address;
    private String roleName;
    private List<String> permissions;
    private LocalDateTime emailVerifiedAt;
    private LocalDateTime createdAt;
}
