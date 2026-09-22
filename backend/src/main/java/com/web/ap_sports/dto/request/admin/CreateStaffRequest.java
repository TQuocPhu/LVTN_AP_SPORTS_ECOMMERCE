package com.web.ap_sports.dto.request.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateStaffRequest {
    @NotBlank(message = "Tên nhân viên không được để trống")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    private String phoneNumber;

    @NotBlank(message = "Vai trò không được để trống")
    private String role; // STAFF or WAREHOUSE_MANAGER
}
