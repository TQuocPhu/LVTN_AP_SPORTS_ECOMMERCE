package com.web.ap_sports.dto.response;

import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String name,
    String email,
    String roleName,
    String status,
    String phoneNumber,
    String avatar,
    String employeeCode,
    LocalDateTime createdAt
) {}
