package com.web.ap_sports.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {
    @NotBlank(message = "Trạng thái không được để trống")
    private String status; // pending, active, banned, deleted
}
