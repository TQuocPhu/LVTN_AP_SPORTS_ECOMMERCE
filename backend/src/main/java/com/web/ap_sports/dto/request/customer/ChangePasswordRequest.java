package com.web.ap_sports.dto.request.customer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    @NotBlank(message = "Mật khẩu cũ không được để trống")
    private String oldPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, message = "Mật khẩu mới phải có tối thiểu 8 ký tự")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
        message = "Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 chữ số"
    )
    private String newPassword;

    @NotBlank(message = "Xác nhận mật khẩu mới không được để trống")
    private String confirmPassword;
}
