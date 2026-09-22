package com.web.ap_sports.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String avatar;
    private String address;
    private String role; // ADMIN, STAFF, WAREHOUSE_MANAGER, CUSTOMER
    private String status; // pending, active, banned, deleted
    private String employeeCode;
    private String activationToken;
    private LocalDateTime emailVerifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
